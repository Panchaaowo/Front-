import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import DetalleBoleta from './DetalleBoleta';

// Mock Icon
vi.mock('@mui/icons-material/Cake', () => ({
    default: () => <span data-testid="CakeIcon">CakeIcon</span>
}));

describe('DetalleBoleta Component', () => {
    const mockItem = {
        id: 1,
        nombre: 'Torta de Mil Hojas',
        cantidad: 2,
        precio: 15000
    };
    const mockSubtotal = 30000;

    it('renders item details correctly', () => {
        render(<DetalleBoleta item={mockItem} subtotal={mockSubtotal} />);

        // Check name
        expect(screen.getByText('Torta de Mil Hojas')).toBeInTheDocument();

        // Check quantity
        expect(screen.getByText('x2')).toBeInTheDocument();

        // Check price per unit formatted
        // Note: We use a regex to match the text flexibly
        expect(screen.getByText(/a \$15.000 c\/u/)).toBeInTheDocument();

        // Check subtotal formatted
        expect(screen.getByText('$30.000')).toBeInTheDocument();
    });

    it('renders the icon', () => {
        render(<DetalleBoleta item={mockItem} subtotal={mockSubtotal} />);
        expect(screen.getByTestId('CakeIcon')).toBeInTheDocument();
    });

    it('handles large numbers formatting', () => {
        const largeItem = { ...mockItem, precio: 1000000 };
        const largeSubtotal = 2000000;
        render(<DetalleBoleta item={largeItem} subtotal={largeSubtotal} />);

        expect(screen.getByText(/a \$1.000.000 c\/u/)).toBeInTheDocument();
        expect(screen.getByText('$2.000.000')).toBeInTheDocument();
    });
});
