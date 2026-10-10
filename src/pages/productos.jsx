import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import NavBar from "../components/NavBar";

const products = [
    { name: "Monitor Samsung", price: "Bs 990", category: "Computadoras" },
    { name: "Teclado Logitech", price: "Bs 420", category: "Teclados" },
    { name: "Mouse Logitech", price: "Bs 280", category: "Mouse" },
    { name: "Audífonos Sony", price: "Bs 399", category: "Audífonos" },
    { name: "Laptop Lenovo", price: "Bs 4.599", category: "Computadoras" },
    { name: "Monitor LG", price: "Bs 860", category: "Monitores" },
];

export default function Productos() {
    const [search, setSearch] = useState("");
    const filteredProducts = useMemo(() => {
        const term = search.trim().toLowerCase();
        return products.filter((product) => product.name.toLowerCase().includes(term));
    }, [search]);

    return (
        <>
            <NavBar value={search} onSearch={setSearch} />

            <main className="mx-auto max-w-[1440px] px-4 pb-10 pt-8 sm:px-6 lg:px-8">
                <h1 className="mb-8 text-[42px] font-black tracking-[-0.04em] text-slate-900">
                    Productos
                </h1>

                <div className="flex gap-8">
                    <aside className="w-[280px] rounded-xl border border-slate-200 bg-[#f5f5f5] p-5 shadow-sm">
                        <h2 className="mb-4 text-[15px] font-bold text-slate-900">Filtros</h2>

                        <div className="mb-6">
                            <p className="mb-3 text-[14px] font-medium text-slate-700">Categoría</p>
                            <div className="space-y-2 text-[14px] text-slate-700">
                                <label className="flex items-center gap-2">
                                    <input type="checkbox" className="h-4 w-4 rounded border-slate-300 accent-blue-600" />
                                    Computadoras
                                </label>
                                <label className="flex items-center gap-2">
                                    <input type="checkbox" className="h-4 w-4 rounded border-slate-300 accent-blue-600" />
                                    Teclados
                                </label>
                                <label className="flex items-center gap-2">
                                    <input type="checkbox" className="h-4 w-4 rounded border-slate-300 accent-blue-600" />
                                    Audífonos
                                </label>
                            </div>
                        </div>

                        <div className="mb-8">
                            <p className="mb-3 text-[14px] font-medium text-slate-700">Precio</p>
                            <div className="grid grid-cols-2 gap-2">
                                <input
                                    type="text"
                                    placeholder="Mín."
                                    className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 outline-none focus:border-blue-400"
                                />
                                <input
                                    type="text"
                                    placeholder="Máx."
                                    className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 outline-none focus:border-blue-400"
                                />
                            </div>
                        </div>

                        <button className="w-full rounded-lg bg-[#1d7ef2] px-4 py-3 text-base font-bold text-white shadow-sm transition hover:bg-[#166ddb]">
                            Aplicar filtros
                        </button>
                    </aside>

                    <section className="flex-1">
                        {filteredProducts.length === 0 ? (
                            <p className="rounded-xl border border-slate-200 bg-white p-6 text-slate-600">
                                No se encontraron productos para “{search}”.
                            </p>
                        ) : (
                            <div className="grid gap-6 xl:grid-cols-3">
                                {filteredProducts.map((product) => (
                                    <article key={product.name} className="rounded-2xl border border-slate-200 bg-[#f5f5f5] p-0 shadow-sm">
                                        <div className="h-[200px] rounded-t-2xl bg-[#dfeaf4]" />

                                        <div className="px-4 pb-5 pt-4">
                                            <h2 className="mb-4 text-[19px] font-bold text-slate-900">
                                                {product.name}
                                            </h2>
                                            <p className="mb-4 text-[18px] font-bold text-slate-900">
                                                {product.price}
                                            </p>

                                            <Link to="/iniciar-sesion" className="block w-full rounded-lg bg-[#1d7ef2] px-4 py-2 text-center text-sm font-bold text-white transition hover:bg-[#166ddb]">
                                                Agregar
                                            </Link>
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
