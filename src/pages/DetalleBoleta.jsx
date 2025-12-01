import React from 'react';
import { Box, Typography, Paper, Avatar } from '@mui/material';
import CakeIcon from '@mui/icons-material/Cake';

const DetalleBoleta = ({ item, subtotal }) => {
    return (
        <Paper 
            elevation={0} 
            sx={{ 
                p: 2, 
                mb: 2, 
                borderRadius: 3, 
                bgcolor: '#fff',
                border: '1px solid #f0f0f0',
                display: 'flex', 
                alignItems: 'center',
                gap: 2,
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                    borderColor: '#e0e0e0'
                }
            }}
        >
           
            <Avatar 
                sx={{ 
                    bgcolor: '#fff8e1', 
                    color: '#d97706', 
                    width: 48, 
                    height: 48,
                    borderRadius: 2
                }}
            >
                <CakeIcon />
            </Avatar>

           
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Typography 
                    variant="subtitle2" 
                    fontWeight="bold" 
                    color="#333"
                    noWrap
                    sx={{ fontSize: '0.95rem', mb: 0.5 }}
                >
                    {item.nombre}
                </Typography>
                
                <Box display="flex" alignItems="center" gap={1}>
                    <Box 
                        sx={{ 
                            bgcolor: '#f5f5f5', 
                            px: 1, 
                            py: 0.2, 
                            borderRadius: 1,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5
                        }}
                    >
                        <Typography variant="caption" fontWeight="bold" color="text.secondary">
                            x{item.cantidad}
                        </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                        a ${item.precio.toLocaleString('es-CL')} c/u
                    </Typography>
                </Box>
            </Box>

            
            <Box textAlign="right">
                <Typography 
                    variant="body1" 
                    fontWeight="bold" 
                    color="#d97706"
                >
                    ${subtotal.toLocaleString('es-CL')}
                </Typography>
            </Box>
        </Paper>
    );
};

export default DetalleBoleta;