import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import NavBar from "../components/NavBar";

const products = [
    { name: "Laptop Lenovo", price: "Bs 4.599" },
    { name: "Laptop HP", price: "Bs 1.899" },
    { name: "Monitor Samsung", price: "Bs 999" },
    { name: "Teclado Logitech", price: "Bs 149" },
    { name: "Mouse Logitech", price: "Bs 280" },
    { name: "Audifonos Sony", price: "Bs 399" },
    { name: "Webcam Logitech", price: "Bs 320" },
    { name: "Teclado Gaming", price: "Bs 450" },
];

export default function Home() {
    const [search, setSearch] = useState("");

    const filteredProducts = useMemo(() => {
        const term = search.trim().toLowerCase();

        if (!term) return products;

        return products.filter((product) =>
            product.name.toLowerCase().includes(term)
        );
    }, [search]);

    return (
        <>
            <NavBar value={search} onSearch={setSearch} />

            <main className="mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
                <h1 className="mb-8 text-5xl font-black tracking-tight text-slate-900">
                    Catálogo de productos
                </h1>

                <div className="mb-10 grid gap-4 md:grid-cols-[1.8fr_0.9fr_0.8fr]">
                    <div className="rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-500 shadow-sm">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Buscar productos..."
                            className="w-full bg-transparent text-base text-slate-700 placeholder-slate-400 outline-none"
                        />
                    </div>

                    <div className="rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-base font-medium text-slate-700 shadow-sm">
                        Categoría
                    </div>

                    <button className="rounded-xl bg-blue-600 px-4 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-blue-500">
                        Ordenar productos
                    </button>
                </div>

                {filteredProducts.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center text-slate-500">
                        No se encontraron productos para “{search}”.
                    </div>
                ) : (
                    <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
                        {filteredProducts.map((product) => (
                            <article key={product.name} className="rounded-2xl border border-slate-200 bg-slate-100 p-0 shadow-sm">
                                <div className="h-36 rounded-t-2xl bg-slate-200/80" />

                                <div className="px-4 pb-4 pt-3">
                                    <h2 className="mb-4 text-lg font-semibold text-slate-900">{product.name}</h2>

                                    <div className="flex items-center justify-between gap-3">
                                        <span className="text-xl font-bold text-slate-900">{product.price}</span>
                                        <Link to="/iniciar-sesion" className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500">
                                            Agregar
                                        </Link>
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