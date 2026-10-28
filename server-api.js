import { Buffer } from "node:buffer";
import {
    createHash,
    randomBytes,
    scryptSync,
    timingSafeEqual,
} from "node:crypto";
import { chmodSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import process from "node:process";
import { DatabaseSync } from "node:sqlite";

const apiBaseUrl = process.env.DOLIBARR_API_URL?.replace(/\/+$/, "");
const apiKey = process.env.DOLIBARR_API_KEY;
const sessionDurationSeconds = 60 * 60 * 24 * 30;
const authRateLimitWindowMs = 15 * 60 * 1000;
const authRateLimitMaximum = 10;
const authAttempts = new Map();
const customerProvisioning = new Map();
const databaseDirectory = resolve(process.env.DATA_DIR || "data");
mkdirSync(databaseDirectory, { recursive: true });
if (!process.env.DATA_DIR) {
    chmodSync(databaseDirectory, 0o700);
}

const databasePath = resolve(databaseDirectory, "technova.sqlite");
const database = new DatabaseSync(databasePath);
chmodSync(databasePath, 0o600);
database.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA busy_timeout = 5000;
    PRAGMA foreign_keys = ON;
    CREATE TABLE IF NOT EXISTS accounts (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE COLLATE NOCASE,
        password_salt TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        dolibarr_id TEXT NOT NULL,
        created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS sessions (
        token_hash TEXT PRIMARY KEY,
        account_id INTEGER NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
        expires_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS sessions_account_id ON sessions(account_id);
`);
database.exec("DELETE FROM sessions WHERE expires_at <= unixepoch()");

class ApiError extends Error {
    constructor(status, message) {
        super(message);
        this.status = status;
    }
}

function sendJson(response, status, payload, headers = {}) {
    response.writeHead(status, {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store",
        ...headers,
    });
    response.end(JSON.stringify(payload));
}

async function readJsonBody(request, maximumBytes = 32 * 1024) {
    const chunks = [];
    let bytes = 0;
    for await (const chunk of request) {
        bytes += chunk.length;
        if (bytes > maximumBytes) {
            throw new ApiError(413, "El cuerpo de la solicitud supera el tamaño permitido.");
        }
        chunks.push(chunk);
    }

    try {
        return JSON.parse(Buffer.concat(chunks).toString("utf8"));
    } catch {
        throw new ApiError(400, "El cuerpo de la solicitud no contiene JSON válido.");
    }
}

function requireSameOrigin(request) {
    const origin = request.headers.origin;
    if (!origin) {
        return;
    }

    let originHost;
    try {
        originHost = new URL(origin).host;
    } catch {
        throw new ApiError(403, "Origen de solicitud no permitido.");
    }

    if (originHost !== request.headers.host) {
        throw new ApiError(403, "Origen de solicitud no permitido.");
    }
}

function enforceAuthRateLimit(request, action) {
    const now = Date.now();
    if (authAttempts.size > 1000) {
        for (const [attemptKey, attempt] of authAttempts) {
            if (now - attempt.startedAt >= authRateLimitWindowMs) {
                authAttempts.delete(attemptKey);
            }
        }
        while (authAttempts.size > 1000) {
            authAttempts.delete(authAttempts.keys().next().value);
        }
    }
    const key = `${request.socket.remoteAddress || "unknown"}:${action}`;
    const previous = authAttempts.get(key);
    if (!previous || now - previous.startedAt >= authRateLimitWindowMs) {
        authAttempts.set(key, { startedAt: now, count: 1 });
        return;
    }
    if (previous.count >= authRateLimitMaximum) {
        throw new ApiError(429, "Demasiados intentos. Espera unos minutos y vuelve a intentarlo.");
    }
    previous.count += 1;
}

function getCookie(request, name) {
    const cookieHeader = request.headers.cookie || "";
    const cookie = cookieHeader.split(";").map((part) => part.trim())
        .find((part) => part.startsWith(`${name}=`));
    return cookie?.slice(name.length + 1) || null;
}

function sessionCookie(token, request, maxAge = sessionDurationSeconds) {
    const forwardedProtocol = process.env.NODE_ENV === "production"
        || request.headers["x-forwarded-proto"]?.split(",")[0]?.trim() === "https";
    const secure = forwardedProtocol ? "; Secure" : "";
    return `technova_session=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${maxAge}${secure}`;
}

function publicAccount(account) {
    return {
        id: String(account.id),
        name: account.name,
        email: account.email,
        dolibarrLinked: /^\d+$/.test(String(account.dolibarr_id || "")),
        createdAt: account.created_at,
    };
}

function hashSessionToken(token) {
    return createHash("sha256").update(token).digest("hex");
}

function createSession(accountId) {
    const token = randomBytes(32).toString("hex");
    const expiresAt = Math.floor(Date.now() / 1000) + sessionDurationSeconds;
    database.prepare(
        "INSERT INTO sessions (token_hash, account_id, expires_at) VALUES (?, ?, ?)"
    ).run(hashSessionToken(token), accountId, expiresAt);
    return token;
}

function getAuthenticatedAccount(request) {
    const token = getCookie(request, "technova_session");
    if (!token || !/^[\da-f]{64}$/i.test(token)) {
        return null;
    }

    const account = database.prepare(`
        SELECT accounts.id, accounts.name, accounts.email, accounts.dolibarr_id, accounts.created_at
        FROM sessions
        JOIN accounts ON accounts.id = sessions.account_id
        WHERE sessions.token_hash = ? AND sessions.expires_at > unixepoch()
    `).get(hashSessionToken(token));
    return account ?? null;
}

async function dolibarrRequest(route, options = {}) {
    if (!apiBaseUrl || !apiKey) {
        throw new ApiError(503, "La integración con Dolibarr no está configurada en el servidor.");
    }

    const url = new URL(`${apiBaseUrl}${route}`);
    const response = await fetch(url, {
        ...options,
        headers: {
            Accept: "application/json",
            DOLAPIKEY: apiKey,
            ...(options.body ? { "Content-Type": "application/json" } : {}),
            ...options.headers,
        },
        signal: AbortSignal.timeout(20_000),
    });

    const responseText = await response.text();
    let payload = null;
    if (responseText) {
        try {
            payload = JSON.parse(responseText);
        } catch {
            payload = responseText;
        }
    }

    if (!response.ok) {
        const upstreamMessage = typeof payload === "object" && payload
            ? payload.message ?? payload.error?.message
            : null;
        const message = response.status === 403
            ? "Dolibarr denegó la operación. Verifica los permisos del usuario API para el módulo solicitado."
            : upstreamMessage || `Dolibarr respondió con el estado ${response.status}.`;
        throw new ApiError(response.status === 403 ? 502 : 502, message);
    }

    return payload;
}

function authenticatePassword(password, salt, expectedHash) {
    const actualHash = scryptSync(password, Buffer.from(salt, "hex"), 64);
    const expected = Buffer.from(expectedHash, "hex");
    return expected.length === actualHash.length && timingSafeEqual(actualHash, expected);
}

async function createDolibarrCustomer(name, email) {
    const created = await dolibarrRequest("/thirdparties", {
        method: "POST",
        body: JSON.stringify({ name, email, client: 1, status: 1 }),
    });
    const customerId = created?.id ?? created?.rowid ?? created;
    if (!customerId || !/^\d+$/.test(String(customerId))) {
        throw new ApiError(502, "Dolibarr no devolvió un identificador válido para el tercero creado.");
    }
    return String(customerId);
}

async function ensureDolibarrCustomer(account) {
    if (/^\d+$/.test(String(account.dolibarr_id || ""))) {
        return account;
    }

    let provisioning = customerProvisioning.get(account.id);
    if (!provisioning) {
        provisioning = (async () => {
            const dolibarrId = await createDolibarrCustomer(account.name, account.email);
            database.prepare("UPDATE accounts SET dolibarr_id = ? WHERE id = ? AND dolibarr_id = ''")
                .run(dolibarrId, account.id);
            return database.prepare(`
                SELECT id, name, email, dolibarr_id, created_at FROM accounts WHERE id = ?
            `).get(account.id);
        })();
        customerProvisioning.set(account.id, provisioning);
    }

    try {
        return await provisioning;
    } finally {
        if (customerProvisioning.get(account.id) === provisioning) {
            customerProvisioning.delete(account.id);
        }
    }
}

async function register(request, response) {
    requireSameOrigin(request);
    const body = await readJsonBody(request);
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";
    enforceAuthRateLimit(request, `register:${email}`);

    if (!name || name.length > 160 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
        || email.length > 254 || password.length < 8 || password.length > 256) {
        throw new ApiError(400, "Ingresa un nombre y correo válidos, y una contraseña de entre 8 y 256 caracteres.");
    }
    if (database.prepare("SELECT 1 FROM accounts WHERE email = ?").get(email)) {
        throw new ApiError(409, "Ya existe una cuenta con ese correo. Inicia sesión.");
    }

    const dolibarrId = await createDolibarrCustomer(name, email);
    const salt = randomBytes(16);
    const passwordHash = scryptSync(password, salt, 64);
    const createdAt = new Date().toISOString();
    let accountId;
    try {
        const result = database.prepare(`
            INSERT INTO accounts (name, email, password_salt, password_hash, dolibarr_id, created_at)
            VALUES (?, ?, ?, ?, ?, ?)
        `).run(name, email, salt.toString("hex"), passwordHash.toString("hex"), dolibarrId, createdAt);
        accountId = Number(result.lastInsertRowid);
    } catch (error) {
        if (error.message?.includes("UNIQUE constraint failed: accounts.email")) {
            throw new ApiError(409, "Ya existe una cuenta con ese correo. Inicia sesión.");
        }
        throw error;
    }
    const account = database.prepare(
        "SELECT id, name, email, dolibarr_id, created_at FROM accounts WHERE id = ?"
    ).get(accountId);
    const sessionToken = createSession(accountId);
    sendJson(response, 201, { user: publicAccount(account) }, {
        "Set-Cookie": sessionCookie(sessionToken, request),
    });
}

async function login(request, response) {
    requireSameOrigin(request);
    const body = await readJsonBody(request);
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";
    enforceAuthRateLimit(request, `login:${email}`);
    if (password.length > 256) {
        throw new ApiError(400, "La contraseña no puede superar los 256 caracteres.");
    }
    const account = database.prepare("SELECT * FROM accounts WHERE email = ?").get(email);

    if (!account || !authenticatePassword(password, account.password_salt, account.password_hash)) {
        throw new ApiError(401, "Correo o contraseña incorrectos.");
    }

    const token = createSession(account.id);
    sendJson(response, 200, { user: publicAccount(account) }, {
        "Set-Cookie": sessionCookie(token, request),
    });
}

function getDolibarrCollection(payload) {
    if (Array.isArray(payload)) {
        return payload;
    }
    const rows = payload?.data ?? payload?.rows ?? payload?.values ?? payload?.orders ?? payload?.invoices;
    if (!Array.isArray(rows)) {
        throw new ApiError(502, "Dolibarr devolvió una respuesta inesperada.");
    }
    return rows;
}

function pickPublicFields(records, fields) {
    return records.map((record) => Object.fromEntries(
        fields
            .filter((field) => record?.[field] !== undefined && record?.[field] !== null)
            .map((field) => [field, record[field]])
    ));
}

async function getCustomerCollection(account, resource) {
    if (!/^\d+$/.test(String(account.dolibarr_id))) {
        throw new ApiError(409, "La cuenta no tiene un cliente válido vinculado en Dolibarr.");
    }
    const sqlfilter = encodeURIComponent(`(t.fk_soc:=:'${account.dolibarr_id}')`);
    const records = [];
    let page = 0;
    let pageCount = 1;
    while (page < pageCount) {
        const payload = await dolibarrRequest(
            `/${resource}?limit=100&page=${page}&sortfield=t.rowid&sortorder=DESC&sqlfilters=${sqlfilter}&pagination_data=true`
        );
        records.push(...getDolibarrCollection(payload));
        pageCount = Math.max(1, Number(payload?.pagination?.page_count) || 1);
        page += 1;
    }
    return records;
}

function productStock(product) {
    for (const key of ["stock_reel", "stock_real", "stock"]) {
        const value = Number(product?.[key]);
        if (product?.[key] !== null && product?.[key] !== undefined
            && product?.[key] !== "" && Number.isFinite(value)) {
            return value;
        }
    }
    return null;
}

async function createOrder(request, response, account) {
    requireSameOrigin(request);
    if (!/^\d+$/.test(String(account.dolibarr_id))) {
        throw new ApiError(409, "Tu cuenta aún no está vinculada a un cliente de Dolibarr. Contacta al administrador para habilitar las compras.");
    }
    const body = await readJsonBody(request);
    if (!Array.isArray(body.items) || body.items.length < 1 || body.items.length > 100) {
        throw new ApiError(400, "El pedido debe contener entre 1 y 100 productos.");
    }

    const lines = [];
    for (const item of body.items) {
        const productId = Number(item?.id);
        const quantity = Number(item?.quantity);
        if (!Number.isInteger(productId) || productId <= 0
            || !Number.isInteger(quantity) || quantity <= 0 || quantity > 1000) {
            throw new ApiError(400, "El pedido contiene un producto o una cantidad inválidos.");
        }

        const product = await dolibarrRequest(`/products/${productId}?include_stock=1`);
        const stock = productStock(product);
        if (stock === null) {
            throw new ApiError(503, "Dolibarr no devolvió las existencias del producto. Verifica que el módulo de stock esté activo y que el usuario API pueda consultar existencias.");
        }
        if (stock < quantity) {
            const productName = product.label ?? product.name ?? `Producto ${productId}`;
            throw new ApiError(409, `Existencias insuficientes para "${productName}". Disponibles: ${Math.max(0, stock)}.`);
        }

        const rawPrice = product.price ?? product.price_min;
        const subprice = Number(rawPrice);
        const taxRate = Number(product.tva_tx ?? 0);
        if (rawPrice === null || rawPrice === undefined || rawPrice === ""
            || !Number.isFinite(subprice) || subprice < 0
            || !Number.isFinite(taxRate) || taxRate < 0) {
            throw new ApiError(502, `Dolibarr no devolvió un precio válido para el producto ${productId}.`);
        }
        lines.push({
            fk_product: productId,
            qty: quantity,
            subprice,
            tva_tx: taxRate,
            desc: product.label ?? product.name ?? "",
            product_type: Number(product.type ?? 0),
        });
    }

    const createdOrder = await dolibarrRequest("/orders", {
        method: "POST",
        body: JSON.stringify({
            socid: Number(account.dolibarr_id),
            date: Math.floor(Date.now() / 1000),
            type: 0,
            lines,
            note_public: "Pedido generado desde TechNova.",
        }),
    });
    sendJson(response, 201, { order: createdOrder });
}

export async function handleApiRequest(request, response, requestUrl) {
    if (!requestUrl.pathname.startsWith("/api/")) {
        return false;
    }

    try {
        const route = requestUrl.pathname;
        if (request.method === "GET" && route === "/api/dolibarr/status") {
            const products = getDolibarrCollection(
                await dolibarrRequest("/products?limit=1")
            );
            sendJson(response, 200, {
                connected: true,
                message: "Conexión correcta con Dolibarr.",
                sampleProducts: products.length,
            });
            return true;
        }
        if (request.method === "POST" && route === "/api/auth/register") {
            await register(request, response);
            return true;
        }
        if (request.method === "POST" && route === "/api/auth/login") {
            await login(request, response);
            return true;
        }
        if (request.method === "POST" && route === "/api/auth/logout") {
            requireSameOrigin(request);
            const token = getCookie(request, "technova_session");
            if (token) {
                database.prepare("DELETE FROM sessions WHERE token_hash = ?").run(hashSessionToken(token));
            }
            sendJson(response, 200, { success: true }, {
                "Set-Cookie": sessionCookie("", request, 0),
            });
            return true;
        }

        const account = getAuthenticatedAccount(request);
        if (route === "/api/auth/me" && request.method === "GET") {
            if (!account) {
                sendJson(response, 401, { message: "Inicia sesión para continuar." });
            } else {
                const currentAccount = apiBaseUrl && apiKey
                    ? await ensureDolibarrCustomer(account)
                    : account;
                sendJson(response, 200, { user: publicAccount(currentAccount) });
            }
            return true;
        }
        if (!account) {
            throw new ApiError(401, "Inicia sesión para consultar esta información.");
        }
        if (route === "/api/orders" && request.method === "GET") {
            const orders = await getCustomerCollection(account, "orders");
            sendJson(response, 200, {
                orders: pickPublicFields(orders, [
                    "id", "rowid", "ref", "ref_client", "status", "statut",
                    "status_label", "statut_libelle", "date", "date_creation",
                    "date_commande", "total_ttc", "total",
                ]),
            });
            return true;
        }
        if (route === "/api/invoices" && request.method === "GET") {
            const invoices = await getCustomerCollection(account, "invoices");
            sendJson(response, 200, {
                invoices: pickPublicFields(invoices, [
                    "id", "rowid", "ref", "ref_client", "status", "statut",
                    "statut_libelle", "datef", "date_creation", "date",
                    "total_ttc", "total", "paye", "paid",
                    "remaintopay", "amount_remaining", "remain_to_pay",
                ]),
            });
            return true;
        }
        if (route === "/api/orders" && request.method === "POST") {
            await createOrder(request, response, account);
            return true;
        }

        sendJson(response, 404, { message: "Ruta no encontrada." });
        return true;
    } catch (error) {
        if (!(error instanceof ApiError)) {
            console.error("API request failed:", error);
        }
        sendJson(response, error.status ?? 502, {
            message: error.message || "No se pudo completar la solicitud.",
        });
        return true;
    }
}
