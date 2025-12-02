import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Categories from './Categories';
import { categoriesService } from '../../api/services';
import Swal from 'sweetalert2';


vi.mock('../../api/services', () => ({
    categoriesService: {
        getAll: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
    },
}));


vi.mock('sweetalert2', () => ({
    default: {
        fire: vi.fn(() => Promise.resolve({ isConfirmed: true })),
    },
}));


vi.mock('../../components/templates/AdminLayout', () => ({
    default: ({ children }) => <div data-testid="admin-layout">{children}</div>,
}));

vi.mock('@mui/icons-material/Add', () => ({ default: () => <span data-testid="AddIcon">Add</span> }));
vi.mock('@mui/icons-material/Edit', () => ({ default: () => <span data-testid="EditIcon">Edit</span> }));
vi.mock('@mui/icons-material/Delete', () => ({ default: () => <span data-testid="DeleteIcon">Delete</span> }));
vi.mock('@mui/icons-material/Category', () => ({ default: () => <span data-testid="CategoryIcon">Category</span> }));
vi.mock('@mui/icons-material/Save', () => ({ default: () => <span data-testid="SaveIcon">Save</span> }));
vi.mock('@mui/icons-material/Cake', () => ({ default: () => <span data-testid="CakeIcon">Cake</span> }));
vi.mock('@mui/icons-material/NoFood', () => ({ default: () => <span data-testid="NoFoodIcon">NoFood</span> }));
vi.mock('@mui/icons-material/EmojiEvents', () => ({ default: () => <span data-testid="EmojiEventsIcon">EmojiEvents</span> }));
vi.mock('@mui/icons-material/BakeryDining', () => ({ default: () => <span data-testid="BakeryDiningIcon">BakeryDining</span> }));

describe('Categories Component', () => {
    const mockCategories = [
        { id: 1, nombre: 'Tortas Cuadradas', descripcion: 'Deliciosas tortas cuadradas' },
        { id: 2, nombre: 'Sin Azúcar', descripcion: 'Para dietas especiales' },
    ];

    beforeEach(() => {
        vi.clearAllMocks();
        categoriesService.getAll.mockResolvedValue({ data: mockCategories });
    });

    it('renders correctly and fetches categories', async () => {
        render(<Categories />);
        
        expect(screen.getByText('Categorías')).toBeInTheDocument();
        expect(screen.getByText('Organiza tus productos en categorías')).toBeInTheDocument();
        
        await waitFor(() => {
            expect(categoriesService.getAll).toHaveBeenCalledTimes(1);
            expect(screen.getByText('Tortas Cuadradas')).toBeInTheDocument();
            expect(screen.getByText('Sin Azúcar')).toBeInTheDocument();
        });
    });

    it('opens create dialog and creates a new category', async () => {
        categoriesService.create.mockResolvedValue({ data: { id: 3, nombre: 'Nueva Cat', descripcion: 'Desc' } });
        
        render(<Categories />);
        await waitFor(() => expect(screen.getByText('Tortas Cuadradas')).toBeInTheDocument());

        const newButton = screen.getByRole('button', { name: /Nueva Categoría/i });
        fireEvent.click(newButton);

        const dialog = screen.getByRole('dialog');
        expect(dialog).toBeInTheDocument();
        expect(within(dialog).getByText('Nueva Categoría')).toBeInTheDocument();

        const nameInput = screen.getByLabelText(/Nombre/i);
        const descInput = screen.getByLabelText(/Descripción/i);

        fireEvent.change(nameInput, { target: { value: 'Nueva Cat' } });
        fireEvent.change(descInput, { target: { value: 'Desc' } });

        const saveButton = screen.getByRole('button', { name: /Guardar/i });
        fireEvent.click(saveButton);

        await waitFor(() => {
            expect(categoriesService.create).toHaveBeenCalledWith({
                nombre: 'Nueva Cat',
                descripcion: 'Desc'
            });
            expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({
                title: 'Éxito',
                icon: 'success'
            }));
        });
    });

    it('opens edit dialog and updates a category', async () => {
        categoriesService.update.mockResolvedValue({ data: { ...mockCategories[0], nombre: 'Editado' } });
        
        render(<Categories />);
        await waitFor(() => expect(screen.getByText('Tortas Cuadradas')).toBeInTheDocument());

       
        const editIcons = screen.getAllByTestId('EditIcon');
        fireEvent.click(editIcons[0]); 

        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByText('Editar Categoría')).toBeInTheDocument();
        
        const nameInput = screen.getByLabelText(/Nombre/i);
        expect(nameInput.value).toBe('Tortas Cuadradas');

        fireEvent.change(nameInput, { target: { value: 'Tortas Editadas' } });
        
        const saveButton = screen.getByRole('button', { name: /Guardar/i });
        fireEvent.click(saveButton);

        await waitFor(() => {
            expect(categoriesService.update).toHaveBeenCalledWith(1, {
                nombre: 'Tortas Editadas',
                descripcion: 'Deliciosas tortas cuadradas'
            });
            expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({
                title: 'Éxito',
                text: 'Categoría actualizada.'
            }));
        });
    });

    it('deletes a category', async () => {
        categoriesService.delete.mockResolvedValue({});
        
        render(<Categories />);
        await waitFor(() => expect(screen.getByText('Tortas Cuadradas')).toBeInTheDocument());

        const deleteIcons = screen.getAllByTestId('DeleteIcon');
        fireEvent.click(deleteIcons[0]);

        await waitFor(() => {
            expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({
                title: '¿Estás seguro?',
                icon: 'warning'
            }));
        });

        await waitFor(() => {
            expect(categoriesService.delete).toHaveBeenCalledWith(1);
            expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({
                title: 'Eliminado',
                icon: 'success'
            }));
        });
    });
});
