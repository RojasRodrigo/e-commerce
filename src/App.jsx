import { useState } from "react";
import NavBar from "./components/NavBar";

const productos = [
  { id: 1, nombre: "Laptop Gamer", precio: 1200 },
  { id: 2, nombre: "Mouse Inalámbrico", precio: 25 },
  { id: 3, nombre: "Teclado Mecánico", precio: 80 },
  { id: 4, nombre: "Monitor 4K", precio: 400 },
  { id: 5, nombre: "Audífonos Bluetooth", precio: 60 },
];


export default function App() {
  const [busqueda, setBusqueda] = useState("");

  const productosFiltrados = productos.filter((p) =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-100">
      <NavBar onSearch={setBusqueda} />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6 text-slate-800">
          {busqueda
            ? `Resultados para "${busqueda}"`
            : "Todos los productos"}
        </h2>

        {productosFiltrados.length === 0 ? (
          <p className="text-slate-500">No se encontraron productos 😕</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {productosFiltrados.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-2xl shadow p-4 hover:shadow-lg transition"
              >
                <div className="h-32 bg-slate-200 rounded-xl mb-3"></div>
                <h3 className="font-semibold text-slate-800">{p.nombre}</h3>
                <p className="text-cyan-600 font-bold">${p.precio}</p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}