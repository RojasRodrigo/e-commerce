import { Routes, Route, Outlet } from 'react-router-dom'
import Home from './pages/inicio'
import Categorias from './pages/categorias'
import Productos from './pages/productos'
import IniciarSesion from './pages/iniciar-sesion'
import NotFound from './pages/pagina-404'
import Footer from './components/Footer'

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
    <Routes>
      <Route element={<PageLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/productos" element={<Productos />} />
        <Route path="/categorias" element={<Categorias />} />
        <Route path="/iniciar-sesion" element={<IniciarSesion />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

export default App
