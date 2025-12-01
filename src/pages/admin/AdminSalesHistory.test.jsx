import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AdminSalesHistory from './AdminSalesHistory';
import { salesService, usersService } from '../../api/services';
import Swal from 'sweetalert2';

// Mock dependencies
vi.mock('../../api/services', () => ({
    salesService: {
        getAdminHistory: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
    },
    usersService: {
        findAll: vi.fn(),
    },
}));

vi.mock('../../components/AdminLayout', () => ({
    default: ({ children }) => <div data-testid="admin-layout">{children}</div>,
}));

vi.mock('sweetalert2', () => ({
    default: {
        fire: vi.fn(),
    },
}));

// Mock icons to easily find buttons
vi.mock('@mui/icons-material/Edit', () => ({ default: () => <span data-testid="EditIcon">Edit</span> }));
vi.mock('@mui/icons-material/Delete', () => ({ default: () => <span data-testid="DeleteIcon">Delete</span> }));
vi.mock('@mui/icons-material/Save', () => ({ default: () => <span data-testid="SaveIcon">Save</span> }));
vi.mock('@mui/icons-material/Search', () => ({ default: () => <span data-testid="SearchIcon">Search</span> }));
vi.mock('@mui/icons-material/FilterList', () => ({ default: () => <span data-testid="FilterListIcon">Filter</span> }));
vi.mock('@mui/icons-material/CalendarToday', () => ({ default: () => <span data-testid="CalendarTodayIcon">Calendar</span> }));

describe('AdminSalesHistory', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders correctly and fetches initial data', async () => {
        usersService.findAll.mockResolvedValue({ data: [] });
        salesService.getAdminHistory.mockResolvedValue({ data: [] });

        render(<AdminSalesHistory />);

        expect(screen.getByText('Historial de Ventas')).toBeInTheDocument();
        expect(screen.getByText('Consulta y gestiona las transacciones históricas del sistema.')).toBeInTheDocument();
        
        await waitFor(() => {
            expect(usersService.findAll).toHaveBeenCalled();
            expect(salesService.getAdminHistory).toHaveBeenCalled();
        });
    });

    it('displays sales data correctly', async () => {
        const mockUsers = [{ id: 1, name: 'Vendedor 1', rol: 'vendedor' }];
        const mockSales = [
            {
                folio: 101,
                fecha: '2023-10-27',
                vendedor: 'Vendedor 1',
                resumen: { medioPago: 'EFECTIVO', total: 5000 }
            }
        ];

        usersService.findAll.mockResolvedValue({ data: mockUsers });
        salesService.getAdminHistory.mockResolvedValue({ data: mockSales });

        render(<AdminSalesHistory />);

        await waitFor(() => {
            expect(screen.getByText('#101')).toBeInTheDocument();
            expect(screen.getByText('Vendedor 1')).toBeInTheDocument();
            expect(screen.getByText('EFECTIVO')).toBeInTheDocument();
            expect(screen.getByText('$5.000')).toBeInTheDocument();
        });
    });

    it('opens edit modal when edit button is clicked and saves changes', async () => {
        const mockSales = [
            {
                folio: 101,
                fecha: '2023-10-27',
                vendedor: 'Vendedor 1',
                resumen: { medioPago: 'EFECTIVO', total: 5000 }
            }
        ];
        usersService.findAll.mockResolvedValue({ data: [] });
        salesService.getAdminHistory.mockResolvedValue({ data: mockSales });
        salesService.update.mockResolvedValue({});

        render(<AdminSalesHistory />);

        await waitFor(() => {
            expect(screen.getByText('#101')).toBeInTheDocument();
        });

        // Find the edit button (it's an IconButton containing the EditIcon)
        const editIcon = screen.getByTestId('EditIcon');
        const editButton = editIcon.closest('button');
        fireEvent.click(editButton);

        // Check if modal opened
        expect(screen.getByText('Editar Venta #101')).toBeInTheDocument();

        // Change values
        // Note: MUI Select is tricky. We can try changing the text field for amount.
        const amountInput = screen.getByLabelText(/Monto Final de la Venta/i);
        fireEvent.change(amountInput, { target: { value: '6000' } });

        // Click Save
        const saveButton = screen.getByText('Guardar Cambios');
        fireEvent.click(saveButton);

        await waitFor(() => {
            expect(salesService.update).toHaveBeenCalledWith(101, expect.objectContaining({
                montoEntregado: 6000
            }));
            expect(Swal.fire).toHaveBeenCalledWith('Éxito', 'Venta actualizada correctamente.', 'success');
        });
    });

    it('calls delete service when delete button is clicked and confirmed', async () => {
        const mockSales = [
            {
                folio: 101,
                fecha: '2023-10-27',
                vendedor: 'Vendedor 1',
                resumen: { medioPago: 'EFECTIVO', total: 5000 }
            }
        ];
        usersService.findAll.mockResolvedValue({ data: [] });
        salesService.getAdminHistory.mockResolvedValue({ data: mockSales });
        
        // Mock Swal to confirm immediately
        Swal.fire.mockResolvedValue({ isConfirmed: true });
        salesService.delete.mockResolvedValue({});

        render(<AdminSalesHistory />);

        await waitFor(() => {
            expect(screen.getByText('#101')).toBeInTheDocument();
        });

        const deleteIcon = screen.getByTestId('DeleteIcon');
        const deleteButton = deleteIcon.closest('button');
        fireEvent.click(deleteButton);

        await waitFor(() => {
            expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({
                title: 'Confirmar Devolución',
                icon: 'warning'
            }));
            expect(salesService.delete).toHaveBeenCalledWith(101);
            expect(Swal.fire).toHaveBeenCalledWith('Devolución Exitosa', expect.stringContaining('anulada'), 'success');
        });
    });
});
