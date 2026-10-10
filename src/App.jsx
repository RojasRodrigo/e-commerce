import { useState } from "react";
import { Routes, Route } from "react-router-dom";

import NavBar from "./components/NavBar";
import Home from "./pages/Home";
import Productos from "./pages/Productos";
import NotFound from "./pages/NotFound";

export default function App() {
  const [busqueda, setBusqueda] = useState("");

  return (
    <div className="min-h-screen bg-white">
      {/* El Navbar SIEMPRE visible, incluso en 404 */}
      <NavBar onSearch={setBusqueda} />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/productos" element={<Productos />} />
        {/* ... otras rutas ... */}

        {/* Ruta 404 — SIEMPRE al final, sin path */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}