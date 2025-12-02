import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AdminLayout from './AdminLayout';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation, BrowserRouter } from 'react-router-dom';

vi.mock('../../context/AuthContext', () => ({
    useAuth: vi.fn(),
}));

vi.mock('react-router-dom', () => ({
    useNavigate: vi.fn(),
    useLocation: vi.fn(),
}));

// Mock Sidebar to simplify AdminLayout tests
vi.mock('../organisms/Sidebar', () => ({
    default: () => <div data-testid="sidebar">Sidebar Mock</div>
}));

describe('AdminLayout Component', () => {
    const mockNavigate = vi.fn();
    const mockLogout = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        useNavigate.mockReturnValue(mockNavigate);
        useLocation.mockReturnValue({ pathname: '/admin/dashboard' });
        useAuth.mockReturnValue({ logout: mockLogout });
    });

    it('renders layout structure and children', () => {
        render(
            <AdminLayout>
                <div data-testid="child-content">Main Content</div>
            </AdminLayout>
        );

        expect(screen.getByTestId('sidebar')).toBeInTheDocument();
        expect(screen.getByTestId('child-content')).toBeInTheDocument();
    });
});
