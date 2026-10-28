import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";
import { useCart } from "../context/useCart";
import { formatPrice } from "../data/products";
import { createDolibarrOrder } from "../services/dolibarr";
import { useAuth } from "../context/useAuth";

export default function Carrito() {
    const [notice, setNotice] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const navigate = useNavigate();
    const { items, total, updateQuantity, removeItem, clearCart } = useCart();
    const { user: currentUser } = useAuth();

    const handleCheckout = async () => {
        if (submitting) {
            return;
        }

        if (!currentUser) {
            navigate("/iniciar-sesion");
            return;
        }

        setNotice(null);
        setSubmitting(true);
        try {
            const result = await createDolibarrOrder({ items });
            const reference = result.response?.ref ?? result.response?.id;
            clearCart();
            setNotice({
                type: "success",
                message: `Pedido creado en Dolibarr${reference ? ` (${reference})` : ""}. Revisa su estado en Mi cuenta.`,
            });
        } catch (error) {
            setNotice({ type: "error", message: error.message || "No se pudo completar el pedido." });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
            <NavBar />
            <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6">
                <h1 className="mb-8 text-4xl font-black tracking-tight text-slate-900">Tu carrito</h1>

                {currentUser && !currentUser.dolibarrLinked && (
                    <p role="status" className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                        Tu cuenta aún no está vinculada a Dolibarr. Contacta al administrador para habilitar las compras.
                    </p>
                )}

                {notice && (
                    <p
                        role={notice.type === "error" ? "alert" : "status"}
                        className={`mb-6 rounded-lg border px-4 py-3 text-sm ${
                            notice.type === "success"
                                ? "border-green-200 bg-green-50 text-green-800"
                                : notice.type === "error"
                                    ? "border-red-200 bg-red-50 text-red-800"
                                    : "border-amber-200 bg-amber-50 text-amber-800"
                        }`}
                    >
                        {notice.message}
                    </p>
                )}

                {items.length === 0 ? (
                    <section className="rounded-2xl border border-slate-200 bg-slate-50 p-10 text-center">
                        <p className="text-lg text-slate-600">Tu carrito está vacío.</p>
                        <Link to="/productos" className="mt-5 inline-flex rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700">
                            Explorar productos
                        </Link>
                    </section>
                ) : (
                    <div className="grid gap-8 md:grid-cols-[1fr_300px]">
                        <section className="space-y-4" aria-label="Productos en el carrito">
                            {items.map((item) => (
                                <article key={item.id} className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5">
                                    <div>
                                        <h2 className="font-semibold text-slate-900">{item.name}</h2>
                                        <p className="mt-1 text-sm text-slate-500">{formatPrice(item.price)} c/u</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <label className="sr-only" htmlFor={`quantity-${item.id}`}>Cantidad de {item.name}</label>
                                        <input
                                            id={`quantity-${item.id}`}
                                            type="number"
                                            min="0"
                                            max={item.stock ?? undefined}
                                            value={item.quantity}
                                            onChange={(event) => updateQuantity(item.id, Number(event.target.value))}
                                            className="w-20 rounded-md border border-slate-300 px-2 py-1 text-center"
                                        />
                                        <strong className="min-w-20 text-right">{formatPrice(item.price * item.quantity)}</strong>
                                        <button type="button" onClick={() => removeItem(item.id)} className="text-sm font-medium text-red-600 hover:underline">
                                            Quitar
                                        </button>
                                    </div>
                                </article>
                            ))}
                        </section>

                        <aside className="h-fit rounded-xl border border-slate-200 bg-slate-50 p-5">
                            <h2 className="text-lg font-bold text-slate-900">Resumen de compra</h2>
                            <p className="mt-5 flex justify-between text-slate-600">
                                <span>Subtotal</span><span>{formatPrice(total)}</span>
                            </p>
                            <p className="mt-3 flex justify-between border-t border-slate-200 pt-4 text-lg font-bold text-slate-900">
                                <span>Total</span><span>{formatPrice(total)}</span>
                            </p>
                            <button
                                type="button"
                                onClick={handleCheckout}
                                disabled={submitting || (currentUser && !currentUser.dolibarrLinked)}
                                className="mt-5 block w-full rounded-lg bg-blue-600 px-4 py-3 text-center font-semibold text-white transition hover:bg-blue-700 disabled:cursor-wait disabled:opacity-60"
                            >
                                {submitting ? "Enviando pedido..." : currentUser && !currentUser.dolibarrLinked
                                    ? "Cuenta sin vincular"
                                    : currentUser ? "Confirmar compra" : "Continuar con la compra"}
                            </button>
                        </aside>
                    </div>
                )}
            </main>
        </>
    );
}
