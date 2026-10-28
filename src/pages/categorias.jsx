import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";
import { useCart } from "../context/useCart";
import { formatPrice } from "../data/products";
import { useCatalog } from "../hooks/useCatalog";

export default function Categorias() {
    const [search, setSearch] = useState("");
    const navigate = useNavigate();
    const { addItem } = useCart();
    const { products, categories, loading, error } = useCatalog();
    const filteredProducts = useMemo(() => {
        const term = search.trim().toLowerCase();
        return products
            .filter((product) => `${product.name} ${product.reference} ${product.description}`.toLowerCase().includes(term))
            .slice(0, 4);
    }, [products, search]);

    const addToCart = (product) => {
        addItem(product);
        navigate("/carrito");
    };

    return (
        <>
            <NavBar value={search} onSearch={setSearch} />
            <main className="mx-auto max-w-[1400px] px-6 pb-20 pt-8">
                <header className="mb-8">
                    <h1 className="text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">Tecnología para tu día a día</h1>
                    <p className="mt-4 text-xl text-slate-500">Equipos, accesorios y productos gaming en un solo lugar.</p>
                </header>

                <section className="mb-12 rounded-[28px] bg-[#dfeaf8] px-8 py-10 shadow-sm sm:px-10">
                    <h2 className="text-3xl font-bold text-blue-700">Ofertas en tecnología</h2>
                    <p className="mt-4 text-xl font-medium text-slate-800">Descuentos en productos seleccionados</p>
                    <Link to="/productos?ofertas=true" className="mt-8 inline-flex rounded-xl bg-blue-600 px-6 py-3 text-lg font-bold text-white shadow-sm transition hover:bg-blue-500">
                        Ver ofertas
                    </Link>
                </section>

                <section className="mb-12">
                    <h2 className="mb-6 text-3xl font-black text-slate-900">Categorías</h2>
                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                        {categories.map((category) => (
                            <Link
                                key={category}
                                to={`/productos?categoria=${encodeURIComponent(category)}`}
                                className="flex min-h-28 items-center justify-center rounded-2xl border border-slate-200 bg-slate-100 p-4 text-center text-xl font-semibold text-slate-800 shadow-sm transition hover:border-blue-400 hover:text-blue-700"
                            >
                                {category}
                            </Link>
                        ))}
                    </div>
                </section>

                <section>
                    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                        <h2 className="text-3xl font-black text-slate-900">Productos destacados</h2>
                        <Link to="/productos" className="font-semibold text-blue-600 hover:underline">Ver catálogo completo</Link>
                    </div>
                    {error && (
                        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                            {error}
                        </div>
                    )}
                    {loading ? (
                        <div className="rounded-xl border border-slate-200 bg-white p-6 text-slate-500">Cargando productos destacados...</div>
                    ) : products.length === 0 ? (
                        <p className="rounded-xl border border-slate-200 bg-white p-6 text-slate-600">
                            Dolibarr está conectado, pero todavía no tiene productos disponibles.
                        </p>
                    ) : filteredProducts.length === 0 ? (
                        <p className="rounded-xl border border-slate-200 bg-white p-6 text-slate-600">No se encontraron productos para “{search}”.</p>
                    ) : (
                        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                            {filteredProducts.map((product) => (
                                <article key={product.id} className="rounded-2xl border border-slate-200 bg-slate-100 shadow-sm">
                                    {product.imageUrl
                                        ? <img src={product.imageUrl} alt={product.name} className="h-36 w-full rounded-t-2xl object-cover" />
                                        : <div className="h-36 rounded-t-2xl bg-slate-200/80" />}
                                    <div className="px-4 pb-4 pt-3">
                                        <p className="text-sm text-slate-500">{product.category}</p>
                                        <h3 className="mt-1 text-lg font-semibold text-slate-900">{product.name}</h3>
                                        <div className="mt-3 flex items-center justify-between gap-2">
                                            <strong>{formatPrice(product.price)}</strong>
                                            <button type="button" onClick={() => addToCart(product)} disabled={product.stock === 0} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">
                                                Comprar
                                            </button>
                                        </div>
                                        {product.description && <p className="mt-3 line-clamp-2 text-sm text-slate-600">{product.description}</p>}
                                        <p className={`mt-2 text-xs ${product.stock === 0 ? "text-red-700" : "text-slate-500"}`}>
                                            {product.stock === null ? "Existencias por confirmar" : product.stock === 0 ? "Agotado" : `Disponibles: ${product.stock}`}
                                        </p>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </section>
            </main>
        </>
    );
}
