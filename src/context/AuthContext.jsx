import { useCallback, useEffect, useRef, useState } from "react";
import { getCurrentUser, signOutUser } from "../services/auth";
import { AuthContext } from "./auth-context";

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const requestId = useRef(0);

    const refreshUser = useCallback(async () => {
        const currentRequestId = requestId.current + 1;
        requestId.current = currentRequestId;
        try {
            const currentUser = await getCurrentUser();
            if (requestId.current === currentRequestId) {
                setUser(currentUser);
                setError("");
            }
            return currentUser;
        } catch (loadError) {
            if (requestId.current === currentRequestId) {
                setError(loadError.message || "No se pudo verificar la sesión.");
            }
            throw loadError;
        } finally {
            if (requestId.current === currentRequestId) {
                setLoading(false);
            }
        }
    }, []);

    useEffect(() => {
        const currentRequestId = requestId.current + 1;
        requestId.current = currentRequestId;
        getCurrentUser()
            .then((currentUser) => {
                if (requestId.current === currentRequestId) {
                    setUser(currentUser);
                    setError("");
                }
            })
            .catch((loadError) => {
                if (requestId.current === currentRequestId) {
                    setError(loadError.message || "No se pudo verificar la sesión.");
                }
                console.error("No se pudo verificar la sesión:", loadError);
            })
            .finally(() => {
                if (requestId.current === currentRequestId) {
                    setLoading(false);
                }
            });
        return () => {
            if (requestId.current === currentRequestId) {
                requestId.current += 1;
            }
        };
    }, []);

    const logout = useCallback(async () => {
        requestId.current += 1;
        await signOutUser();
        setUser(null);
    }, []);

    return (
        <AuthContext.Provider value={{ user, setUser, refreshUser, logout, loading, error }}>
            {children}
        </AuthContext.Provider>
    );
}
