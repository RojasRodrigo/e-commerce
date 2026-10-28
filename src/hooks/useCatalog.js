import { useEffect, useState } from "react";
import { buildCategoriesFromProducts, fetchDolibarrProducts } from "../services/dolibarr";

export function useCatalog() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let active = true;

        const loadCatalog = async () => {
            try {
                const nextProducts = await fetchDolibarrProducts();

                if (!active) {
                    return;
                }

                setProducts(nextProducts);
                setCategories(buildCategoriesFromProducts(nextProducts));
                setError(null);
            } catch (loadError) {
                if (!active) {
                    return;
                }

                setProducts([]);
                setCategories([]);
                setError(loadError.message || "No se pudo cargar el catálogo.");
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        };

        loadCatalog();

        return () => {
            active = false;
        };
    }, []);

    return { products, categories, loading, error };
}
