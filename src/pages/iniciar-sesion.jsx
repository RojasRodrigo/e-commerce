import { useState } from "react";
import { Link } from "react-router-dom";

export default function IniciarSesion() {
    const [notice, setNotice] = useState("");
    const [isRegistering, setIsRegistering] = useState(false);

    const handleSubmit = (event) => {
        event.preventDefault();
        setNotice("El formulario está listo; falta conectar el servicio de autenticación.");
    };

    return (
        <div className="flex flex-1 flex-col bg-[#f7f9fb] text-slate-900">
            <header className="border-b border-slate-200 bg-white">
                <div className="mx-auto flex h-[54px] max-w-[1200px] flex-col justify-center px-6">
                    <Link to="/" className="w-fit text-[24px] font-extrabold leading-none text-slate-900">
                        TechNova
                    </Link>
                    <span className="mt-1 text-[11px] leading-none text-slate-500">
                        Tecnología para tu día a día
                    </span>
                </div>
            </header>

            <main className="mx-auto grid w-full flex-1 max-w-[1200px] items-start gap-12 px-6 py-8 md:grid-cols-[1.25fr_0.95fr] md:items-start md:gap-16 md:pt-[30px]">
                <section className="pt-2 md:pt-12">
                    <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
                        Tecnología para tu día a día
                    </h1>
                    <p className="mt-2 text-base text-slate-500 sm:text-lg">
                        Compra computadores, accesorios y tecnología.
                    </p>
                    <div className="mt-7 rounded-xl bg-[#e8f1ff] px-7 py-8 text-lg font-medium text-blue-600 sm:mt-8 sm:text-xl">
                        Todo lo que necesitas en un solo lugar
                    </div>
                </section>

                <section className="w-full max-w-[420px] justify-self-center rounded-2xl border border-slate-200 bg-white px-7 py-8 sm:px-10 sm:py-9 md:justify-self-end">
                    <div className="mb-6 text-center">
                        <h2 className="text-2xl font-bold sm:text-[27px]">
                            {isRegistering ? "Crear cuenta" : "Inicia sesión"}
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                            {isRegistering ? "Regístrate para continuar" : "Ingresa para continuar"}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {isRegistering && (
                            <label className="block text-xs font-medium">
                                Nombre completo
                                <input
                                    type="text"
                                    autoComplete="name"
                                    required
                                    placeholder="Tu nombre"
                                    className="mt-2 w-full rounded-md border border-slate-200 px-3 py-3 text-sm font-normal outline-none transition placeholder:text-slate-400 focus:border-blue-500"
                                />
                            </label>
                        )}
                        <label className="block text-xs font-medium">
                            Correo electrónico
                            <input
                                type="email"
                                autoComplete="email"
                                required
                                placeholder="tu@correo.com"
                                className="mt-2 w-full rounded-md border border-slate-200 px-3 py-3 text-sm font-normal outline-none transition placeholder:text-slate-400 focus:border-blue-500"
                            />
                        </label>

                        <label className="block text-xs font-medium">
                            Contraseña
                            <input
                                type="password"
                                autoComplete={isRegistering ? "new-password" : "current-password"}
                                required
                                minLength={8}
                                placeholder="Tu contraseña"
                                className="mt-2 w-full rounded-md border border-slate-200 px-3 py-3 text-sm font-normal outline-none transition placeholder:text-slate-400 focus:border-blue-500"
                            />
                        </label>

                        {!isRegistering && (
                            <div className="-mt-2 text-right">
                                <button
                                    type="button"
                                    onClick={() => setNotice("La recuperación de contraseña requiere conectar el servicio de autenticación.")}
                                    className="text-xs text-blue-600 hover:underline"
                                >
                                    ¿Olvidaste tu contraseña?
                                </button>
                            </div>
                        )}

                        <button
                            type="submit"
                            className="w-full rounded-md bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
                        >
                            {isRegistering ? "Crear cuenta" : "Iniciar sesión"}
                        </button>
                    </form>

                    <div className="my-5 flex items-center gap-3 text-xs text-slate-500">
                        <span className="h-px flex-1 bg-slate-200" />
                        o
                        <span className="h-px flex-1 bg-slate-200" />
                    </div>

                    <button
                        type="button"
                        onClick={() => setNotice("Para habilitar Google se deben configurar las credenciales de OAuth.")}
                        className="flex w-full items-center justify-center gap-2 rounded-md border border-slate-200 px-4 py-3 text-sm transition hover:bg-slate-50"
                    >
                        <span aria-hidden="true" className="font-semibold">G</span>
                        Continuar con Google
                    </button>

                    {notice && (
                        <p role="status" className="mt-4 rounded-md bg-blue-50 px-3 py-2 text-center text-xs leading-relaxed text-blue-800">
                            {notice}
                        </p>
                    )}

                    <p className="mt-6 text-center text-xs text-slate-500">
                        {isRegistering ? "¿Ya tienes una cuenta?" : "¿No tienes una cuenta?"}{" "}
                        <button
                            type="button"
                            onClick={() => {
                                setIsRegistering((registering) => !registering);
                                setNotice("");
                            }}
                            className="text-blue-600 hover:underline"
                        >
                            {isRegistering ? "Inicia sesión" : "Regístrate"}
                        </button>
                    </p>
                </section>
            </main>
        </div>
    );
}
