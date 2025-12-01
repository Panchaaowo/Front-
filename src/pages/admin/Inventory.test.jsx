import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
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


vi.mock('../../components/AdminLayout', () => ({
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
        services.createProducto.mockResolvedValue({});
        
        render(<Inventory />);
        await waitFor(() => expect(screen.getByText('Torta Chocolate')).toBeInTheDocument());

        const newButton = screen.getByRole('button', { name: /Nuevo Producto/i });
        fireEvent.click(newButton);

        const dialog = screen.getByRole('dialog');
        expect(within(dialog).getByText('Nuevo Producto')).toBeInTheDocument();

        fireEvent.change(screen.getByLabelText(/Nombre del Producto/i), { target: { value: 'Nuevo Postre' } });
        fireEvent.change(screen.getByLabelText(/Precio/i), { target: { value: '5000' } });
        fireEvent.change(screen.getByLabelText(/Stock/i), { target: { value: '20' } });
        
        
        const categorySelect = screen.getByRole('combobox');
        fireEvent.mouseDown(categorySelect);
        
        const option = screen.getByRole('option', { name: 'Tortas' });
        fireEvent.click(option);

        const saveButton = screen.getByRole('button', { name: /Guardar/i });
        fireEvent.click(saveButton);

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
    });

    it('opens edit modal and updates a product', async () => {
        services.updateProducto.mockResolvedValue({});
        
        render(<Inventory />);
        await waitFor(() => expect(screen.getByText('Torta Chocolate')).toBeInTheDocument());

        const editIcons = screen.getAllByTestId('EditIcon');
        fireEvent.click(editIcons[0]);

        const dialog = screen.getByRole('dialog');
        expect(within(dialog).getByText('Editar Producto')).toBeInTheDocument();
        
        const nameInput = screen.getByLabelText(/Nombre del Producto/i);
        expect(nameInput.value).toBe('Torta Chocolate');

        fireEvent.change(nameInput, { target: { value: 'Torta Chocolate Editada' } });
        
        const saveButton = screen.getByRole('button', { name: /Guardar/i });
        fireEvent.click(saveButton);

        await waitFor(() => {
            expect(services.updateProducto).toHaveBeenCalledWith(1, expect.objectContaining({
                nombre: 'Torta Chocolate Editada'
            }));
        });
    });

    it('deletes a product', async () => {
        services.deleteProducto.mockResolvedValue({});
        
        render(<Inventory />);
        await waitFor(() => expect(screen.getByText('Torta Chocolate')).toBeInTheDocument());

        const deleteIcons = screen.getAllByTestId('DeleteIcon');
        fireEvent.click(deleteIcons[0]);

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
