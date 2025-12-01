import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CartProvider, useCart } from './CartContext';

const TestComponent = () => {
    const { cart, addToCart, removeFromCart, clearCart, total } = useCart();

    return (
        <div>
            <div data-testid="cart-size">{cart.length}</div>
            <div data-testid="cart-total">{total}</div>
            <ul>
                {cart.map(item => (
                    <li key={item.id} data-testid={`item-${item.id}`}>
                        {item.nombre} - Qty: {item.cantidad}
                    </li>
                ))}
            </ul>
            <button onClick={() => addToCart({ id: 1, nombre: 'Product 1', precio: 100 })}>Add P1</button>
            <button onClick={() => addToCart({ id: 2, nombre: 'Product 2', precio: 200 })}>Add P2</button>
            <button onClick={() => removeFromCart(1)}>Remove P1</button>
            <button onClick={clearCart}>Clear</button>
        </div>
    );
};

describe('CartContext', () => {
    it('provides initial empty state', () => {
        render(
            <CartProvider>
                <TestComponent />
            </CartProvider>
        );
        expect(screen.getByTestId('cart-size')).toHaveTextContent('0');
        expect(screen.getByTestId('cart-total')).toHaveTextContent('0');
    });

    it('adds items to cart', () => {
        render(
            <CartProvider>
                <TestComponent />
            </CartProvider>
        );

        act(() => {
            screen.getByText('Add P1').click();
        });

        expect(screen.getByTestId('cart-size')).toHaveTextContent('1');
        expect(screen.getByTestId('item-1')).toHaveTextContent('Product 1 - Qty: 1');
        expect(screen.getByTestId('cart-total')).toHaveTextContent('100');
    });

    it('increments quantity for existing items', () => {
        render(
            <CartProvider>
                <TestComponent />
            </CartProvider>
        );

        act(() => {
            screen.getByText('Add P1').click();
            screen.getByText('Add P1').click();
        });

        expect(screen.getByTestId('cart-size')).toHaveTextContent('1'); // Still 1 unique item
        expect(screen.getByTestId('item-1')).toHaveTextContent('Product 1 - Qty: 2');
        expect(screen.getByTestId('cart-total')).toHaveTextContent('200');
    });

    it('removes items from cart', () => {
        render(
            <CartProvider>
                <TestComponent />
            </CartProvider>
        );

        act(() => {
            screen.getByText('Add P1').click();
            screen.getByText('Add P2').click();
        });

        expect(screen.getByTestId('cart-size')).toHaveTextContent('2');

        act(() => {
            screen.getByText('Remove P1').click();
        });

        expect(screen.getByTestId('cart-size')).toHaveTextContent('1');
        expect(screen.queryByTestId('item-1')).not.toBeInTheDocument();
        expect(screen.getByTestId('item-2')).toBeInTheDocument();
    });

    it('clears the cart', () => {
        render(
            <CartProvider>
                <TestComponent />
            </CartProvider>
        );

        act(() => {
            screen.getByText('Add P1').click();
            screen.getByText('Add P2').click();
        });

        expect(screen.getByTestId('cart-size')).toHaveTextContent('2');

        act(() => {
            screen.getByText('Clear').click();
        });

        expect(screen.getByTestId('cart-size')).toHaveTextContent('0');
        expect(screen.getByTestId('cart-total')).toHaveTextContent('0');
    });

    it('throws error when useCart is used outside provider', () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        
        expect(() => render(<TestComponent />)).toThrow('useCart debe usarse dentro de CartProvider');
        
        consoleSpy.mockRestore();
    });
});
