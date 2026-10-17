import { Link } from "react-router-dom";
import NavBar from "../components/NavBar";
import { useCart } from "../context/useCart";
import { formatPrice } from "../data/products";

export default function Carrito() {
    const { items, total, updateQuantity, removeItem } = useCart();

    return (
        <>
            <NavBar />
            <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6">
                <h1 className="mb-8 text-4xl font-black tracking-tight text-slate-900">Tu carrito</h1>

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
                            <Link to="/iniciar-sesion" className="mt-5 block rounded-lg bg-blue-600 px-4 py-3 text-center font-semibold text-white transition hover:bg-blue-700">
                                Continuar con la compra
                            </Link>
                        </aside>
                    </div>
                )}
            </main>
        </>
    );
}
