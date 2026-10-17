import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";
import { useCart } from "../context/useCart";
import { formatPrice, products } from "../data/products";

export default function Home() {
    const [search, setSearch] = useState("");
    const navigate = useNavigate();
    const { addItem } = useCart();

    const filteredProducts = useMemo(() => {
        const term = search.trim().toLowerCase();
        return products.filter((product) => product.name.toLowerCase().includes(term));
    }, [search]);

    const addToCart = (product) => {
        addItem(product);
        navigate("/carrito");
    };

    return (
        <>
            <NavBar value={search} onSearch={setSearch} />
            <main className="mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
                <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <h1 className="text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">Catálogo de productos</h1>
                        <p className="mt-3 text-slate-600">Encuentra la tecnología que necesitas.</p>
                    </div>
                    <Link to="/productos" className="font-semibold text-blue-600 hover:underline">Ver todos los productos</Link>
                </header>

                <div className="mb-10 grid gap-4 md:grid-cols-[1.8fr_0.9fr_0.8fr]">
                    <label className="rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-500 shadow-sm">
                        <span className="sr-only">Buscar productos</span>
                        <input
                            type="search"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Buscar productos..."
                            className="w-full bg-transparent text-base text-slate-700 placeholder-slate-400 outline-none"
                        />
                    </label>
                    <Link to="/categorias" className="rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-base font-medium text-slate-700 shadow-sm transition hover:border-blue-400">
                        Explorar categorías
                    </Link>
                    <Link to="/productos?orden=precio" className="rounded-xl bg-blue-600 px-4 py-3 text-center text-base font-semibold text-white shadow-sm transition hover:bg-blue-500">
                        Ver por precio
                    </Link>
                </div>

                {filteredProducts.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center text-slate-500">
                        No se encontraron productos para “{search}”.
                    </div>
                ) : (
                    <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4" aria-label="Productos">
                        {filteredProducts.map((product) => (
                            <article key={product.id} className="rounded-2xl border border-slate-200 bg-slate-100 shadow-sm">
                                <div className="h-36 rounded-t-2xl bg-slate-200/80" />
                                <div className="px-4 pb-4 pt-3">
                                    <p className="mb-1 text-sm text-slate-500">{product.category}</p>
                                    <h2 className="mb-4 text-lg font-semibold text-slate-900">{product.name}</h2>
                                    <div className="flex items-center justify-between gap-3">
                                        <span className="text-xl font-bold text-slate-900">{formatPrice(product.price)}</span>
                                        <button type="button" onClick={() => addToCart(product)} className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500">
                                            Agregar
                                        </button>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </section>
                )}
            </main>
        </>
    );
}
