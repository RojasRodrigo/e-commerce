async function requestAuth(path, options = {}) {
    const response = await fetch(`/api/auth/${path}`, {
        ...options,
        credentials: "same-origin",
        headers: {
            Accept: "application/json",
            ...(options.body ? { "Content-Type": "application/json" } : {}),
            ...options.headers,
        },
    });
    const payload = await response.json().catch(() => null);

    if (!response.ok) {
        throw new Error(payload?.message || "No se pudo completar la operación.");
    }

    return payload;
}

export async function getCurrentUser() {
    const response = await fetch("/api/auth/me", {
        credentials: "same-origin",
        headers: { Accept: "application/json" },
    });
    const payload = await response.json().catch(() => null);

    if (response.status === 401) {
        return null;
    }
    if (!response.ok) {
        throw new Error(payload?.message || "No se pudo verificar la sesión.");
    }
    return payload.user;
}

export async function registerUser({ name, email, password }) {
    const result = await requestAuth("register", {
        method: "POST",
        body: JSON.stringify({ name, email, password }),
    });
    return result.user;
}

export async function loginUser({ email, password }) {
    const result = await requestAuth("login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
    });
    return result.user;
}

export async function signOutUser() {
    await requestAuth("logout", { method: "POST" });
}
