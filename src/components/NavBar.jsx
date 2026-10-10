import { useState } from "react";

export default function NavBar({ value = "", onSearch }) {
    const [query, setQuery] = useState(value);

    const handleChange = (e) => {
        const nextValue = e.target.value;
        setQuery(nextValue);
        if (onSearch) onSearch(nextValue);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (onSearch) onSearch(query.trim());
    };

    return (
        <nav className="w-full bg-white border-b border-slate-200">
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-6">

                <a href="/" className="shrink-0">
                    <span className="text-2xl font-semibold text-slate-900 tracking-tight">
                        TechNova
                    </span>
                </a>

                <ul className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-800">
                    <li><a href="#" className="hover:text-slate-500 transition-colors">Inicio</a></li>
                    <li><a href="#" className="hover:text-slate-500 transition-colors">Productos</a></li>
                    <li><a href="#" className="hover:text-slate-500 transition-colors">Categorías</a></li>
                    <li><a href="#" className="hover:text-slate-500 transition-colors">Ofertas</a></li>
                </ul>

                <div className="flex items-center gap-4 shrink-0">
                    <form onSubmit={handleSubmit} className="hidden sm:block">
                        <input
                            type="text"
                            value={value}
                            onChange={handleChange}
                            placeholder="Buscar productos..."
                            className="w-64 bg-slate-100 text-sm text-slate-700 placeholder-slate-400 rounded-full px-4 py-2 outline-none border border-transparent focus:border-slate-300 focus:bg-white transition"
                        />
                    </form>

                    <button aria-label="Carrito" className="relative flex items-center p-1 hover:opacity-70 transition-opacity">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 text-slate-700"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={1.8}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
                            />
                        </svg>
                        <span className="ml-1 bg-blue-600 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                            0
                        </span>
                    </button>
                </div>
            </div>
        </nav>
    );
}