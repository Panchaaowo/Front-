import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Login from './Login';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

// Mock dependencies
vi.mock('../context/AuthContext', () => ({
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

describe('Login Component', () => {
    const mockLogin = vi.fn();
    const mockNavigate = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        useAuth.mockReturnValue({ login: mockLogin });
        useNavigate.mockReturnValue(mockNavigate);
    });

    it('renders login form correctly', () => {
        render(<Login />);
        
        expect(screen.getByText('Bienvenido')).toBeInTheDocument();
        expect(screen.getByText('Inicia sesión en Pastelería Dulce Sabor')).toBeInTheDocument();
        expect(screen.getByLabelText(/RUT de Usuario/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Contraseña/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Ingresar al Sistema/i })).toBeInTheDocument();
    });

    it('handles successful login', async () => {
        mockLogin.mockResolvedValue({ success: true });
        
        render(<Login />);
        
        const rutInput = screen.getByLabelText(/RUT de Usuario/i);
        const passwordInput = screen.getByLabelText(/Contraseña/i);
        const submitButton = screen.getByRole('button', { name: /Ingresar al Sistema/i });

        fireEvent.change(rutInput, { target: { value: '1-9' } });
        fireEvent.change(passwordInput, { target: { value: 'admin123' } });
        fireEvent.click(submitButton);

        expect(mockLogin).toHaveBeenCalledWith('1-9', 'admin123');
        
        await waitFor(() => {
            expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({
                title: '¡Bienvenido!',
                icon: 'success'
            }));
        });

        // Wait for navigation (setTimeout in component)
        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/home');
        }, { timeout: 2000 });
    });

    it('handles failed login', async () => {
        mockLogin.mockResolvedValue({ success: false });
        
        render(<Login />);
        
        const rutInput = screen.getByLabelText(/RUT de Usuario/i);
        const passwordInput = screen.getByLabelText(/Contraseña/i);
        const submitButton = screen.getByRole('button', { name: /Ingresar al Sistema/i });

        fireEvent.change(rutInput, { target: { value: 'wrong' } });
        fireEvent.change(passwordInput, { target: { value: 'wrong' } });
        fireEvent.click(submitButton);

        expect(mockLogin).toHaveBeenCalledWith('wrong', 'wrong');
        
        await waitFor(() => {
            expect(Swal.fire).toHaveBeenCalledWith('Error', 'Credenciales inválidas.', 'error');
        });

        expect(mockNavigate).not.toHaveBeenCalled();
    });
});
