import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PropTypes from 'prop-types';

const ActionButton = ({ type, onClick, tooltip, ...props }) => {
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
        }
    };

    const { icon, color, bgcolor, hover, defaultTooltip } = config[type] || config.edit;

    return (
        <Tooltip title={tooltip || defaultTooltip}>
            <IconButton
                size="small"
                onClick={onClick}
                sx={{
                    color: color,
                    bgcolor: bgcolor,
                    '&:hover': { bgcolor: hover },
                    ...props.sx
                }}
                {...props}
            >
                {icon}
            </IconButton>
        </Tooltip>
    );
};

ActionButton.propTypes = {
    type: PropTypes.oneOf(['edit', 'delete']).isRequired,
    onClick: PropTypes.func.isRequired,
    tooltip: PropTypes.string,
};

export default ActionButton;
