import { products as fallbackProducts } from "../data/products";

const dolibarrConfigured = import.meta.env.DOLIBARR_ENABLED;
const apiPath = "/dolibarr";

const toNumber = (value) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
};

async function requestDolibarr(path, options = {}) {
    const response = await fetch(`${apiPath}/${path}`, {
        ...options,
        headers: {
            Accept: "application/json",
            ...(options.body ? { "Content-Type": "application/json" } : {}),
            ...options.headers,
        },
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
        let message = typeof payload === "object" && payload
            ? payload.message ?? payload.error?.message ?? payload.error
            : payload;

        if (response.status === 403 && path.startsWith("products")) {
            message = "Dolibarr autenticó la API key, pero denegó el catálogo. Habilita Productos/Servicios y concede al usuario API permiso de lectura de productos.";
        } else if (response.status === 403 && path.startsWith("thirdparties")) {
            message = "Dolibarr autenticó la API key, pero denegó la operación con terceros. Habilita Terceros y concede al usuario API permiso para crear terceros.";
        } else if (response.status === 403 && path.startsWith("contacts")) {
            message = "Dolibarr autenticó la API key, pero denegó la búsqueda de contactos. Habilita Contactos/Adherentes y concede al usuario API permiso de lectura de contactos.";
        } else if (response.status === 403 && path.startsWith("orders")) {
            message = "Dolibarr autenticó la API key, pero denegó la creación del pedido. Habilita Pedidos de clientes y concede al usuario API permiso para crear pedidos.";
        }

        throw new Error(message || `Dolibarr respondió con el estado ${response.status}.`);
    }

    return payload;
}

const isTruthy = (value) => value === true || value === 1 || value === "1";
const firstAvailableNumber = (...values) => {
    const value = values.find((candidate) => candidate !== null
        && candidate !== undefined && candidate !== "");
    if (value === undefined) {
        return null;
    }
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
};

export const normalizeDolibarrProduct = (rawProduct, index = 0) => {
    const name = rawProduct?.label
        ?? rawProduct?.name
        ?? rawProduct?.product_label
        ?? rawProduct?.product?.label
        ?? `Producto ${index + 1}`;
    const category = rawProduct?.category?.label
        ?? rawProduct?.category?.name
        ?? rawProduct?.categorie?.label
        ?? rawProduct?.category_name
        ?? rawProduct?.current_category
        ?? rawProduct?.categories?.[0]?.label
        ?? rawProduct?.categories?.[0]?.name
        ?? rawProduct?.product?.category
        ?? "General";
    const price = toNumber(
        rawProduct?.price_ttc
        ?? rawProduct?.product?.price_ttc
        ?? rawProduct?.price
        ?? rawProduct?.total_ttc
        ?? rawProduct?.selling_price
        ?? rawProduct?.price_base_type
        ?? 0
    );
    const priceExcludingTax = toNumber(
        rawProduct?.price
        ?? rawProduct?.product?.price
        ?? rawProduct?.price_min
        ?? price
    );
    const productId = rawProduct?.id ?? rawProduct?.rowid ?? rawProduct?.product?.id;
    const image = rawProduct?.image_url
        ?? rawProduct?.photo_url
        ?? rawProduct?.image
        ?? rawProduct?.photo
        ?? null;

    return {
        id: String(productId ?? rawProduct?.ref ?? `${name}-${index}`),
        name: String(name),
        reference: String(rawProduct?.ref ?? rawProduct?.product?.ref ?? ""),
        description: String(rawProduct?.description ?? rawProduct?.product?.description ?? ""),
        price,
        priceExcludingTax,
        taxRate: toNumber(rawProduct?.tva_tx ?? rawProduct?.product?.tva_tx ?? 0),
        stock: firstAvailableNumber(
            rawProduct?.stock_reel,
            rawProduct?.stock_real,
            rawProduct?.stock,
            rawProduct?.product?.stock_reel,
            rawProduct?.product?.stock_real,
            rawProduct?.product?.stock
        ),
        imageUrl: typeof image === "string" && (/^https?:\/\//i.test(image) || image.startsWith("/"))
            ? image
            : null,
        category: String(category),
        onSale: isTruthy(rawProduct?.on_sale ?? rawProduct?.onSale ?? rawProduct?.is_discounted),
    };
};

export const normalizeDolibarrProducts = (payload) => {
    const data = Array.isArray(payload)
        ? payload
        : payload?.products ?? payload?.data ?? payload?.rows ?? payload?.values ?? [];

    if (!Array.isArray(data)) {
        return [];
    }

    return data.map((item, index) => normalizeDolibarrProduct(item, index));
};

export const buildCategoriesFromProducts = (productList = []) => {
    return [...new Set(productList.map((product) => product.category).filter(Boolean))];
};

export async function fetchDolibarrProducts() {
    if (!dolibarrConfigured) {
        return [...fallbackProducts];
    }

    const products = [];
    let page = 0;
    let pageCount = 1;

    while (page < pageCount) {
        const payload = await requestDolibarr(
            `products?limit=100&page=${page}&pagination_data=true&includestockdata=1`
        );
        products.push(...normalizeDolibarrProducts(payload));
        pageCount = Math.max(1, toNumber(payload?.pagination?.page_count) || 1);
        page += 1;
    }

    const categoriesPayload = await requestDolibarr("categories?type=0&limit=100");
    const categories = Array.isArray(categoriesPayload) ? categoriesPayload : [];
    const productCategories = await Promise.all(categories.map(async (category) => {
        const categoryId = category?.id ?? category?.rowid;
        if (!categoryId) {
            return [];
        }

        const categoryProducts = await requestDolibarr(
            `categories/${encodeURIComponent(categoryId)}/objects?type=product`
        );
        if (!Array.isArray(categoryProducts)) {
            return [];
        }

        return categoryProducts.map((product) => [
            String(product?.id ?? product?.rowid ?? ""),
            String(category.label ?? category.name ?? "General"),
        ]);
    }));
    const categoryByProductId = new Map(productCategories.flat());

    return products.map((product) => ({
        ...product,
        category: categoryByProductId.get(product.id) ?? product.category,
    }));
}

export async function checkDolibarrConnection() {
    const response = await fetch("/api/dolibarr/status", {
        headers: { Accept: "application/json" },
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok) {
        throw new Error(payload?.message || "No se pudo conectar con Dolibarr.");
    }
    return payload;
}

export async function createDolibarrOrder(orderPayload) {
    const response = await fetch("/api/orders", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
            items: (orderPayload.items ?? []).map(({ id, quantity }) => ({ id, quantity })),
        }),
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok) {
        throw new Error(payload?.message || "No se pudo completar el pedido.");
    }
    return { success: true, source: "dolibarr", response: payload.order };
}

async function fetchCustomerCollection(resource, key) {
    const response = await fetch(`/api/${resource}`, {
        credentials: "same-origin",
        headers: { Accept: "application/json" },
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok) {
        throw new Error(payload?.message || `No se pudieron consultar ${resource}.`);
    }
    const rows = payload?.[key];
    if (!Array.isArray(rows)) {
        throw new Error(`Dolibarr devolvió una respuesta inesperada para ${resource}.`);
    }
    return rows;
}

export function fetchCustomerOrders() {
    return fetchCustomerCollection("orders", "orders");
}

export function fetchCustomerInvoices() {
    return fetchCustomerCollection("invoices", "invoices");
}
