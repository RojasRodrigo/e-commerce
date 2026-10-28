import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import NavBar from "../components/NavBar";
import { useCart } from "../context/useCart";
import { formatPrice } from "../data/products";
import { checkDolibarrConnection } from "../services/dolibarr";
import { useCatalog } from "../hooks/useCatalog";

export default function Productos() {
    const [searchParams] = useSearchParams();
    const initialSearch = searchParams.get("busqueda") ?? "";
    const [search, setSearch] = useState(initialSearch);
    const [sortByPrice, setSortByPrice] = useState(searchParams.get("orden") === "precio");
    const [connectionMessage, setConnectionMessage] = useState("");
    const [checkingConnection, setCheckingConnection] = useState(false);
    const navigate = useNavigate();
    const { addItem } = useCart();
    const { products, categories, loading, error } = useCatalog();
    const selectedCategory = searchParams.get("categoria");
    const showOffers = searchParams.get("ofertas") === "true";

    const filteredProducts = useMemo(() => {
        const term = search.trim().toLowerCase();
        return products
            .filter((product) => !term || `${product.name} ${product.reference} ${product.description}`.toLowerCase().includes(term))
            .filter((product) => !selectedCategory || product.category === selectedCategory)
            .filter((product) => !showOffers || product.onSale)
            .sort((first, second) => sortByPrice ? first.price - second.price : 0);
    }, [products, search, selectedCategory, showOffers, sortByPrice]);

    const addToCart = (product) => {
        addItem(product);
        navigate("/carrito");
    };

    const handleCheckConnection = async () => {
        setCheckingConnection(true);
        setConnectionMessage("");
        try {
            const result = await checkDolibarrConnection();
            setConnectionMessage(`${result.message} Productos de prueba recibidos: ${result.sampleProducts}.`);
        } catch (connectionError) {
            setConnectionMessage(connectionError.message || "No se pudo conectar con Dolibarr.");
        } finally {
            setCheckingConnection(false);
        }
    };

    const pageTitle = showOffers ? "Ofertas" : selectedCategory ?? "Productos";

    return (
        <>
            <NavBar value={search || initialSearch} onSearch={setSearch} />
            <main className="mx-auto max-w-[1440px] px-4 pb-10 pt-8 sm:px-6 lg:px-8">
                <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
                    <div>
                        <h1 className="text-4xl font-black tracking-tight text-slate-900">{pageTitle}</h1>
                        {(selectedCategory || showOffers || initialSearch) && (
                            <Link to="/productos" className="mt-2 inline-block text-sm font-medium text-blue-600 hover:underline">Quitar filtros y ver todo</Link>
                        )}
                    </div>
                    <div className="flex flex-wrap items-center gap-4">
                        <button
                            type="button"
                            onClick={handleCheckConnection}
                            disabled={checkingConnection}
                            className="rounded-lg border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50 disabled:opacity-60"
                        >
                            {checkingConnection ? "Probando conexión..." : "Probar conexión API"}
                        </button>
                        <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                            <input type="checkbox" checked={sortByPrice} onChange={(event) => setSortByPrice(event.target.checked)} className="h-4 w-4 accent-blue-600" />
                            Ordenar por precio
                        </label>
                    </div>
                </div>

                {connectionMessage && (
                    <p role="status" className="mb-5 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
                        {connectionMessage}
                    </p>
                )}

                <div className="flex flex-col gap-8 md:flex-row">
                    <aside className="h-fit w-full rounded-xl border border-slate-200 bg-[#f5f5f5] p-5 shadow-sm md:w-[260px]">
                        <h2 className="mb-4 text-base font-bold text-slate-900">Categorías</h2>
                        <ul className="space-y-2 text-sm text-slate-700">
                            {categories.map((category) => (
                                <li key={category}>
                                    <Link
                                        to={`/productos?categoria=${encodeURIComponent(category)}`}
                                        aria-current={selectedCategory === category ? "page" : undefined}
                                        className={`block rounded-md px-2 py-1 hover:bg-blue-50 hover:text-blue-700 ${selectedCategory === category ? "bg-blue-50 font-semibold text-blue-700" : ""}`}
                                    >
                                        {category}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                        <Link to="/categorias" className="mt-5 inline-block text-sm font-semibold text-blue-600 hover:underline">Todas las categorías</Link>
                    </aside>

                    <section className="min-w-0 flex-1" aria-label={pageTitle}>
                        {error && (
                            <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                                {error}
                            </div>
                        )}
                        {loading ? (
                            <div className="rounded-xl border border-slate-200 bg-white p-6 text-slate-500">Cargando catalogo...</div>
                        ) : products.length === 0 ? (
                            <p className="rounded-xl border border-slate-200 bg-white p-6 text-slate-600">
                                Dolibarr está conectado, pero todavía no tiene productos disponibles. Registra productos en Productos/Servicios para que aparezcan aquí.
                            </p>
                        ) : filteredProducts.length === 0 ? (
                            <p className="rounded-xl border border-slate-200 bg-white p-6 text-slate-600">No se encontraron productos con esos filtros.</p>
                        ) : (
                            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                                {filteredProducts.map((product) => (
                                    <article key={product.id} className="rounded-2xl border border-slate-200 bg-[#f5f5f5] shadow-sm">
                                        {product.imageUrl
                                            ? <img src={product.imageUrl} alt={product.name} className="h-[200px] w-full rounded-t-2xl object-cover" />
                                            : <div className="h-[200px] rounded-t-2xl bg-[#dfeaf4]" />}
                                        <div className="px-4 pb-5 pt-4">
                                            <p className="mb-1 text-sm text-slate-500">{product.category}{product.onSale ? " · Oferta" : ""}</p>
                                            <h2 className="mb-4 text-lg font-bold text-slate-900">{product.name}</h2>
                                            {product.reference && <p className="mb-2 text-xs text-slate-500">Ref. {product.reference}</p>}
                                            <div className="flex items-center justify-between gap-3">
                                                <p className="text-lg font-bold text-slate-900">{formatPrice(product.price)}</p>
                                                <button
                                                    type="button"
                                                    onClick={() => addToCart(product)}
                                                    disabled={product.stock === 0}
                                                    className="rounded-lg bg-[#1d7ef2] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#166ddb] disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    Agregar al carrito
                                                </button>
                                            </div>
                                            {product.description && (
                                                <p className="mt-3 line-clamp-2 text-sm text-slate-600">{product.description}</p>
                                            )}
                                            <p className={`mt-2 text-xs ${product.stock === 0 ? "text-red-700" : "text-slate-500"}`}>
                                                {product.stock === null
                                                    ? "Existencias por confirmar"
                                                    : product.stock === 0
                                                        ? "Agotado"
                                                        : `Disponibles: ${product.stock}`}
                                            </p>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            </main>
        </>
    );
}
