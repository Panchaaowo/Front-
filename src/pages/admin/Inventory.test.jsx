import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Inventory from './Inventory';
import * as services from '../../api/services';
import { useAuth } from '../../context/AuthContext';
import Swal from 'sweetalert2';

// Mock services
vi.mock('../../api/services', () => ({
    getProductos: vi.fn(),
    getCategorias: vi.fn(),
    createProducto: vi.fn(),
    updateProducto: vi.fn(),
    deleteProducto: vi.fn(),
}));


vi.mock('../../context/AuthContext', () => ({
    useAuth: vi.fn(),
}));


vi.mock('sweetalert2', () => ({
    default: {
        fire: vi.fn(() => Promise.resolve({ isConfirmed: true })),
    },
}));


vi.mock('../../components/templates/AdminLayout', () => ({
    default: ({ children }) => <div data-testid="admin-layout">{children}</div>,
}));


vi.mock('@mui/icons-material/Replay', () => ({ default: () => <span data-testid="ReplayIcon">Replay</span> }));
vi.mock('@mui/icons-material/Edit', () => ({ default: () => <span data-testid="EditIcon">Edit</span> }));
vi.mock('@mui/icons-material/Delete', () => ({ default: () => <span data-testid="DeleteIcon">Delete</span> }));
vi.mock('@mui/icons-material/Add', () => ({ default: () => <span data-testid="AddIcon">Add</span> }));
vi.mock('@mui/icons-material/Save', () => ({ default: () => <span data-testid="SaveIcon">Save</span> }));
vi.mock('@mui/icons-material/AttachMoney', () => ({ default: () => <span data-testid="AttachMoneyIcon">AttachMoney</span> }));
vi.mock('@mui/icons-material/WarningAmber', () => ({ default: () => <span data-testid="WarningAmberIcon">WarningAmber</span> }));
vi.mock('@mui/icons-material/Search', () => ({ default: () => <span data-testid="SearchIcon">Search</span> }));

describe('Inventory Component', () => {
    const mockProducts = [
        { id: 1, nombre: 'Torta Chocolate', precio: 10000, stock: 5, categoriaId: 1, fotoUrl: 'img1.jpg' },
        { id: 2, nombre: 'Pie de Limón', precio: 8000, stock: 15, categoriaId: 2, fotoUrl: 'img2.jpg' },
    ];
    const mockCategories = [
        { id: 1, nombre: 'Tortas' },
        { id: 2, nombre: 'Postres' },
    ];

    beforeEach(() => {
        vi.clearAllMocks();
        useAuth.mockReturnValue({ user: { rol: 'admin' } });
        services.getProductos.mockResolvedValue(mockProducts);
        services.getCategorias.mockResolvedValue(mockCategories);
    });

    it('renders correctly and fetches inventory', async () => {
        render(<Inventory />);
        
        expect(screen.getByText('Inventario')).toBeInTheDocument();
        
        await waitFor(() => {
            expect(services.getProductos).toHaveBeenCalled();
            expect(services.getCategorias).toHaveBeenCalled();
            expect(screen.getByText('Torta Chocolate')).toBeInTheDocument();
            expect(screen.getByText('Pie de Limón')).toBeInTheDocument();
        });
    });

    it('opens create modal and creates a product', async () => {
        const user = userEvent.setup();
        services.createProducto.mockResolvedValue({});
        
        render(<Inventory />);
        await waitFor(() => expect(screen.getByText('Torta Chocolate')).toBeInTheDocument());

        const newButton = screen.getByRole('button', { name: /Nuevo Producto/i });
        await user.click(newButton);

        const dialog = screen.getByRole('dialog');
        expect(within(dialog).getByText('Nuevo Producto')).toBeInTheDocument();

        const nameInput = screen.getByLabelText(/Nombre del Producto/i);
        await user.type(nameInput, 'Nuevo Postre');

        const priceInput = screen.getByLabelText(/Precio/i);
        await user.clear(priceInput);
        await user.type(priceInput, '5000');

        const stockInput = screen.getByLabelText(/Stock/i);
        await user.clear(stockInput);
        await user.type(stockInput, '20');
        
        // Open Select
        const categorySelect = screen.getByRole('combobox');
        await user.click(categorySelect);
        
        // Select Option
        const option = await screen.findByRole('option', { name: 'Tortas' });
        await user.click(option);

        const saveButton = screen.getByRole('button', { name: /Guardar/i });
        await user.click(saveButton);

        await waitFor(() => {
            expect(services.createProducto).toHaveBeenCalledWith(expect.objectContaining({
                nombre: 'Nuevo Postre',
                precio: 5000,
                stock: 20,
                categoriaId: 1
            }));
            expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({
                title: 'Éxito',
                icon: 'success'
            }));
        });
    }, 15000);

    it('opens edit modal and updates a product', async () => {
        const user = userEvent.setup();
        services.updateProducto.mockResolvedValue({});
        
        render(<Inventory />);
        await waitFor(() => expect(screen.getByText('Torta Chocolate')).toBeInTheDocument());

        const editIcons = screen.getAllByTestId('EditIcon');
        await user.click(editIcons[0]);

        const dialog = screen.getByRole('dialog');
        expect(within(dialog).getByText('Editar Producto')).toBeInTheDocument();
        
        const nameInput = screen.getByLabelText(/Nombre del Producto/i);
        expect(nameInput.value).toBe('Torta Chocolate');

        await user.clear(nameInput);
        await user.type(nameInput, 'Torta Chocolate Editada');
        
        const saveButton = screen.getByRole('button', { name: /Guardar/i });
        await user.click(saveButton);

        await waitFor(() => {
            expect(services.updateProducto).toHaveBeenCalledWith(1, expect.objectContaining({
                nombre: 'Torta Chocolate Editada'
            }));
        });
    }, 15000);

    it('deletes a product', async () => {
        const user = userEvent.setup();
        services.deleteProducto.mockResolvedValue({});
        
        render(<Inventory />);
        await waitFor(() => expect(screen.getByText('Torta Chocolate')).toBeInTheDocument());

        const deleteIcons = screen.getAllByTestId('DeleteIcon');
        await user.click(deleteIcons[0]);

        await waitFor(() => {
            expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({
                title: '¿Estás seguro?',
                icon: 'warning'
            }));
        });

        await waitFor(() => {
            expect(services.deleteProducto).toHaveBeenCalledWith(1);
            expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({
                title: 'Eliminado',
                icon: 'success'
            }));
        });
    });
});
