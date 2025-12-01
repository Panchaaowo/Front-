import { render, screen, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AuthProvider, useAuth } from './AuthContext';
import { authService } from '../api/services';


vi.mock('../api/services', () => ({
    authService: {
        login: vi.fn()
    }
}));


const TestComponent = () => {
    const { user, isAuthenticated, login, logout, loading } = useAuth();
    
    if (loading) return <div>Loading...</div>;

    return (
        <div>
            <div data-testid="auth-status">{isAuthenticated ? 'Authenticated' : 'Not Authenticated'}</div>
            <div data-testid="user-name">{user ? user.nombre : 'No User'}</div>
            <button onClick={() => login('1-9', 'password')}>Login</button>
            <button onClick={logout}>Logout</button>
        </div>
    );
};

describe('AuthContext', () => {
    
    let store = {};
    const localStorageMock = {
        getItem: vi.fn((key) => store[key] || null),
        setItem: vi.fn((key, value) => { store[key] = value.toString(); }),
        removeItem: vi.fn((key) => { delete store[key]; }),
        clear: vi.fn(() => { store = {}; })
    };

   
    const originalLocation = window.location;

    beforeEach(() => {
        store = {};
        vi.clearAllMocks();
        
       
        localStorageMock.getItem.mockImplementation((key) => store[key] || null);
        localStorageMock.setItem.mockImplementation((key, value) => { store[key] = value.toString(); });
        localStorageMock.removeItem.mockImplementation((key) => { delete store[key]; });
        localStorageMock.clear.mockImplementation(() => { store = {}; });

       
        Object.defineProperty(window, 'localStorage', { 
            value: localStorageMock,
            writable: true 
        });
        
       
        try {
            delete window.location;
            window.location = { href: '' };
        } catch (e) {
            console.log('Could not delete window.location, trying to mock href only');
        }
    });

    afterEach(() => {
        
        window.location = originalLocation;
    });

    it('initializes with no user if localStorage is empty', async () => {
        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        await waitFor(() => expect(screen.queryByText('Loading...')).not.toBeInTheDocument());
        expect(screen.getByTestId('auth-status')).toHaveTextContent('Not Authenticated');
        expect(screen.getByTestId('user-name')).toHaveTextContent('No User');
    });

    it('initializes with user if localStorage has data', async () => {
        const mockUser = { id: 1, nombre: 'Test User', rol: 'admin' };
        
        store['token'] = 'fake-token';
        store['user'] = JSON.stringify(mockUser);

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        await waitFor(() => expect(screen.queryByText('Loading...')).not.toBeInTheDocument());
        expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
        expect(screen.getByTestId('user-name')).toHaveTextContent('Test User');
    });

    it('handles successful login', async () => {
        const mockResponse = {
            data: {
                access_token: 'new-token',
                rol: 'admin',
                rut: '1-9',
                id: 1,
                name: 'Admin User'
            }
        };
        authService.login.mockResolvedValue(mockResponse);

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        await waitFor(() => expect(screen.queryByText('Loading...')).not.toBeInTheDocument());

       
        const loginButton = screen.getByText('Login');
        await act(async () => {
            loginButton.click();
        });

        await waitFor(() => {
            expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
            expect(screen.getByTestId('user-name')).toHaveTextContent('Admin User');
        });

        expect(localStorageMock.setItem).toHaveBeenCalledWith('token', 'new-token');
        expect(localStorageMock.setItem).toHaveBeenCalledWith('user', expect.stringContaining('Admin User'));
    });

    it('handles failed login', async () => {
        authService.login.mockRejectedValue({ response: { data: { message: 'Invalid credentials' } } });

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        await waitFor(() => expect(screen.queryByText('Loading...')).not.toBeInTheDocument());

        const loginButton = screen.getByText('Login');
        await act(async () => {
            loginButton.click();
        });

        expect(screen.getByTestId('auth-status')).toHaveTextContent('Not Authenticated');
        expect(localStorageMock.setItem).not.toHaveBeenCalled();
    });

    it('handles logout', async () => {
        
        const mockUser = { id: 1, nombre: 'Test User', rol: 'admin' };
        store['token'] = 'fake-token';
        store['user'] = JSON.stringify(mockUser);

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        await waitFor(() => expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated'));

        const logoutButton = screen.getByText('Logout');
        await act(async () => {
            logoutButton.click();
        });

        expect(localStorageMock.removeItem).toHaveBeenCalledWith('token');
        expect(localStorageMock.removeItem).toHaveBeenCalledWith('user');
        expect(screen.getByTestId('auth-status')).toHaveTextContent('Not Authenticated');
        expect(window.location.href).toBe('/login');
    });
});
