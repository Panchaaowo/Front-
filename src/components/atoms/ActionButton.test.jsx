import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ActionButton from './ActionButton';

describe('ActionButton Component', () => {
    it('renders the edit button correctly', () => {
        const handleClick = vi.fn();
        render(<ActionButton type="edit" onClick={handleClick} />);
        
        const button = screen.getByRole('button');
        expect(button).toBeInTheDocument();
        expect(screen.getByLabelText('Editar')).toBeInTheDocument();
    });

    it('renders the delete button correctly', () => {
        const handleClick = vi.fn();
        render(<ActionButton type="delete" onClick={handleClick} />);
        
        const button = screen.getByRole('button');
        expect(button).toBeInTheDocument();
        expect(screen.getByLabelText('Eliminar')).toBeInTheDocument();
    });

    it('calls onClick when clicked', () => {
        const handleClick = vi.fn();
        render(<ActionButton type="edit" onClick={handleClick} />);
        
        const button = screen.getByRole('button');
        fireEvent.click(button);
        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('renders with custom tooltip', () => {
        const handleClick = vi.fn();
        render(<ActionButton type="edit" onClick={handleClick} tooltip="Custom Edit" />);
        
        expect(screen.getByLabelText('Custom Edit')).toBeInTheDocument();
    });
});
