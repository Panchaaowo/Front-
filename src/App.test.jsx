import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import App from './App';


vi.mock('./pages/Login', () => ({ default: () => <div data-testid="login-page">Login Page</div> }));
vi.mock('./pages/Home', () => ({ default: () => <div data-testid="home-page">Home Page</div> }));
vi.mock('./pages/Boleta', () => ({ default: () => <div data-testid="boleta-page">Boleta Page</div> }));
vi.mock('./pages/admin/Dashboard', () => ({ default: () => <div data-testid="dashboard-page">Dashboard Page</div> }));
vi.mock('./pages/admin/Inventory', () => ({ default: () => <div data-testid="inventory-page">Inventory Page</div> }));
vi.mock('./pages/admin/AdminUsers', () => ({ default: () => <div data-testid="users-page">Users Page</div> }));
vi.mock('./pages/admin/Categories', () => ({ default: () => <div data-testid="categories-page">Categories Page</div> }));
vi.mock('./pages/admin/AdminSalesHistory', () => ({ default: () => <div data-testid="sales-history-page">Sales History Page</div> }));


vi.mock('./context/AuthContext', () => ({
    AuthProvider: ({ children }) => <div>{children}</div>
}));
vi.mock('./context/CartContext', () => ({
    CartProvider: ({ children }) => <div>{children}</div>
}));


vi.mock('./components/organisms/ProtectedRoute', () => ({
    default: ({ children }) => <div>{children}</div>
}));

describe('App Routing', () => {
    it('redirects root path to login', () => {
        render(
            <MemoryRouter initialEntries={['/']}>
                <App />
            </MemoryRouter>
        );
        expect(screen.getByTestId('login-page')).toBeInTheDocument();
    });

    it('renders login page', () => {
        render(
            <MemoryRouter initialEntries={['/login']}>
                <App />
            </MemoryRouter>
        );
        expect(screen.getByTestId('login-page')).toBeInTheDocument();
    });

    it('renders home page on /home', () => {
        render(
            <MemoryRouter initialEntries={['/home']}>
                <App />
            </MemoryRouter>
        );
        expect(screen.getByTestId('home-page')).toBeInTheDocument();
    });

    it('renders boleta page on /boleta', () => {
        render(
            <MemoryRouter initialEntries={['/boleta']}>
                <App />
            </MemoryRouter>
        );
        expect(screen.getByTestId('boleta-page')).toBeInTheDocument();
    });

    it('renders admin dashboard on /admin/dashboard', () => {
        render(
            <MemoryRouter initialEntries={['/admin/dashboard']}>
                <App />
            </MemoryRouter>
        );
        expect(screen.getByTestId('dashboard-page')).toBeInTheDocument();
    });

    it('renders inventory page on /admin/inventory', () => {
        render(
            <MemoryRouter initialEntries={['/admin/inventory']}>
                <App />
            </MemoryRouter>
        );
        expect(screen.getByTestId('inventory-page')).toBeInTheDocument();
    });

    it('renders categories page on /admin/categories', () => {
        render(
            <MemoryRouter initialEntries={['/admin/categories']}>
                <App />
            </MemoryRouter>
        );
        expect(screen.getByTestId('categories-page')).toBeInTheDocument();
    });

    it('renders users page on /admin/users', () => {
        render(
            <MemoryRouter initialEntries={['/admin/users']}>
                <App />
            </MemoryRouter>
        );
        expect(screen.getByTestId('users-page')).toBeInTheDocument();
    });

    it('renders sales history page on /admin/sales-history', () => {
        render(
            <MemoryRouter initialEntries={['/admin/sales-history']}>
                <App />
            </MemoryRouter>
        );
        expect(screen.getByTestId('sales-history-page')).toBeInTheDocument();
    });

    it('redirects unknown routes to login', () => {
        render(
            <MemoryRouter initialEntries={['/unknown-route-xyz']}>
                <App />
            </MemoryRouter>
        );
        expect(screen.getByTestId('login-page')).toBeInTheDocument();
    });
});
