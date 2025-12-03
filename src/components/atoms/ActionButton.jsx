import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PropTypes from 'prop-types';

const ActionButton = ({ type, onClick, tooltip, icon, ...props }) => {
    const config = {
        edit: {
            icon: <EditIcon fontSize="small" />,
            color: '#3b82f6',
            bgcolor: '#eff6ff',
            hover: '#dbeafe',
            defaultTooltip: 'Editar'
        },
        delete: {
            icon: <DeleteIcon fontSize="small" />,
            color: '#ef4444',
            bgcolor: '#fef2f2',
            hover: '#fee2e2',
            defaultTooltip: 'Eliminar'
        },
        view: {
            icon: <VisibilityIcon fontSize="small" />,
            color: '#8b5cf6',
            bgcolor: '#f5f3ff',
            hover: '#ede9fe',
            defaultTooltip: 'Ver Detalles'
        }
    };

    const defaults = config[type] || config.edit;
    const iconToRender = icon || defaults.icon;

    return (
        <Tooltip title={tooltip || defaults.defaultTooltip}>
            <IconButton
                size="small"
                onClick={onClick}
                sx={{
                    color: defaults.color,
                    bgcolor: defaults.bgcolor,
                    '&:hover': { bgcolor: defaults.hover },
                    ...props.sx
                }}
                {...props}
            >
                {iconToRender}
            </IconButton>
        </Tooltip>
    );
};

ActionButton.propTypes = {
    type: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired,
    tooltip: PropTypes.string,
    icon: PropTypes.node
};

export default ActionButton;
