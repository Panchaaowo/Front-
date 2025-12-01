import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Boleta from './Boleta';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { salesService } from '../api/services';
import Swal from 'sweetalert2';

// Mock dependencies
vi.mock('../context/CartContext', () => ({
    useCart: vi.fn(),
}));

vi.mock('../context/AuthContext', () => ({
    useAuth: vi.fn(),
}));

vi.mock('react-router-dom', () => ({
    useNavigate: vi.fn(),
}));

vi.mock('../api/services', () => ({
    salesService: {
        createSale: vi.fn(),
    },
}));

vi.mock('sweetalert2', () => ({
    default: {
        fire: vi.fn(),
    },
}));

// Mock child component to simplify testing
vi.mock('./DetalleBoleta', () => ({
    default: ({ item, subtotal }) => (
        <div data-testid="detalle-boleta">
            {item.nombre} - ${subtotal}
        </div>
    ),
}));

// Mock window.print
window.print = vi.fn();

describe('Boleta Component', () => {
    const mockNavigate = vi.fn();
    const mockClearCart = vi.fn();
    
    const mockCart = [
        { id: 1, nombre: 'Torta Chocolate', precio: 10000, cantidad: 1 },
        { id: 2, nombre: 'Pie de Limón', precio: 5000, cantidad: 2 },
    ];
    const mockTotal = 20000; // 10000 + 5000*2

    beforeEach(() => {
        vi.clearAllMocks();
        useNavigate.mockReturnValue(mockNavigate);
        useCart.mockReturnValue({
            cart: mockCart,
            total: mockTotal,
            clearCart: mockClearCart,
        });
        useAuth.mockReturnValue({
            user: { nombre: 'Juan Perez' },
        });
    });

    it('renders correctly with cart items', () => {
        render(<Boleta />);
        
        expect(screen.getByText('Finalizar Venta')).toBeInTheDocument();
        expect(screen.getByText('Juan Perez')).toBeInTheDocument();
        expect(screen.getByText('Resumen del Pedido')).toBeInTheDocument();
        
        // Check items (via mocked DetalleBoleta)
        expect(screen.getByText('Torta Chocolate - $10000')).toBeInTheDocument();
        expect(screen.getByText('Pie de Limón - $10000')).toBeInTheDocument();
        
        // Check totals
        const totalElements = screen.getAllByText(`$${mockTotal.toLocaleString('es-CL')}`);
        expect(totalElements.length).toBeGreaterThan(0);
    });

    it('redirects to home if cart is empty', () => {
        useCart.mockReturnValue({
            cart: [],
            total: 0,
            clearCart: mockClearCart,
        });
        
        render(<Boleta />);
        
        expect(mockNavigate).toHaveBeenCalledWith('/home');
    });

    it('handles cash payment calculation', () => {
        render(<Boleta />);
        
        // Default is Cash (Efectivo)
        const input = screen.getByPlaceholderText(`Mínimo: $${mockTotal.toLocaleString('es-CL')}`);
        
        // Enter amount less than total
        fireEvent.change(input, { target: { value: '10000' } });
        // Based on component logic: vuelto is 0 if amount < total
        // We target the h4 which is the main display, avoiding the hidden receipt one
        expect(screen.getByRole('heading', { level: 4, name: '$0' })).toBeInTheDocument();

        // Enter amount greater than total
        fireEvent.change(input, { target: { value: '25000' } });
        expect(screen.getByRole('heading', { level: 4, name: '$5.000' })).toBeInTheDocument(); // Vuelto correcto
    });

    it('validates insufficient cash on confirm', async () => {
        render(<Boleta />);
        
        const confirmButton = screen.getByRole('button', { name: /CONFIRMAR PAGO/i });
        
        // Button should be disabled when amount (0) < total
        expect(confirmButton).toBeDisabled();
        
        // Clicking shouldn't do anything (and fireEvent might not even trigger on disabled)
        // But just to be sure we verify no service call
        expect(salesService.createSale).not.toHaveBeenCalled();
    });

    it('processes sale successfully with cash', async () => {
        salesService.createSale.mockResolvedValue({ data: { folio: '12345' } });
        render(<Boleta />);
        
        // Enter sufficient cash
        const input = screen.getByPlaceholderText(`Mínimo: $${mockTotal.toLocaleString('es-CL')}`);
        fireEvent.change(input, { target: { value: '20000' } });
        
        const confirmButton = screen.getByRole('button', { name: /CONFIRMAR PAGO/i });
        fireEvent.click(confirmButton);
        
        await waitFor(() => {
            expect(salesService.createSale).toHaveBeenCalledWith({
                items: [
                    { productoId: 1, cantidad: 1 },
                    { productoId: 2, cantidad: 2 }
                ],
                medioPago: 'EFECTIVO',
                montoEntregado: 20000
            });
        });

        // Check receipt dialog opens
        expect(await screen.findByText('¡Venta Exitosa!')).toBeInTheDocument();
        expect(screen.getByText('Ticket N° 12345')).toBeInTheDocument();
    });

    it('processes sale successfully with card (Debit)', async () => {
        salesService.createSale.mockResolvedValue({ data: { folio: '67890' } });
        render(<Boleta />);
        
        // Select Debit
        const debitOption = screen.getByText('Débito');
        fireEvent.click(debitOption);
        
        const confirmButton = screen.getByRole('button', { name: /CONFIRMAR PAGO/i });
        fireEvent.click(confirmButton);
        
        await waitFor(() => {
            expect(salesService.createSale).toHaveBeenCalledWith({
                items: expect.any(Array),
                medioPago: 'DEBITO',
                montoEntregado: mockTotal // Should be total for card payments
            });
        });
    });

    it('handles API error during sale', async () => {
        salesService.createSale.mockRejectedValue({ 
            response: { data: { message: 'Stock insuficiente' } } 
        });
        render(<Boleta />);
        
        // Select Debit to bypass cash check
        fireEvent.click(screen.getByText('Débito'));
        
        const confirmButton = screen.getByRole('button', { name: /CONFIRMAR PAGO/i });
        fireEvent.click(confirmButton);
        
        await waitFor(() => {
            expect(Swal.fire).toHaveBeenCalledWith('Error', 'Stock insuficiente', 'error');
        });
    });

    it('closes receipt, clears cart and navigates home', async () => {
        salesService.createSale.mockResolvedValue({ data: { folio: '12345' } });
        render(<Boleta />);
        
        // Complete sale
        fireEvent.click(screen.getByText('Débito'));
        fireEvent.click(screen.getByRole('button', { name: /CONFIRMAR PAGO/i }));
        
        await screen.findByText('¡Venta Exitosa!');
        
        // Close receipt
        const closeButton = screen.getByRole('button', { name: /Cerrar/i });
        fireEvent.click(closeButton);
        
        expect(mockClearCart).toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalledWith('/home');
    });
});
