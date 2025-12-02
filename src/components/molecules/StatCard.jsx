import React from 'react';
import { Paper, Box, Typography } from '@mui/material';
import PropTypes from 'prop-types';

const StatCard = ({ title, value, icon, color, footer, decorationColor }) => {
    return (
        <Paper elevation={0} sx={{ p: 4, borderRadius: 4, bgcolor: 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', height: '100%', position: 'relative', overflow: 'hidden' }}>
            <Box sx={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: '50%', bgcolor: decorationColor || `${color}20`, opacity: 0.5 }} />
            <Box display="flex" flexDirection="column" height="100%">
                <Box display="flex" alignItems="center" gap={2} mb={3}>
                    <Box sx={{ p: 1.5, borderRadius: 3, bgcolor: `${color}20`, color: color, display: 'flex' }}>
                        {icon}
                    </Box>
                    <Typography variant="subtitle1" fontWeight="700" color="#64748b">{title}</Typography>
                </Box>
                <Box mt="auto">
                    <Typography variant="h3" fontWeight="800" color="#1e293b">{value}</Typography>
                    {footer && (
                        <Box mt={1}>
                            {footer}
                        </Box>
                    )}
                </Box>
            </Box>
        </Paper>
    );
};

StatCard.propTypes = {
    title: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    icon: PropTypes.node.isRequired,
    color: PropTypes.string.isRequired,
    footer: PropTypes.node,
    decorationColor: PropTypes.string,
};

export default StatCard;
