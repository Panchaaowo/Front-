import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Home from './Home';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { productsService, categoriesService, usersService, salesService, cashoutService } from '../api/services';
import Swal from 'sweetalert2';

// Mock dependencies
vi.mock('../context/CartContext', () => ({
    useCart: vi.fn(),
}));

vi.mock('../context/AuthContext', () => ({
    useAuth: vi.fn(),
}));

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: vi.fn(),
        useLocation: vi.fn().mockReturnValue({ state: {} }),
    };
});

vi.mock('../api/services', () => ({
    productsService: { getAll: vi.fn(), delete: vi.fn() },
    categoriesService: { getAll: vi.fn() },
    usersService: { findAll: vi.fn() },
    salesService: { 
        getSalesByDateAndSeller: vi.fn(),
        getMySales: vi.fn(),
        getAdminHistory: vi.fn()
    },
    cashoutService: { create: vi.fn() },
}));

vi.mock('sweetalert2', () => ({
    default: {
        fire: vi.fn(() => Promise.resolve({ isConfirmed: true })),
    },
}));

// Mock Icons
vi.mock('@mui/icons-material/Storefront', () => ({ default: () => <span data-testid="StorefrontIcon">Storefront</span> }));
vi.mock('@mui/icons-material/Person', () => ({ default: () => <span data-testid="PersonIcon">Person</span> }));
vi.mock('@mui/icons-material/History', () => ({ default: () => <span data-testid="HistoryIcon">History</span> }));
vi.mock('@mui/icons-material/Dashboard', () => ({ default: () => <span data-testid="DashboardIcon">Dashboard</span> }));
vi.mock('@mui/icons-material/Logout', () => ({ default: () => <span data-testid="LogoutIcon">Logout</span> }));
vi.mock('@mui/icons-material/Search', () => ({ default: () => <span data-testid="SearchIcon">Search</span> }));
vi.mock('@mui/icons-material/Add', () => ({ default: () => <span data-testid="AddIcon">Add</span> }));
vi.mock('@mui/icons-material/Delete', () => ({ default: () => <span data-testid="DeleteIcon">Delete</span> }));
vi.mock('@mui/icons-material/ShoppingBag', () => ({ default: () => <span data-testid="ShoppingBagIcon">ShoppingBag</span> }));
vi.mock('@mui/icons-material/Remove', () => ({ default: () => <span data-testid="RemoveIcon">Remove</span> }));
vi.mock('@mui/icons-material/PointOfSale', () => ({ default: () => <span data-testid="PointOfSaleIcon">PointOfSale</span> }));
vi.mock('@mui/icons-material/AttachMoney', () => ({ default: () => <span data-testid="AttachMoneyIcon">AttachMoney</span> }));
vi.mock('@mui/icons-material/CreditCard', () => ({ default: () => <span data-testid="CreditCardIcon">CreditCard</span> }));
vi.mock('@mui/icons-material/AccountBalanceWallet', () => ({ default: () => <span data-testid="AccountBalanceWalletIcon">AccountBalanceWallet</span> }));
vi.mock('@mui/icons-material/Warning', () => ({ default: () => <span data-testid="WarningIcon">Warning</span> }));

describe('Home Component', () => {
    const mockNavigate = vi.fn();
    const mockAddToCart = vi.fn();
    const mockRemoveFromCart = vi.fn();
    const mockLogout = vi.fn();

    const mockProducts = [
        { id: 1, nombre: 'Torta Chocolate', precio: 10000, stock: 10, categoria: { nombre: 'Tortas' }, fotoUrl: 'img1.jpg' },
        { id: 2, nombre: 'Pie de Limón', precio: 5000, stock: 5, categoria: { nombre: 'Postres' }, fotoUrl: 'img2.jpg' },
    ];
    const mockCategories = [{ id: 1, nombre: 'Tortas' }, { id: 2, nombre: 'Postres' }];

    beforeEach(() => {
        vi.clearAllMocks();
        useNavigate.mockReturnValue(mockNavigate);
        useCart.mockReturnValue({
            cart: [],
            addToCart: mockAddToCart,
            removeFromCart: mockRemoveFromCart,
            total: 0
        });
        useAuth.mockReturnValue({
            user: { id: 1, nombre: 'Vendedor 1', rol: 'vendedor' },
            logout: mockLogout
        });

        productsService.getAll.mockResolvedValue({ data: mockProducts });
        categoriesService.getAll.mockResolvedValue({ data: mockCategories });
        usersService.findAll.mockResolvedValue({ data: [] });
        salesService.getSalesByDateAndSeller.mockResolvedValue({ data: { totalVendido: 0, transactions: [] } });
        salesService.getMySales.mockResolvedValue({ data: { totalVendido: 0, transactions: [] } });
        salesService.getAdminHistory.mockResolvedValue({ data: { totalVendido: 0, transactions: [] } });
    });

    it('renders home and fetches products', async () => {
        render(<Home />);
        
        expect(screen.getByText('Mundo Mascota')).toBeInTheDocument();
        
        await waitFor(() => {
            expect(productsService.getAll).toHaveBeenCalled();
            expect(screen.getByText('Torta Chocolate')).toBeInTheDocument();
            expect(screen.getByText('Pie de Limón')).toBeInTheDocument();
        });
    });

    it('filters products by search', async () => {
        render(<Home />);
        await waitFor(() => expect(screen.getByText('Torta Chocolate')).toBeInTheDocument());

        const searchInput = screen.getByPlaceholderText('Buscar productos por nombre...');
        fireEvent.change(searchInput, { target: { value: 'Chocolate' } });

        expect(screen.getByText('Torta Chocolate')).toBeInTheDocument();
        expect(screen.queryByText('Pie de Limón')).not.toBeInTheDocument();
    });

    it('filters products by category', async () => {
        render(<Home />);
        await waitFor(() => expect(screen.getAllByText('Tortas').length).toBeGreaterThan(0));

        // Find the chip specifically (it usually has MuiChip-label class)
        const categoryChips = screen.getAllByText('Tortas');
        const categoryChip = categoryChips.find(el => el.classList.contains('MuiChip-label'));
        
        fireEvent.click(categoryChip);

        expect(screen.getByText('Torta Chocolate')).toBeInTheDocument();
        expect(screen.queryByText('Pie de Limón')).not.toBeInTheDocument();
    });

    it('adds product to cart', async () => {
        render(<Home />);
        await waitFor(() => expect(screen.getByText('Torta Chocolate')).toBeInTheDocument());

        const addButtons = screen.getAllByText('AGREGAR');
        fireEvent.click(addButtons[0]);

        expect(mockAddToCart).toHaveBeenCalledWith(mockProducts[0]);
    });

    it('shows cart sidebar for staff', async () => {
        render(<Home />);
        
        expect(screen.getByText('Orden Actual')).toBeInTheDocument();
        expect(screen.getByText('El carrito está vacío')).toBeInTheDocument();
    });

    it('navigates to checkout when clicking Cobrar', async () => {
        useCart.mockReturnValue({
            cart: [{ id: 1, nombre: 'Torta', precio: 10000, cantidad: 1 }],
            addToCart: mockAddToCart,
            removeFromCart: mockRemoveFromCart,
            total: 10000
        });

        render(<Home />);
        
        const payButton = screen.getByText('COBRAR');
        fireEvent.click(payButton);

        expect(mockNavigate).toHaveBeenCalledWith('/boleta');
    });

    it('opens cashout modal', async () => {
        render(<Home />);
        
        // Find the button specifically
        const cashoutButton = screen.getAllByText('Cierre de Caja').find(el => el.closest('button'));
        fireEvent.click(cashoutButton);

        // Check for modal title (h6)
        await waitFor(() => {
            const modalTitle = screen.getAllByText('Cierre de Caja').find(el => el.tagName === 'H6');
            expect(modalTitle).toBeInTheDocument();
        });
    });

    it('renders admin specific elements', async () => {
        useAuth.mockReturnValue({
            user: { id: 1, nombre: 'Admin', rol: 'admin' },
            logout: mockLogout
        });

        render(<Home />);
        
        await waitFor(() => {
            expect(screen.getByText('Panel Admin')).toBeInTheDocument();
            // Admin sees edit/delete buttons on products
            expect(screen.getAllByText('Editar').length).toBeGreaterThan(0);
        });
    });
});
