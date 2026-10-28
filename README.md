# E-commerce con React y Vite
# GRUPO 2
# Link Scrum
```bash
https://app.clickup.com/90171570811/v/b/6-901717412043-2
```

Aplicación web de comercio electrónico desarrollada con **React** y **Vite**. El proyecto permite visualizar productos, consultar información, agregarlos al carrito y gestionar una compra mediante una interfaz web moderna y responsiva.

## Tecnologías utilizadas

<p align="center">
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" width="60" alt="React"/>
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vitejs/vitejs-original.svg" width="60" alt="Vite"/>
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg" width="60" alt="JavaScript"/>
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg" width="60" alt="HTML5"/>
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg" width="60" alt="CSS3"/>
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg" width="60" alt="Git"/>
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg" width="60" alt="GitHub"/>
</p>

<p align="center">
  <strong>React</strong> ·
  <strong>Vite</strong> ·
  <strong>JavaScript</strong> ·
  <strong>HTML5</strong> ·
  <strong>CSS3</strong> ·
  <strong>Git</strong> ·
  <strong>GitHub</strong>
</p>

## Descripción

Este proyecto consiste en el desarrollo de una plataforma de comercio electrónico que permite a los usuarios explorar un catálogo de productos, visualizar sus detalles y realizar una simulación del proceso de compra.

El proyecto tiene como objetivo aplicar conceptos de desarrollo frontend utilizando React, componentes reutilizables, manejo de estados, rutas y consumo de datos.

## Funcionalidades

* Visualización del catálogo de productos.
* Visualización de información detallada de cada producto.
* Búsqueda de productos.
* Filtrado por categorías.
* Agregar productos al carrito.
* Modificar cantidades de productos.
* Eliminar productos del carrito.
* Cálculo del total de la compra.
* Visualización del resumen del pedido.
* Diseño responsivo para diferentes dispositivos.

## Estructura del proyecto

```text
ecommerce/
├── public/
│   └── images/
│
├── src/
│   ├── assets/
│   ├── components/
│   ├── pages/
│   ├── services/
│   ├── context/
│   ├── hooks/
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
│
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## Integración con Dolibarr

La aplicación obtiene productos, precios, descripciones, imágenes y existencias de Dolibarr. El servidor mantiene las credenciales privadas, crea/vincula un tercero de prueba para cada cuenta y crea pedidos. Los clientes pueden consultar sus propios pedidos y facturas.

### Variables de entorno

Crea un archivo `.env` basado en `.env.example`:

```bash
DOLIBARR_API_URL=https://tu-dolibarr.example.com/api/index.php
DOLIBARR_API_KEY=tu-api-key-de-dolibarr
```

`DOLIBARR_API_URL` debe apuntar a la raíz del API REST, normalmente terminada en `/api/index.php`. La tienda consulta `/products`, `/orders` y `/invoices` desde esa raíz. La creación de cuenta no requiere SMTP ni `SESSION_SECRET`; crea un tercero nuevo en Dolibarr para habilitar pruebas de pedidos.

Para desarrollo, copia `.env.example` a `.env` y completa las credenciales de Dolibarr. En dos terminales, ejecuta `npm run api` y `npm run dev`; el proxy de Vite reenvía `/api` al servidor local y `/dolibarr` a Dolibarr. La clave `DOLAPIKEY` permanece en el servidor y no se incluye en el bundle. El usuario de Dolibarr necesita permisos de lectura para Productos/Servicios y existencias, crear Terceros, y consultar pedidos y facturas y crear pedidos. En Productos, usa **Probar conexión API** para comprobar la conexión y la lectura del catálogo.

Para producción, el servidor Node incluido sirve el frontend compilado y actúa como proxy privado hacia Dolibarr. Despliega con Node.js 22.12 o superior, define `DOLIBARR_API_URL` y `DOLIBARR_API_KEY` como secretos del entorno y ejecuta:

```bash
npm run build
npm start
```

El servidor atiende autenticación, pedidos y facturas con sesiones `HttpOnly`. Cada registro crea un tercero nuevo en Dolibarr y guarda su ID en la cuenta de tienda; no intenta asociar contactos existentes por correo. El registro no verifica la titularidad del correo, por lo que este flujo está pensado para pruebas y no debe usarse para cuentas reales de clientes sin añadir verificación o vinculación administrativa. La base SQLite se guarda en `data/technova.sqlite` por defecto; en producción, conserva `data/` en un volumen persistente o define `DATA_DIR`. Respalda esa base de datos junto con el resto de datos del comercio. No configures credenciales en variables `VITE_*` ni en código frontend.

Para validar la integración se cargaron en Dolibarr nueve productos de demostración y sus siete categorías. Sus precios provienen del catálogo local de ejemplo y se crearon con IVA del 0%; reemplázalos o ajusta sus impuestos en Dolibarr antes de aceptar ventas reales.

### Flujo actual

- Frontend React: TechNova
- Backend ERP: Dolibarr (cuando está disponible)
- Respaldo: catálogo local si la integración no está configurada
- Clientes: al crear una cuenta de prueba, el servidor crea un tercero nuevo en Dolibarr y vincula su ID. Cuentas locales antiguas sin vínculo se aprovisionan al volver a cargar la sesión. No se asocia automáticamente a clientes/contactos existentes; registros de prueba pueden generar terceros duplicados si se reutiliza el correo
- Acceso de la tienda: las cuentas y hashes de contraseña se guardan en SQLite; las sesiones aleatorias se validan en el servidor y se envían en una cookie `HttpOnly`
- Catálogo: sincroniza precios, referencia, descripción, categorías, imagen cuando la API la proporciona y existencias cuando Dolibarr las expone
- Pedidos: el servidor vuelve a consultar precio y existencias antes de crear el pedido, obtiene el tercero desde la sesión autenticada y no acepta esos datos desde el navegador
- Historial y facturas: cada consulta se filtra en el servidor por el tercero asociado a la sesión. La pantalla muestra estados e importes; no procesa pagos en línea
- Seguridad: la contraseña se guarda como hash con salt y las sesiones se gestionan con cookie `HttpOnly`; el registro no verifica el correo. Esta vinculación automática está diseñada para pruebas, no producción

## Instalación

### 1. Clonar el repositorio

```bash
git clone URL_DEL_REPOSITORIO
```

### 2. Ingresar al proyecto

```bash
cd ecommerce
```

### 3. Instalar las dependencias

```bash
npm install
```

### 4. Ejecutar el proyecto

Con Dolibarr configurado en `.env`, abre dos terminales:

```bash
npm run api
```

```bash
npm run dev
```

La aplicación estará disponible normalmente en:

```text
http://localhost:5173
```

## Scripts disponibles

```bash
npm run dev
```

Inicia el servidor de desarrollo.

```bash
npm run api
```

Inicia la API local, autenticación, SQLite y la integración privada con Dolibarr para desarrollo.

```bash
npm run build
```

Genera la versión de producción.

```bash
npm run preview
```

Permite previsualizar la versión de producción.

## Flujo de compra

```text
Inicio
  ↓
Catálogo de productos
  ↓
Seleccionar producto
  ↓
Ver detalles
  ↓
Agregar al carrito
  ↓
Revisar carrito
  ↓
Modificar cantidades
  ↓
Confirmar pedido
```

## Estado del proyecto

En desarrollo.

## Autor

**Grupo 2**

Proyecto académico desarrollado utilizando React y Vite.
