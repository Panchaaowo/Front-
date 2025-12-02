import { useState, useEffect } from 'react';
import AdminLayout from '../../components/templates/AdminLayout';
import StatCard from '../../components/molecules/StatCard';
import { Container, Grid, Paper, Typography, Box, LinearProgress, Button, Alert, CircularProgress, Chip } from '@mui/material'; 
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import WarningIcon from '@mui/icons-material/Warning';
import InventoryIcon from '@mui/icons-material/Inventory';
import HistoryIcon from '@mui/icons-material/History';
import PeopleIcon from '@mui/icons-material/People';
import CategoryIcon from '@mui/icons-material/Category';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2'; 
import { useAuth } from '../../context/AuthContext'; 
import { productsService } from '../../api/services'; 

const Dashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuth(); 
    const isAdmin = user && user.rol === 'admin';
    const brandColor = '#2e7d32'; 

    const [topProducts, setTopProducts] = useState([]);
    const [loadingTop, setLoadingTop] = useState(true);
    
    const [stats, setStats] = useState({
        totalPedidos: 145,
        stockBajoCount: 0,
        ventasTotalHoy: 195000,
        productosAtendidos: 12,
    });
    
    const formatCurrency = (value) => `$${Number(value).toLocaleString('es-CL')}`;

    const cargarTopProductos = async () => {
        setLoadingTop(true);
        try {
            const res = await productsService.getAll(); 
            
            let fetchedProducts = res.data || res;
            
            if (fetchedProducts && fetchedProducts.length > 0) {
                 
                 const rankedByStock = fetchedProducts
                     .map(p => ({ 
                         nombre: p.nombre, 
                         stock: p.stock 
                     }))
                     .sort((a, b) => b.stock - a.stock)
                     .slice(0, 6); 

                 if (rankedByStock.length === 0) {
                      setTopProducts([]);
                 } else {
                      const maxStock = rankedByStock[0].stock || 1;
                      
                      const mappedProducts = rankedByStock.map(prod => ({
                          name: prod.nombre,
                          sales: prod.stock, 
                          val: Math.round((prod.stock / maxStock) * 100), 
                      }));
                     
                     setTopProducts(mappedProducts);
                 }

                 const lowStockCount = fetchedProducts.filter(p => p.stock < 10).length;
                 setStats(prev => ({ ...prev, stockBajoCount: lowStockCount }));

            } else {
                 setTopProducts([]);
                 setStats(prev => ({ ...prev, stockBajoCount: 0 }));
            }
        } catch (error) {
            console.error("Error cargando productos:", error);
            Swal.fire('Error de Conexión', 'No se pudo cargar la lista de productos.', 'error');
            setTopProducts([]);
        } finally {
            setLoadingTop(false);
        }
    };

    useEffect(() => {
        if (isAdmin) {
            cargarTopProductos();
        }
    }, [isAdmin]);

    const handleGoToInventory = () => {
        navigate('/admin/inventory');
    };
    
    const handleGenerateReport = () => {
        Swal.fire({
            title: 'Generando Reporte...',
            text: 'Descarga simulada de Ventas Globales en formato CSV.',
            icon: 'info',
            timer: 2000,
            showConfirmButton: false
        });
    };

    if (!isAdmin) {
        return <AdminLayout><Alert severity="error">Acceso no autorizado. Solo los administradores pueden ver esta página.</Alert></AdminLayout>;
    }

    return (
        <AdminLayout>
            <Container maxWidth="xl" sx={{ mt: 2 }}>
                <Typography variant="h4" fontWeight="bold" sx={{ fontFamily: 'serif', color: '#333' }}>
                    Panel de Control Ejecutivo
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={4}></Typography>

                <Grid container spacing={4} mb={6}>
                    
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <StatCard 
                            title="Pedidos del Día" 
                            value={stats.totalPedidos} 
                            icon={<TrendingUpIcon fontSize="medium" />} 
                            color="#16a34a" 
                            decorationColor="#f0fdf4"
                            footer={
                                <Box display="flex" alignItems="center" gap={1}>
                                    <Chip label="+5%" size="small" sx={{ bgcolor: '#dcfce7', color: '#15803d', fontWeight: 'bold', borderRadius: 1 }} />
                                    <Typography variant="caption" color="#94a3b8" fontWeight="600">desde ayer</Typography>
                                </Box>
                            }
                        />
                    </Grid>
                    
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <StatCard 
                            title="Alertas de Stock" 
                            value={stats.stockBajoCount} 
                            icon={<WarningIcon fontSize="medium" />} 
                            color="#dc2626" 
                            decorationColor="#fef2f2"
                            footer={
                                <Button 
                                    size="small" 
                                    onClick={handleGoToInventory}
                                    sx={{ mt: 0, color: '#ef4444', fontWeight: 'bold', textTransform: 'none', p: 0, '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' } }}
                                >
                                    Revisar inventario →
                                </Button>
                            }
                        />
                    </Grid>
                    
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <StatCard 
                            title="Ventas Hoy" 
                            value={formatCurrency(stats.ventasTotalHoy)} 
                            icon={<ShoppingBagIcon fontSize="medium" />} 
                            color={brandColor} 
                            decorationColor="#fff7ed"
                            footer={
                                <Typography variant="body2" color="#94a3b8" fontWeight="600" mt={0}>{stats.productosAtendidos} productos vendidos</Typography>
                            }
                        />
                    </Grid>
                </Grid>
                                
                <Box mb={6}>
                    <Typography variant="h6" fontWeight="800" color="#1e293b" mb={3}>Acciones Rápidas</Typography>
                    <Grid container spacing={3}>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <Paper 
                                elevation={0}
                                onClick={handleGoToInventory}
                                sx={{ 
                                    p: 3, 
                                    borderRadius: 4, 
                                    border: '2px dashed #e2e8f0', 
                                    bgcolor: 'transparent', 
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: 2,
                                    '&:hover': { borderColor: brandColor, bgcolor: '#fff7ed', transform: 'translateY(-4px)' }
                                }}
                            >
                                <Box sx={{ p: 2, borderRadius: '50%', bgcolor: 'white', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', color: brandColor }}>
                                    <InventoryIcon fontSize="large" />
                                </Box>
                                <Typography fontWeight="700" color="#475569">Gestionar Inventario</Typography>
                            </Paper>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <Paper 
                                elevation={0}
                                onClick={() => navigate('/admin/sales-history')}
                                sx={{ 
                                    p: 3, 
                                    borderRadius: 4, 
                                    border: '2px dashed #e2e8f0', 
                                    bgcolor: 'transparent', 
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: 2,
                                    '&:hover': { borderColor: '#3b82f6', bgcolor: '#eff6ff', transform: 'translateY(-4px)' }
                                }}
                            >
                                <Box sx={{ p: 2, borderRadius: '50%', bgcolor: 'white', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', color: '#3b82f6' }}>
                                    <HistoryIcon fontSize="large" />
                                </Box>
                                <Typography fontWeight="700" color="#475569">Historial de Ventas</Typography>
                            </Paper>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <Paper 
                                elevation={0}
                                onClick={() => navigate('/admin/users')}
                                sx={{ 
                                    p: 3, 
                                    borderRadius: 4, 
                                    border: '2px dashed #e2e8f0', 
                                    bgcolor: 'transparent', 
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: 2,
                                    '&:hover': { borderColor: '#8b5cf6', bgcolor: '#f5f3ff', transform: 'translateY(-4px)' }
                                }}
                            >
                                <Box sx={{ p: 2, borderRadius: '50%', bgcolor: 'white', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', color: '#8b5cf6' }}>
                                    <PeopleIcon fontSize="large" />
                                </Box>
                                <Typography fontWeight="700" color="#475569">Usuarios</Typography>
                            </Paper>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <Paper 
                                elevation={0}
                                onClick={() => navigate('/admin/categories')}
                                sx={{ 
                                    p: 3, 
                                    borderRadius: 4, 
                                    border: '2px dashed #e2e8f0', 
                                    bgcolor: 'transparent', 
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: 2,
                                    '&:hover': { borderColor: '#ec4899', bgcolor: '#fdf2f8', transform: 'translateY(-4px)' }
                                }}
                            >
                                <Box sx={{ p: 2, borderRadius: '50%', bgcolor: 'white', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', color: '#ec4899' }}>
                                    <CategoryIcon fontSize="large" />
                                </Box>
                                <Typography fontWeight="700" color="#475569">Categorías</Typography>
                            </Paper>
                        </Grid>
                    </Grid>
                </Box>

                <Box>
                    <Typography variant="h6" fontWeight="800" color="#1e293b" mb={3}>Productos Destacados</Typography>
                    <Paper elevation={0} sx={{ p: 4, borderRadius: 4, bgcolor: 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                        <Box display="flex" alignItems="center" gap={2} mb={4}>
                            <Box sx={{ p: 1, borderRadius: 2, bgcolor: '#f1f5f9', color: '#64748b' }}>
                                <TrendingUpIcon />
                            </Box>
                            <Box>
                                <Typography variant="subtitle1" fontWeight="700" color="#1e293b">Top Stock</Typography>
                                <Typography variant="body2" color="#94a3b8">Productos con mayor disponibilidad</Typography>
                            </Box>
                        </Box>

                        {loadingTop ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
                                <CircularProgress sx={{ color: brandColor }} />
                            </Box>
                        ) : topProducts.length === 0 ? (
                            <Typography color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
                                No hay productos disponibles para mostrar el Top 6.
                            </Typography>
                        ) : (
                            <Grid container spacing={4}>
                                {topProducts.map((prod, i) => (
                                    <Grid size={{ xs: 12, md: 6 }} key={prod.name}>
                                        <Box mb={1}>
                                            <Box display="flex" justifyContent="space-between" mb={1}>
                                                <Typography fontWeight="600" color="#334155">{prod.name}</Typography>
                                                <Typography variant="caption" fontWeight="700" color="#64748b">{prod.sales} un.</Typography>
                                            </Box>
                                            <LinearProgress 
                                                variant="determinate" 
                                                value={prod.val} 
                                                sx={{ 
                                                    height: 10, 
                                                    borderRadius: 5, 
                                                    bgcolor: '#f1f5f9', 
                                                    '& .MuiLinearProgress-bar': { 
                                                        bgcolor: i < 3 ? brandColor : '#cbd5e1', 
                                                        borderRadius: 5 
                                                    } 
                                                }} 
                                            />
                                        </Box>
                                    </Grid>
                                ))}
                            </Grid>
                        )}
                    </Paper>
                </Box>
            </Container>
        </AdminLayout>
    );
};

export default Dashboard;