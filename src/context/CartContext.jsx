import { useState } from "react";
import { CartContext } from "./CartContext.js";

export function CartProvider({ children }) {
    const [items, setItems] = useState([]);

    const addItem = (product) => {
        setItems((currentItems) => {
            if (product.stock !== null && product.stock !== undefined && product.stock <= 0) {
                return currentItems;
            }
            const existingItem = currentItems.find((item) => item.id === product.id);

            if (existingItem) {
                if (product.stock !== null && product.stock !== undefined
                    && existingItem.quantity >= product.stock) {
                    return currentItems;
                }
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
                .map((item) => {
                    if (item.id !== productId) {
                        return item;
                    }
                    const requestedQuantity = Number.isFinite(quantity) ? Math.floor(quantity) : 0;
                    const availableQuantity = item.stock === null || item.stock === undefined
                        ? requestedQuantity
                        : Math.min(requestedQuantity, Math.max(0, item.stock));
                    return { ...item, quantity: availableQuantity };
                })
                .filter((item) => item.quantity > 0)
        );
    };

    const removeItem = (productId) => {
        setItems((currentItems) => currentItems.filter((item) => item.id !== productId));
    };

    const clearCart = () => {
        setItems([]);
    };

    const value = {
        items,
        itemCount: items.reduce((total, item) => total + item.quantity, 0),
        total: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
