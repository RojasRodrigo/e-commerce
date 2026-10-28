import { Buffer } from "node:buffer";
import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, resolve, sep } from "node:path";
import process from "node:process";
import { pipeline } from "node:stream/promises";
import { handleApiRequest } from "./server-api.js";

const port = Number(process.env.PORT || 4173);
const apiBaseUrl = process.env.DOLIBARR_API_URL?.replace(/\/+$/, "");
const apiKey = process.env.DOLIBARR_API_KEY;
const apiOnly = process.argv.includes("--api-only");
const distDirectory = resolve("dist");
const mimeTypes = {
    ".css": "text/css; charset=utf-8",
    ".html": "text/html; charset=utf-8",
    ".ico": "image/x-icon",
    ".js": "text/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".png": "image/png",
    ".svg": "image/svg+xml",
    ".webp": "image/webp",
};
const allowedDolibarrRoutes = new Map([
    ["GET /products", "GET"],
    ["GET /categories", "GET"],
]);

if (!apiOnly && (!apiBaseUrl || !apiKey)) {
    throw new Error("DOLIBARR_API_URL y DOLIBARR_API_KEY son obligatorias para iniciar el servidor.");
}

if (!apiOnly && !existsSync(resolve(distDirectory, "index.html"))) {
    throw new Error("No existe dist/index.html. Ejecuta npm run build antes de iniciar el servidor.");
}

async function proxyDolibarr(request, response, requestUrl) {
    const route = requestUrl.pathname.replace(/^\/dolibarr/, "");
    const categoryObjectsMatch = route.match(/^\/categories\/(\d+)\/objects$/);
    const method = allowedDolibarrRoutes.get(`${request.method} ${route}`)
        ?? (request.method === "GET" && categoryObjectsMatch ? "GET" : null);

    if (!method) {
        response.writeHead(404, { "Content-Type": "application/json; charset=utf-8" });
        response.end(JSON.stringify({ message: "Ruta de Dolibarr no permitida." }));
        return;
    }

    const upstreamUrl = new URL(`${apiBaseUrl}${route}`);
    if (route === "/products") {
        const requestedLimit = Number(requestUrl.searchParams.get("limit") || 100);
        const requestedPage = Number(requestUrl.searchParams.get("page") || 0);
        upstreamUrl.searchParams.set("limit", String(
            Number.isInteger(requestedLimit) ? Math.min(Math.max(requestedLimit, 1), 100) : 100
        ));
        upstreamUrl.searchParams.set("page", String(
            Number.isInteger(requestedPage) ? Math.max(requestedPage, 0) : 0
        ));
        if (requestUrl.searchParams.get("pagination_data") === "true") {
            upstreamUrl.searchParams.set("pagination_data", "true");
        }
        if (requestUrl.searchParams.get("includestockdata") === "1"
            || requestUrl.searchParams.get("includestock") === "1"
            || requestUrl.searchParams.get("include_stock") === "1") {
            upstreamUrl.searchParams.set("includestockdata", "1");
        }
    } else if (route === "/categories") {
        upstreamUrl.searchParams.set("type", "0");
        upstreamUrl.searchParams.set("limit", "100");
    } else if (categoryObjectsMatch) {
        upstreamUrl.searchParams.set("type", "product");
    }

    const headers = { Accept: "application/json", DOLAPIKEY: apiKey };

    const upstreamResponse = await fetch(upstreamUrl, {
        method,
        headers,
        signal: AbortSignal.timeout(20_000),
    });
    const responseBody = await upstreamResponse.arrayBuffer();
    response.writeHead(upstreamResponse.status, {
        "Content-Type": upstreamResponse.headers.get("content-type") || "application/json; charset=utf-8",
        "Cache-Control": "no-store",
    });
    response.end(Buffer.from(responseBody));
}

async function serveStatic(request, response, requestUrl) {
    if (request.method !== "GET" && request.method !== "HEAD") {
        response.writeHead(405, { Allow: "GET, HEAD" });
        response.end();
        return;
    }

    let pathname;
    try {
        pathname = decodeURIComponent(requestUrl.pathname);
    } catch {
        response.writeHead(400);
        response.end();
        return;
    }

    const requestedPath = pathname === "/" ? "index.html" : pathname.replace(/^\/+/, "");
    let filePath = resolve(distDirectory, requestedPath);
    if (filePath !== distDirectory && !filePath.startsWith(`${distDirectory}${sep}`)) {
        response.writeHead(403);
        response.end();
        return;
    }

    if (!existsSync(filePath) || !statSync(filePath).isFile()) {
        filePath = resolve(distDirectory, "index.html");
    }

    response.writeHead(200, {
        "Content-Type": mimeTypes[extname(filePath)] || "application/octet-stream",
        "X-Content-Type-Options": "nosniff",
    });
    if (request.method === "HEAD") {
        response.end();
        return;
    }
    await pipeline(createReadStream(filePath), response);
}

const server = createServer(async (request, response) => {
    const requestUrl = new URL(request.url || "/", `http://${request.headers.host || "localhost"}`);

    try {
        if (await handleApiRequest(request, response, requestUrl)) {
            return;
        }
        if (requestUrl.pathname.startsWith("/dolibarr/")) {
            await proxyDolibarr(request, response, requestUrl);
            return;
        }
        if (apiOnly) {
            response.writeHead(404);
            response.end();
            return;
        }
        await serveStatic(request, response, requestUrl);
    } catch (error) {
        console.error("Request failed:", error);
        if (!response.headersSent) {
            const status = error.message.includes("supera el tamaño permitido") ? 413
                : error.message.includes("JSON") || error.message.includes("pedido") || error.message.includes("cliente") ? 400
                    : 502;
            response.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
            response.end(JSON.stringify({ message: status === 502 ? "No se pudo completar la solicitud con Dolibarr." : error.message }));
        } else {
            response.destroy(error);
        }
    }
});

server.listen(port, "0.0.0.0", () => {
    console.log(apiOnly
        ? `TechNova API lista en el puerto ${port}.`
        : `TechNova listo en el puerto ${port}.`);
});
