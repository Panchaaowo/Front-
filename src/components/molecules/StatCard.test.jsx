import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import StatCard from './StatCard';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

describe('StatCard Component', () => {
    it('renders title and value correctly', () => {
        render(
            <StatCard 
                title="Test Title" 
                value="123" 
                icon={<TrendingUpIcon data-testid="icon" />} 
                color="#000" 
            />
        );
        
        expect(screen.getByText('Test Title')).toBeInTheDocument();
        expect(screen.getByText('123')).toBeInTheDocument();
        expect(screen.getByTestId('icon')).toBeInTheDocument();
    });

    it('renders footer when provided', () => {
        render(
            <StatCard 
                title="Test Title" 
                value="123" 
                icon={<TrendingUpIcon />} 
                color="#000" 
                footer={<div data-testid="footer">Footer Content</div>}
            />
        );
        
        expect(screen.getByTestId('footer')).toBeInTheDocument();
        expect(screen.getByText('Footer Content')).toBeInTheDocument();
    });
});
