import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import NavBar from "../components/NavBar";

const categories = [
    "Laptops",
    "Monitores",
    "Teclados",
    "Mouse",
    "Audífonos",
    "Gaming",
];

const featuredProducts = [
    "Laptop Lenovo",
    "Monitor Samsung",
    "Audífonos Sony",
    "Mouse Logitech",
];

export default function Categorias() {
    const [search, setSearch] = useState("");
    const filteredProducts = useMemo(() => {
        const term = search.trim().toLowerCase();
        return featuredProducts.filter((product) => product.toLowerCase().includes(term));
    }, [search]);

    return (
        <>
            <NavBar value={search} onSearch={setSearch} />

            <main className="mx-auto max-w-[1400px] px-6 pb-20 pt-8">
                <header className="mb-8">
                    <h1 className="text-5xl font-black tracking-tight text-slate-900">
                        Tecnología para tu día a día
                    </h1>
                    <p className="mt-4 text-2xl text-slate-500">
                        Equipos, accesorios y productos gaming en uno solo lugar.
                    </p>
                </header>

                <section className="mb-12 rounded-[28px] bg-[#dfeaf8] px-10 py-10 shadow-sm">
                    <h2 className="text-4xl font-bold text-blue-700">Ofertas en tecnología</h2>
                    <p className="mt-4 text-[28px] font-medium text-slate-800">
                        Hasta 25% de descuento en productos seleccionados
                    </p>

                    <button className="mt-8 rounded-xl bg-blue-600 px-6 py-3 text-lg font-bold text-white shadow-sm transition hover:bg-blue-500">
                        Ver ofertas
                    </button>
                </section>

                <section className="mb-12">
                    <h3 className="mb-6 text-4xl font-black text-slate-900">Categorías</h3>

                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                        {categories.map((category) => (
                            <div
                                key={category}
                                className="flex h-28 items-center justify-center rounded-2xl border border-slate-200 bg-slate-100 text-2xl font-semibold text-slate-800 shadow-sm"
                            >
                                {category}
                            </div>
                        ))}
                    </div>
                </section>

                <section>
                    <h3 className="mb-6 text-4xl font-black text-slate-900">Productos destacados</h3>

                    {filteredProducts.length === 0 ? (
                        <p className="rounded-xl border border-slate-200 bg-white p-6 text-slate-600">
                            No se encontraron productos para “{search}”.
                        </p>
                    ) : (
                        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                            {filteredProducts.map((product) => (
                                <article key={product} className="rounded-2xl border border-slate-200 bg-slate-100 shadow-sm">
                                    <div className="h-36 rounded-t-2xl bg-slate-200/80" />
                                    <div className="px-4 pb-4 pt-3">
                                        <h4 className="text-lg font-semibold text-slate-900">{product}</h4>
                                        <Link to="/iniciar-sesion" className="mt-3 inline-flex rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700">
                                            Comprar
                                        </Link>
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
