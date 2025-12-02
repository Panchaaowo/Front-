import React from 'react';
import { Chip } from '@mui/material';
import PropTypes from 'prop-types';

const StatusChip = ({ label, color = 'default', variant = 'filled', ...props }) => {
    const getColors = (colorType) => {
        switch (colorType) {
            case 'success':
                return { bgcolor: '#dcfce7', color: '#16a34a' };
            case 'error':
                return { bgcolor: '#fee2e2', color: '#dc2626' };
            case 'warning':
                return { bgcolor: '#fef3c7', color: '#d97706' };
            case 'info':
                return { bgcolor: '#dbeafe', color: '#2563eb' };
            case 'default':
            default:
                return { bgcolor: '#f1f5f9', color: '#475569' };
        }
    };

    const styles = getColors(color);

    return (
        <Chip
            label={label}
            size="small"
            variant={variant}
            sx={{
                bgcolor: variant === 'filled' ? styles.bgcolor : 'transparent',
                color: styles.color,
                fontWeight: '600',
                borderRadius: 1,
                borderColor: variant === 'outlined' ? styles.color : 'transparent',
                ...props.sx
            }}
            {...props}
        />
    );
};

StatusChip.propTypes = {
    label: PropTypes.string.isRequired,
    color: PropTypes.oneOf(['success', 'error', 'warning', 'info', 'default']),
    variant: PropTypes.oneOf(['filled', 'outlined']),
};

export default StatusChip;
