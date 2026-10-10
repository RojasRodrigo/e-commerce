import { Link } from "react-router-dom";

export default function Footer() {
    return (
        <footer className="mt-auto border-t border-slate-200 bg-white">
            <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <Link to="/" className="text-lg font-extrabold text-slate-900">
                        TechNova
                    </Link>
                    <p className="mt-1 text-xs text-slate-500">
                        Tecnología para tu día a día
                    </p>
                </div>

                <nav aria-label="Navegación del pie de página" className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-600">
                    <Link to="/productos" className="transition-colors hover:text-blue-600">Productos</Link>
                    <Link to="/categorias" className="transition-colors hover:text-blue-600">Categorías</Link>
                    <Link to="/iniciar-sesion" className="transition-colors hover:text-blue-600">Iniciar sesión</Link>
                </nav>

                <p className="text-xs text-slate-500">
                    © {new Date().getFullYear()} TechNova
                </p>
            </div>
        </footer>
    );
}
