import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Dashboard from './Dashboard';
import { productsService } from '../../api/services';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

// Mock dependencies
vi.mock('../../api/services', () => ({
    productsService: {
        getAll: vi.fn(),
    },
}));

vi.mock('../../context/AuthContext', () => ({
    useAuth: vi.fn(),
}));

vi.mock('react-router-dom', () => ({
    useNavigate: vi.fn(),
}));

vi.mock('sweetalert2', () => ({
    default: {
        fire: vi.fn(),
    },
}));

vi.mock('../../components/AdminLayout', () => ({
    default: ({ children }) => <div data-testid="admin-layout">{children}</div>,
}));

// Mock Icons
vi.mock('@mui/icons-material/TrendingUp', () => ({ default: () => <span data-testid="TrendingUpIcon">TrendingUp</span> }));
vi.mock('@mui/icons-material/ShoppingBag', () => ({ default: () => <span data-testid="ShoppingBagIcon">ShoppingBag</span> }));
vi.mock('@mui/icons-material/Warning', () => ({ default: () => <span data-testid="WarningIcon">Warning</span> }));
vi.mock('@mui/icons-material/Group', () => ({ default: () => <span data-testid="GroupIcon">Group</span> }));
vi.mock('@mui/icons-material/Download', () => ({ default: () => <span data-testid="DownloadIcon">Download</span> }));
vi.mock('@mui/icons-material/Inventory', () => ({ default: () => <span data-testid="InventoryIcon">Inventory</span> }));
vi.mock('@mui/icons-material/History', () => ({ default: () => <span data-testid="HistoryIcon">History</span> }));
vi.mock('@mui/icons-material/People', () => ({ default: () => <span data-testid="PeopleIcon">People</span> }));
vi.mock('@mui/icons-material/Category', () => ({ default: () => <span data-testid="CategoryIcon">Category</span> }));

describe('Dashboard Component', () => {
    const mockNavigate = vi.fn();
    const mockProducts = [
        { nombre: 'Product A', stock: 100 },
        { nombre: 'Product B', stock: 50 },
        { nombre: 'Product C', stock: 10 },
    ];

    beforeEach(() => {
        vi.clearAllMocks();
        useNavigate.mockReturnValue(mockNavigate);
        useAuth.mockReturnValue({ user: { rol: 'admin' } });
        productsService.getAll.mockResolvedValue({ data: mockProducts });
    });

    it('renders correctly for admin user', async () => {
        render(<Dashboard />);
        
        expect(screen.getByText('Panel de Control Ejecutivo')).toBeInTheDocument();
        expect(screen.getByText('Pedidos del Día')).toBeInTheDocument();
        expect(screen.getByText('Alertas de Stock')).toBeInTheDocument();
        expect(screen.getByText('Ventas Hoy')).toBeInTheDocument();
        
        await waitFor(() => {
            expect(productsService.getAll).toHaveBeenCalled();
            expect(screen.getByText('Product A')).toBeInTheDocument();
            expect(screen.getByText('Product B')).toBeInTheDocument();
        });
    });

    it('shows access denied for non-admin user', () => {
        useAuth.mockReturnValue({ user: { rol: 'user' } });
        render(<Dashboard />);
        
        expect(screen.getByText(/Acceso no autorizado/i)).toBeInTheDocument();
        expect(screen.queryByText('Panel de Control Ejecutivo')).not.toBeInTheDocument();
    });

    it('navigates to inventory when clicking quick action', async () => {
        render(<Dashboard />);
        await waitFor(() => expect(screen.getByText('Panel de Control Ejecutivo')).toBeInTheDocument());

        const inventoryAction = screen.getByText('Gestionar Inventario');
        fireEvent.click(inventoryAction);

        expect(mockNavigate).toHaveBeenCalledWith('/admin/inventory');
    });

    it('navigates to sales history when clicking quick action', async () => {
        render(<Dashboard />);
        await waitFor(() => expect(screen.getByText('Panel de Control Ejecutivo')).toBeInTheDocument());

        const historyAction = screen.getByText('Historial de Ventas');
        fireEvent.click(historyAction);

        expect(mockNavigate).toHaveBeenCalledWith('/admin/sales-history');
    });

    it('navigates to users when clicking quick action', async () => {
        render(<Dashboard />);
        await waitFor(() => expect(screen.getByText('Panel de Control Ejecutivo')).toBeInTheDocument());

        const usersAction = screen.getByText('Usuarios');
        fireEvent.click(usersAction);

        expect(mockNavigate).toHaveBeenCalledWith('/admin/users');
    });

    it('navigates to categories when clicking quick action', async () => {
        render(<Dashboard />);
        await waitFor(() => expect(screen.getByText('Panel de Control Ejecutivo')).toBeInTheDocument());

        const categoriesAction = screen.getByText('Categorías');
        fireEvent.click(categoriesAction);

        expect(mockNavigate).toHaveBeenCalledWith('/admin/categories');
    });

    it('handles error when fetching products', async () => {
        productsService.getAll.mockRejectedValue(new Error('API Error'));
        render(<Dashboard />);
        
        await waitFor(() => {
            expect(Swal.fire).toHaveBeenCalledWith(
                'Error de Conexión',
                'No se pudo cargar la lista de productos.',
                'error'
            );
        });
    });
});
