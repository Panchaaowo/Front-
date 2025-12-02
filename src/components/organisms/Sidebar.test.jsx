import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Sidebar from './Sidebar';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

vi.mock('../../context/AuthContext', () => ({
    useAuth: vi.fn(),
}));

vi.mock('react-router-dom', () => ({
    useNavigate: vi.fn(),
    useLocation: vi.fn(),
}));

vi.mock('@mui/icons-material/Dashboard', () => ({ default: () => <span data-testid="DashboardIcon">Dashboard</span> }));
vi.mock('@mui/icons-material/Inventory', () => ({ default: () => <span data-testid="InventoryIcon">Inventory</span> }));
vi.mock('@mui/icons-material/Storefront', () => ({ default: () => <span data-testid="StorefrontIcon">Storefront</span> }));
vi.mock('@mui/icons-material/Group', () => ({ default: () => <span data-testid="GroupIcon">Group</span> }));
vi.mock('@mui/icons-material/Category', () => ({ default: () => <span data-testid="CategoryIcon">Category</span> }));
vi.mock('@mui/icons-material/PointOfSale', () => ({ default: () => <span data-testid="PointOfSaleIcon">PointOfSale</span> }));
vi.mock('@mui/icons-material/Logout', () => ({ default: () => <span data-testid="LogoutIcon">Logout</span> }));
vi.mock('@mui/icons-material/History', () => ({ default: () => <span data-testid="HistoryIcon">History</span> }));

describe('Sidebar Component', () => {
    const mockNavigate = vi.fn();
    const mockLogout = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        useNavigate.mockReturnValue(mockNavigate);
        useLocation.mockReturnValue({ pathname: '/admin/dashboard' });
        useAuth.mockReturnValue({ logout: mockLogout });
    });

    it('renders all menu items', () => {
        render(<Sidebar />);

        expect(screen.getByText('Panel de Control')).toBeInTheDocument();
        expect(screen.getByText('Inventario')).toBeInTheDocument();
        expect(screen.getByText('Categorías')).toBeInTheDocument();
        expect(screen.getByText('Personal')).toBeInTheDocument();
        expect(screen.getByText('Mi Cuadre Diario')).toBeInTheDocument();
        expect(screen.getByText('Reporte Global')).toBeInTheDocument();
    });

    it('navigates to correct paths when menu items are clicked', () => {
        render(<Sidebar />);

        fireEvent.click(screen.getByText('Inventario'));
        expect(mockNavigate).toHaveBeenCalledWith('/admin/inventory', { state: undefined });

        fireEvent.click(screen.getByText('Categorías'));
        expect(mockNavigate).toHaveBeenCalledWith('/admin/categories', { state: undefined });
    });

    it('navigates to "Mi Cuadre Diario" with state', () => {
        render(<Sidebar />);

        fireEvent.click(screen.getByText('Mi Cuadre Diario'));
        expect(mockNavigate).toHaveBeenCalledWith('/home', { state: { openCashout: true } });
    });

    it('navigates to "Ir a Caja"', () => {
        render(<Sidebar />);

        const cajaButton = screen.getByRole('button', { name: /Ir a Caja/i });
        fireEvent.click(cajaButton);
        expect(mockNavigate).toHaveBeenCalledWith('/home');
    });

    it('calls logout when "Salir" is clicked', () => {
        render(<Sidebar />);

        const logoutButton = screen.getByRole('button', { name: /Salir/i });
        fireEvent.click(logoutButton);
        expect(mockLogout).toHaveBeenCalled();
    });
});
