import { Link, useNavigate } from "react-router-dom";

export default function NotFound() {
    const navigate = useNavigate();

    return (
        <section className="min-h-[calc(100vh-4rem)] bg-white flex items-center justify-center px-6 py-16">
            <div className="max-w-xl w-full text-center">

                {/* Número 404 grande con acento azul */}
                <h1 className="text-[120px] sm:text-[160px] leading-none font-bold text-slate-900 tracking-tight">
                    4<span className="text-blue-600">0</span>4
                </h1>

                {/* Ícono decorativo (opcional) */}
                <div className="mx-auto mb-6 flex items-center justify-center h-16 w-16 rounded-full bg-slate-100">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-8 w-8 text-slate-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.8}
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                        />
                    </svg>
                </div>

                {/* Título y mensaje */}
                <h2 className="text-2xl sm:text-3xl font-semibold text-slate-900 mb-3">
                    Página no encontrada
                </h2>
                <p className="text-slate-500 mb-8 leading-relaxed">
                    Lo sentimos, la página que buscas no existe o fue movida a otra
                    dirección. Verifica la URL o regresa al inicio para seguir comprando.
                </p>

                {/* Botones de acción */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <Link
                        to="/"
                        className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-6 py-2.5 rounded-full transition-colors"
                    >
                        Volver al inicio
                    </Link>

                    <button
                        onClick={() => navigate(-1)}
                        className="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-medium px-6 py-2.5 rounded-full transition-colors"
                    >
                        Regresar atrás
                    </button>
                </div>

            </div>
        </section>
    );
}