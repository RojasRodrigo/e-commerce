import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";
import { useAuth } from "../context/useAuth";
import { fetchCustomerInvoices, fetchCustomerOrders } from "../services/dolibarr";
import { formatPrice } from "../data/products";

function formatDate(value) {
    if (!value) {
        return "Fecha no disponible";
    }
    const date = typeof value === "number"
        ? new Date(value < 10_000_000_000 ? value * 1000 : value)
        : new Date(value);
    return Number.isNaN(date.getTime())
        ? "Fecha no disponible"
        : new Intl.DateTimeFormat("es", { dateStyle: "medium" }).format(date);
}

function formatAmount(value) {
    const amount = Number(value);
    return Number.isFinite(amount) ? formatPrice(amount) : "Importe no disponible";
}

function orderStatus(order) {
    const label = order.status_label ?? order.statut_libelle;
    if (label) {
        return String(label);
    }
    switch (Number(order.status ?? order.statut)) {
        case 0:
            return "Borrador";
        case 1:
            return "Validado";
        case 2:
            return "Cerrado";
        case -1:
            return "Cancelado";
        default:
            return "Estado pendiente de confirmar";
    }
}

function invoiceStatus(invoice) {
    if (invoice.paye === 1 || invoice.paye === "1" || invoice.paid === true) {
        return "Pagada";
    }
    const status = Number(invoice.status ?? invoice.statut);
    if (status === 0) {
        return "Borrador";
    }
    const due = Number(invoice.remaintopay ?? invoice.amount_remaining ?? invoice.remain_to_pay);
    return due > 0 ? `Pendiente de pago: ${formatPrice(due)}` : "Pendiente de confirmar";
}

function getReference(record) {
    return record.ref ?? record.ref_client ?? record.id ?? "Sin referencia";
}

export default function MiCuenta() {
    const navigate = useNavigate();
    const { user, loading: authLoading } = useAuth();
    const [orders, setOrders] = useState([]);
    const [invoices, setInvoices] = useState([]);
    const [ordersError, setOrdersError] = useState("");
    const [invoicesError, setInvoicesError] = useState("");
    const [loadingData, setLoadingData] = useState(true);

    useEffect(() => {
        if (!authLoading && !user) {
            navigate("/iniciar-sesion", { replace: true });
        }
    }, [authLoading, navigate, user]);

    useEffect(() => {
        if (!user) {
            return;
        }
        if (!user.dolibarrLinked) {
            return;
        }
        let active = true;
        Promise.allSettled([fetchCustomerOrders(), fetchCustomerInvoices()])
            .then(([ordersResult, invoicesResult]) => {
                if (!active) {
                    return;
                }
                if (ordersResult.status === "fulfilled") {
                    setOrders(ordersResult.value);
                    setOrdersError("");
                } else {
                    setOrdersError(ordersResult.reason.message || "No se pudieron cargar tus pedidos.");
                }
                if (invoicesResult.status === "fulfilled") {
                    setInvoices(invoicesResult.value);
                    setInvoicesError("");
                } else {
                    setInvoicesError(invoicesResult.reason.message || "No se pudieron cargar tus facturas.");
                }
            })
            .finally(() => {
                if (active) {
                    setLoadingData(false);
                }
            });
        return () => {
            active = false;
        };
    }, [user]);

    return (
        <>
            <NavBar />
            <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6">
                <header className="mb-8">
                    <h1 className="text-4xl font-black tracking-tight text-slate-900">Mi cuenta</h1>
                    {user && (
                        <p className="mt-2 text-slate-600">
                            {user.name} · {user.email}
                        </p>
                    )}
                </header>

                {user && !user.dolibarrLinked && (
                    <p role="status" className="mb-8 rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
                        Tu cuenta aún no está vinculada a Dolibarr. Contacta al administrador para asociarla de forma segura; hasta entonces no se mostrarán pedidos ni facturas.
                    </p>
                )}

                {loadingData && user?.dolibarrLinked ? (
                    <p className="mb-8 rounded-xl border border-slate-200 bg-white p-5 text-slate-600">
                        Cargando pedidos y facturas...
                    </p>
                ) : null}

                <section className="mb-10" aria-labelledby="orders-heading">
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                        <h2 id="orders-heading" className="text-2xl font-bold text-slate-900">Mis pedidos</h2>
                        <Link to="/productos" className="text-sm font-semibold text-blue-600 hover:underline">
                            Seguir comprando
                        </Link>
                    </div>
                    {ordersError && (
                        <p role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                            {ordersError}
                        </p>
                    )}
                    {!loadingData && !ordersError && orders.length === 0 && (
                        <p className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-slate-600">
                            Todavía no hay pedidos registrados para esta cuenta.
                        </p>
                    )}
                    <div className="space-y-3">
                        {orders.map((order, index) => (
                            <article
                                key={order.id ?? order.rowid ?? `${getReference(order)}-${index}`}
                                className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5"
                            >
                                <div>
                                    <h3 className="font-semibold text-slate-900">Pedido {getReference(order)}</h3>
                                    <p className="mt-1 text-sm text-slate-500">
                                        {formatDate(order.date_creation ?? order.date_commande ?? order.date)}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold text-slate-900">{formatAmount(order.total_ttc ?? order.total)}</p>
                                    <p className="mt-1 text-sm text-slate-600">{orderStatus(order)}</p>
                                </div>
                            </article>
                        ))}
                    </div>
                </section>

                <section aria-labelledby="invoices-heading">
                    <h2 id="invoices-heading" className="mb-4 text-2xl font-bold text-slate-900">Facturas y pagos</h2>
                    {invoicesError && (
                        <p role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                            {invoicesError}
                        </p>
                    )}
                    {!loadingData && !invoicesError && invoices.length === 0 && (
                        <p className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-slate-600">
                            No hay facturas disponibles para esta cuenta.
                        </p>
                    )}
                    <div className="space-y-3">
                        {invoices.map((invoice, index) => (
                            <article
                                key={invoice.id ?? invoice.rowid ?? `${getReference(invoice)}-${index}`}
                                className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5"
                            >
                                <div>
                                    <h3 className="font-semibold text-slate-900">Factura {getReference(invoice)}</h3>
                                    <p className="mt-1 text-sm text-slate-500">
                                        {formatDate(invoice.datef ?? invoice.date_creation ?? invoice.date)}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold text-slate-900">{formatAmount(invoice.total_ttc ?? invoice.total)}</p>
                                    <p className="mt-1 text-sm text-slate-600">{invoiceStatus(invoice)}</p>
                                </div>
                            </article>
                        ))}
                    </div>
                    <p className="mt-4 text-xs text-slate-500">
                        Esta pantalla consulta el estado de pago en Dolibarr; no procesa pagos en línea.
                    </p>
                </section>
            </main>
        </>
    );
}
