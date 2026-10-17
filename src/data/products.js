export const products = [
    { id: "laptop-lenovo", name: "Laptop Lenovo", price: 4599, category: "Computadoras", onSale: true },
    { id: "laptop-hp", name: "Laptop HP", price: 1899, category: "Computadoras", onSale: false },
    { id: "monitor-samsung", name: "Monitor Samsung", price: 990, category: "Monitores", onSale: true },
    { id: "monitor-lg", name: "Monitor LG", price: 860, category: "Monitores", onSale: false },
    { id: "teclado-logitech", name: "Teclado Logitech", price: 420, category: "Teclados", onSale: true },
    { id: "teclado-gaming", name: "Teclado Gaming", price: 450, category: "Gaming", onSale: false },
    { id: "mouse-logitech", name: "Mouse Logitech", price: 280, category: "Mouse", onSale: false },
    { id: "audifonos-sony", name: "Audífonos Sony", price: 399, category: "Audífonos", onSale: true },
    { id: "webcam-logitech", name: "Webcam Logitech", price: 320, category: "Accesorios", onSale: false },
];

export const categories = [...new Set(products.map((product) => product.category))];

export const formatPrice = (price) =>
    `Bs ${new Intl.NumberFormat("es-BO").format(price)}`;
