import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AdminUsers from './AdminUsers';
import { usersService } from '../../api/services';
import Swal from 'sweetalert2';


vi.mock('../../api/services', () => ({
    usersService: {
        findAll: vi.fn(),
        create: vi.fn(),
    },
}));

vi.mock('../../components/templates/AdminLayout', () => ({
    default: ({ children }) => <div data-testid="admin-layout">{children}</div>,
}));

vi.mock('sweetalert2', () => ({
    default: {
        fire: vi.fn(),
    },
}));


vi.mock('@mui/icons-material/PersonAdd', () => ({ default: () => <span data-testid="PersonAddIcon">PersonAdd</span> }));
vi.mock('@mui/icons-material/Badge', () => ({ default: () => <span data-testid="BadgeIcon">Badge</span> }));
vi.mock('@mui/icons-material/Lock', () => ({ default: () => <span data-testid="LockIcon">Lock</span> }));
vi.mock('@mui/icons-material/Security', () => ({ default: () => <span data-testid="SecurityIcon">Security</span> }));
vi.mock('@mui/icons-material/AccountCircle', () => ({ default: () => <span data-testid="AccountCircleIcon">AccountCircle</span> }));

describe('AdminUsers', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders correctly and fetches users', async () => {
        usersService.findAll.mockResolvedValue({ data: [] });

        render(<AdminUsers />);

        expect(screen.getByText('Gestión de Personal')).toBeInTheDocument();
        expect(screen.getByText('Nuevo Empleado')).toBeInTheDocument();
        
        await waitFor(() => {
            expect(usersService.findAll).toHaveBeenCalled();
        });
    });

    it('displays users list correctly', async () => {
        const mockUsers = [
            { id: 1, name: 'Juan Perez', rut: '12345678-9', rol: 'vendedor', createdAt: '2023-01-01' },
            { id: 2, name: 'Admin User', rut: '98765432-1', rol: 'admin', createdAt: '2023-01-02' }
        ];
        usersService.findAll.mockResolvedValue({ data: mockUsers });

        render(<AdminUsers />);

        await waitFor(() => {
            expect(screen.getByText('Juan Perez')).toBeInTheDocument();
            expect(screen.getByText('12345678-9')).toBeInTheDocument();
            expect(screen.getByText('VENDEDOR')).toBeInTheDocument();
            
            expect(screen.getByText('Admin User')).toBeInTheDocument();
            expect(screen.getByText('98765432-1')).toBeInTheDocument();
            expect(screen.getByText('ADMIN')).toBeInTheDocument();
        });
    });

    it('creates a new user successfully', async () => {
        usersService.findAll.mockResolvedValue({ data: [] });
        usersService.create.mockResolvedValue({});

        render(<AdminUsers />);

        
        await waitFor(() => {
            expect(usersService.findAll).toHaveBeenCalled();
        });

        fireEvent.change(screen.getByLabelText(/Nombre Completo/i), { target: { value: 'New User' } });
        fireEvent.change(screen.getByLabelText(/RUT/i), { target: { value: '11111111-1' } });
        fireEvent.change(screen.getByLabelText(/Contraseña/i), { target: { value: 'password123' } });
    
        const roleSelect = screen.getByRole('combobox');
        fireEvent.mouseDown(roleSelect);
        
        const listbox = screen.getByRole('listbox');
        const option = within(listbox).getByText('Administrador');
        fireEvent.click(option);

        const submitButton = screen.getByRole('button', { name: /Registrar Usuario/i });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(usersService.create).toHaveBeenCalledWith({
                name: 'New User',
                rut: '11111111-1',
                password: 'password123',
                rol: 'admin'
            });
            expect(Swal.fire).toHaveBeenCalledWith('Éxito', 'Usuario creado correctamente', 'success');
            expect(usersService.findAll).toHaveBeenCalledTimes(2); 
        });
    });

    it('handles create user error', async () => {
        usersService.findAll.mockResolvedValue({ data: [] });
        usersService.create.mockRejectedValue(new Error('Error creating user'));

        render(<AdminUsers />);

        await waitFor(() => {
            expect(usersService.findAll).toHaveBeenCalled();
        });

        fireEvent.change(screen.getByLabelText(/Nombre Completo/i), { target: { value: 'New User' } });
        fireEvent.change(screen.getByLabelText(/RUT/i), { target: { value: '11111111-1' } });
        fireEvent.change(screen.getByLabelText(/Contraseña/i), { target: { value: 'password123' } });
        
        const submitButton = screen.getByRole('button', { name: /Registrar Usuario/i });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(Swal.fire).toHaveBeenCalledWith('Error', 'El RUT ya existe o faltan datos', 'error');
        });
    });
});
