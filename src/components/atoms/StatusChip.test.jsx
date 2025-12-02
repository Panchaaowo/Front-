import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import StatusChip from './StatusChip';

describe('StatusChip Component', () => {
    it('renders with label', () => {
        render(<StatusChip label="Test Status" />);
        expect(screen.getByText('Test Status')).toBeInTheDocument();
    });

    it('applies success color styles', () => {
        render(<StatusChip label="Active" color="success" />);
        const chip = screen.getByText('Active').closest('div');
        expect(chip).toBeInTheDocument();
    });

    it('applies error color styles', () => {
        render(<StatusChip label="Inactive" color="error" />);
        expect(screen.getByText('Inactive')).toBeInTheDocument();
    });

    it('renders outlined variant', () => {
        render(<StatusChip label="Outlined" variant="outlined" />);
        expect(screen.getByText('Outlined')).toBeInTheDocument();
    });
});
