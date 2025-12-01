import { Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography, Divider, Button } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import InventoryIcon from '@mui/icons-material/Inventory'; 
import StorefrontIcon from '@mui/icons-material/Storefront'; 
import GroupIcon from '@mui/icons-material/Group'; 
import CategoryIcon from '@mui/icons-material/Category';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import LogoutIcon from '@mui/icons-material/Logout';
import HistoryIcon from '@mui/icons-material/History'; 
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; 

const AdminLayout = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { logout } = useAuth();
    const brandColor = '#d97706'; 

    const menuItems = [
        
        { text: 'Panel de Control', icon: <DashboardIcon />, path: '/admin/dashboard' },
        { text: 'Inventario', icon: <InventoryIcon />, path: '/admin/inventory' },
        { text: 'Categorías', icon: <CategoryIcon />, path: '/admin/categories' },
        { text: 'Personal', icon: <GroupIcon />, path: '/admin/users' },
    ];
    
    const reportItems = [
        { 
            text: 'Mi Cuadre Diario', 
            icon: <PointOfSaleIcon />, 
            path: '/home', 
            state: { openCashout: true }
        },
        { text: 'Reporte Global', icon: <HistoryIcon />, path: '/admin/sales-history' },
    ];

    const renderMenuItem = (item) => {
        const isSelected = location.pathname.startsWith(item.path);
        return (
            <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
                <ListItemButton 
                    onClick={() => navigate(item.path, { state: item.state })} 
                    sx={{ 
                        borderRadius: 3, 
                        mx: 1.5,
                        py: 1.5,
                        transition: 'all 0.2s ease-in-out',
                        bgcolor: isSelected ? 'rgba(217, 119, 6, 0.08)' : 'transparent',
                        color: isSelected ? brandColor : '#64748b', 
                        '&:hover': { 
                            bgcolor: isSelected ? 'rgba(217, 119, 6, 0.12)' : '#f1f5f9',
                            transform: 'translateX(4px)'
                        }
                    }}
                >
                    <ListItemIcon sx={{ 
                        minWidth: 40,
                        color: isSelected ? brandColor : '#94a3b8' 
                    }}>
                        {item.icon}
                    </ListItemIcon>
                    <ListItemText 
                        primary={item.text} 
                        primaryTypographyProps={{ 
                            fontWeight: isSelected ? 700 : 500,
                            fontSize: '0.95rem'
                        }} 
                    />
                </ListItemButton>
            </ListItem>
        );
    };

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f8fafc' }}> 
            <Box sx={{ 
                width: 280, 
                bgcolor: '#ffffff', 
                borderRight: '1px dashed #e2e8f0', 
                position: 'fixed', 
                height: '100%', 
                top: 0, 
                left: 0, 
                zIndex: 1200,
                boxShadow: '4px 0 24px rgba(0,0,0,0.02)' 
            }}>
                <Box p={4} textAlign="center" mb={2}>
                    <Box 
                        sx={{ 
                            width: 48, height: 48, bgcolor: brandColor, borderRadius: 3, 
                            display: 'flex', alignItems: 'center', justifyContent: 'center', 
                            mx: 'auto', mb: 2, boxShadow: '0 8px 16px rgba(217, 119, 6, 0.25)'
                        }}
                    >
                        <StorefrontIcon sx={{ color: 'white', fontSize: 28 }} />
                    </Box>
                    <Typography variant="h6" fontWeight="800" color="#1e293b" letterSpacing="-0.5px">
                        1000 Sabores
                    </Typography>
                    <Typography variant="caption" color="#94a3b8" fontWeight="600" letterSpacing="1px" textTransform="uppercase">
                        Admin Panel
                    </Typography>
                </Box>

                <List sx={{ px: 0 }}>
                    <Typography variant="caption" fontWeight="700" color="#cbd5e1" sx={{ display: 'block', px: 4, mb: 2, fontSize: '0.75rem' }}>
                        GENERAL
                    </Typography>
                    {menuItems.map(renderMenuItem)}
                </List>
                
                <Box my={2} mx={4} borderTop="1px dashed #e2e8f0" />

                
                <List sx={{ px: 0 }}>
                    <Typography variant="caption" fontWeight="700" color="#cbd5e1" sx={{ display: 'block', px: 4, mb: 2, fontSize: '0.75rem' }}>
                        FINANZAS
                    </Typography>
                    {reportItems.map(renderMenuItem)}
                </List>
                
               
                <Box sx={{ position: 'absolute', bottom: 0, width: '100%', p: 3, bgcolor: '#ffffff' }}>
                    <Button 
                        variant="contained" 
                        fullWidth 
                        startIcon={<PointOfSaleIcon />}
                        onClick={() => navigate('/home')} 
                        sx={{ 
                            bgcolor: '#1e293b', 
                            color: 'white',
                            borderRadius: 3,
                            py: 1.5,
                            textTransform: 'none',
                            fontWeight: 'bold',
                            boxShadow: '0 10px 20px rgba(30, 41, 59, 0.15)',
                            '&:hover': { bgcolor: '#0f172a', boxShadow: '0 10px 20px rgba(30, 41, 59, 0.25)' }
                        }}
                    >
                        Ir a Caja
                    </Button>
                    <Button 
                        variant="text" 
                        fullWidth 
                        startIcon={<LogoutIcon />}
                        onClick={logout}
                        sx={{ mt: 1, color: '#ef4444', fontWeight: '600', textTransform: 'none', '&:hover': { bgcolor: '#fef2f2' } }}
                    >
                        Salir
                    </Button>
                </Box>
            </Box>

            <Box component="main" sx={{ flexGrow: 1, p: 5, ml: '280px', overflowY: 'auto' }}>
                {children}
            </Box>
        </Box>
    );
};

export default AdminLayout;