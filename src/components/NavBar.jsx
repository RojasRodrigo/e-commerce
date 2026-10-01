import { useState } from "react";

export default function Navbar({ onSearch }) {
    const [query, setQuery] = useState("");
    const [menuOpen, setMenuOpen] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (onSearch) onSearch(query.trim());
    };

    const handleChange = (e) => {
        const value = e.target.value;
        setQuery(value);
        if (onSearch) onSearch(value.trim());
    };

    return (
        <nav className="sticky top-0 z-50 bg-blue-600 text-white shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 gap-4">

                    {/* Logo */}
                    <a href="/" className="flex items-center gap-2 shrink-0">
                        <span className="text-2xl"></span>
                        <span className="text-xl font-bold tracking-tight">
                            Tienda<span className="text-slate-900">Tecnologica</span>
                        </span>
                    </a>


                    <ul className="hidden md:flex items-center gap-6 text-sm font-medium">
                        <li>
                            <a href="#" className="hover:text-slate-900 transition-colors">
                                Inicio
                            </a>
                        </li>
                        <li>
                            <a href="#" className="hover:text-slate-900 transition-colors">
                                Productos
                            </a>
                        </li>
                        <li>
                            <a href="#" className="hover:text-slate-900 transition-colors">
                                Ofertas
                            </a>
                        </li>
                        <li>
                            <a href="#" className="hover:text-slate-900 transition-colors">
                                Contacto
                            </a>
                        </li>
                    </ul>

                    {/* Buscador */}
                    <form
                        onSubmit={handleSubmit}
                        className="hidden sm:flex flex-1 max-w-md relative"
                    >
                        <input
                            type="text"
                            value={query}
                            onChange={handleChange}
                            placeholder="Buscar productos..."
                            className="w-full bg-slate-800 text-sm text-white placeholder-slate-400 rounded-full pl-4 pr-10 py-2 outline-none border border-slate-700 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
                        />
                        <button
                            type="submit"
                            aria-label="Buscar"
                            className="absolute right-1 top-1/2 -translate-y-1/2 bg-white-900 hover:bg-white-900 text-slate-900 rounded-full p-1.5 transition-colors"
                        >
                            <svg
                                className="h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2.5}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z"
                                />
                            </svg>
                        </button>
                    </form>

                    {/* Carrito*/}
                    <div className="flex items-center gap-3">
                        <button
                            aria-label="Carrito"
                            className="relative p-2 hover:text-white-400 transition-colors"
                        >
                            <svg
                                className="h-6 w-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                                />
                            </svg>
                            <span className="absolute -top-1 -right-1 bg-orange-500 text-slate-900 text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                0
                            </span>
                        </button>

                        <button
                            className="md:hidden p-2 hover:text-cyan-400 transition-colors"
                            onClick={() => setMenuOpen(!menuOpen)}
                            aria-label="Menú"
                        >
                            <svg
                                className="h-6 w-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                            >
                                {menuOpen ? (
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                ) : (
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>


                {menuOpen && (
                    <div className="md:hidden pb-4 space-y-3">
                        <form onSubmit={handleSubmit} className="relative sm:hidden">
                            <input
                                type="text"
                                value={query}
                                onChange={handleChange}
                                placeholder="Buscar productos..."
                                className="w-full bg-slate-800 text-sm text-white placeholder-slate-400 rounded-full pl-4 pr-10 py-2 outline-none border border-slate-700 focus:border-cyan-400"
                            />
                            <button
                                type="submit"
                                className="absolute right-1 top-1/2 -translate-y-1/2 bg-cyan-500 text-white-900 rounded-full p-1.5"
                            >
                            </button>
                        </form>
                        <ul className="flex flex-col gap-2 text-sm font-medium">
                            <li><a href="#" className="block py-1 hover:text-cyan-400">Inicio</a></li>
                            <li><a href="#" className="block py-1 hover:text-cyan-400">Productos</a></li>
                            <li><a href="#" className="block py-1 hover:text-cyan-400">Ofertas</a></li>
                            <li><a href="#" className="block py-1 hover:text-cyan-400">Contacto</a></li>
                        </ul>
                    </div>
                )}
            </div>
        </nav>
    );
}