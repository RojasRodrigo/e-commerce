import { Routes, Route, Outlet } from 'react-router-dom'
import Home from './pages/inicio'
import Categorias from './pages/categorias'
import Productos from './pages/productos'
import IniciarSesion from './pages/iniciar-sesion'
import NotFound from './pages/pagina-404'
import Carrito from './pages/carrito'
import MiCuenta from './pages/mi-cuenta'
import Footer from './components/Footer'
import { AuthProvider } from './context/AuthContext'

function PageLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex flex-1 flex-col">
        <Outlet />
      </div>
      <Footer />
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route element={<PageLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/productos" element={<Productos />} />
          <Route path="/categorias" element={<Categorias />} />
          <Route path="/iniciar-sesion" element={<IniciarSesion />} />
          <Route path="/mi-cuenta" element={<MiCuenta />} />
          <Route path="/carrito" element={<Carrito />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </AuthProvider>
  )
}

export default App
