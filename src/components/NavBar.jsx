import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/useCart";
import { useAuth } from "../context/useAuth";

export default function NavBar({ value = "", onSearch }) {
    const [query, setQuery] = useState(value);
    const [actionError, setActionError] = useState("");
    const navigate = useNavigate();
    const { itemCount } = useCart();
    const { user, logout } = useAuth();

    const handleChange = (event) => {
        const nextValue = event.target.value;
        setQuery(nextValue);
        onSearch?.(nextValue);
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        const params = new URLSearchParams();
        if (query.trim()) params.set("busqueda", query.trim());
        navigate(`/productos${params.size ? `?${params.toString()}` : ""}`);
    };

    const handleLogout = async () => {
        setActionError("");
        try {
            await logout();
            navigate("/");
        } catch (error) {
            setActionError(error.message || "No se pudo cerrar la sesión.");
        }
    };

    return (
        <nav className="w-full border-b border-slate-200 bg-white">
            <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-6 px-6 py-3">
                <Link to="/" className="shrink-0" aria-label="TechNova, inicio">
                    <span className="text-3xl font-black tracking-tight text-slate-900">
                        Tech<span>Nova</span>
                    </span>
                </Link>

                <ul className="hidden items-center gap-6 text-base font-medium text-slate-800 md:flex">
                    <li><Link to="/" className="transition-colors hover:text-blue-600">Inicio</Link></li>
                    <li><Link to="/productos" className="transition-colors hover:text-blue-600">Productos</Link></li>
                    <li><Link to="/categorias" className="transition-colors hover:text-blue-600">Categorías</Link></li>
                    <li><Link to="/productos?ofertas=true" className="transition-colors hover:text-blue-600">Ofertas</Link></li>
                </ul>

                <div className="flex shrink-0 items-center gap-4">
                    <form onSubmit={handleSubmit} className="hidden sm:block">
                        <label className="sr-only" htmlFor="navbar-search">Buscar productos</label>
                        <input
                            id="navbar-search"
                            type="search"
                            value={query}
                            onChange={handleChange}
                            placeholder="Buscar productos..."
                            className="w-52 rounded-full border border-slate-200 bg-slate-100 px-4 py-2 text-sm text-slate-700 placeholder-slate-400 outline-none transition focus:border-slate-300 focus:bg-white"
                        />
                    </form>

                    {user ? (
                        <div className="flex items-center gap-2">
                            <Link to="/mi-cuenta" className="max-w-28 truncate text-sm font-semibold text-slate-700 transition-colors hover:text-blue-600 sm:max-w-none">
                                {user.name}
                            </Link>
                            <button
                                type="button"
                                onClick={handleLogout}
                                className="whitespace-nowrap text-xs font-medium text-slate-500 transition-colors hover:text-blue-600"
                            >
                                Salir
                            </button>
                        </div>
                    ) : (
                        <Link to="/iniciar-sesion" className="whitespace-nowrap text-sm font-semibold text-slate-700 transition-colors hover:text-blue-600">
                            Iniciar sesión
                        </Link>
                    )}

                    <Link to="/carrito" aria-label={`Carrito, ${itemCount} productos`} className="relative flex items-center gap-1 p-1 text-sm font-medium text-slate-700 transition hover:text-blue-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                        </svg>
                        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] font-bold text-white">
                            {itemCount}
                        </span>
                    </Link>
                </div>
            </div>
            {actionError && (
                <p role="alert" className="mx-auto max-w-7xl px-6 pb-2 text-right text-xs text-red-700">
                    {actionError}
                </p>
            )}
        </nav>
    );
}
