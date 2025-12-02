import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ProtectedRoute from './ProtectedRoute';

describe('ProtectedRoute Component', () => {
    it('renders children correctly', () => {
        render(
            <ProtectedRoute>
                <div data-testid="protected-content">Protected Content</div>
            </ProtectedRoute>
        );

        expect(screen.getByTestId('protected-content')).toBeInTheDocument();
        expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });
});
