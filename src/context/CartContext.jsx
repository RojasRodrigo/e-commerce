import { useState } from "react";
import { CartContext } from "./CartContext.js";

export function CartProvider({ children }) {
    const [items, setItems] = useState([]);

    const addItem = (product) => {
        setItems((currentItems) => {
            const existingItem = currentItems.find((item) => item.id === product.id);

            if (existingItem) {
                return currentItems.map((item) =>
                    item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }

            return [...currentItems, { ...product, quantity: 1 }];
        });
    };

    const updateQuantity = (productId, quantity) => {
        setItems((currentItems) =>
            currentItems
                .map((item) => item.id === productId ? { ...item, quantity } : item)
                .filter((item) => item.quantity > 0)
        );
    };

    const removeItem = (productId) => {
        setItems((currentItems) => currentItems.filter((item) => item.id !== productId));
    };

    const value = {
        items,
        itemCount: items.reduce((total, item) => total + item.quantity, 0),
        total: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
        addItem,
        updateQuantity,
        removeItem,
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
