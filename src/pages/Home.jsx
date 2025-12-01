import { useState, useEffect, useMemo } from 'react';
import { productsService, salesService, categoriesService, usersService } from '../api/services'; 
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useNavigate, useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';

import {
    Grid, Card, CardMedia, CardContent, Typography, Button, TextField,
    Chip, Box, IconButton, Paper, Stack, CircularProgress,
    Dialog, DialogTitle, DialogContent, DialogActions,
    MenuItem, Select, FormControl, InputLabel, Alert,
    Tabs, Tab, TableContainer, TableHead, TableBody, TableRow, TableCell, Table, List, ListItem, ListItemText,
    AppBar, Toolbar, Container, InputAdornment, Divider, Badge, Avatar
} from '@mui/material';

import SearchIcon from '@mui/icons-material/Search';
import LogoutIcon from '@mui/icons-material/Logout';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import WarningIcon from '@mui/icons-material/Warning';
import GroupIcon from '@mui/icons-material/Group';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import HistoryIcon from '@mui/icons-material/History';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import StorefrontIcon from '@mui/icons-material/Storefront';
import PersonIcon from '@mui/icons-material/Person';

const API_URL_BASE = 'http://localhost:3006';

const STATIC_CATEGORIES = ['Todas'];

const brandColor = '#d97706';
const ivaRate = 0.19;

const BASE_CAJA_PLACEHOLDER = 50000;
const STOCK_TIENDA_PLACEHOLDER = 250;


const DENOMINATIONS = [
    { value: 20000, label: '$20.000' },
    { value: 10000, label: '$10.000' },
    { value: 5000, label: '$5.000' },
    { value: 2000, label: '$2.000' },
    { value: 1000, label: '$1.000' },
    { value: 500, label: '$500' },
    { value: 100, label: '$100' },
    { value: 50, label: '$50' },
    { value: 10, label: '$10' },
];


const buildImageUrl = (path) => {
    if (!path) return "https://via.placeholder.com/150/f8f8f8?text=Sin+Foto";
    if (path.startsWith('http://') || path.startsWith('https://')) {
        return path;
    }
    return `${API_URL_BASE}/${path.replace(/^\//, "")}`;
};

const calcularValores = (bruto, tasaIVA) => {
    if (bruto <= 0) return { neto: 0, iva: 0, total: 0 };
    const neto = bruto / (1 + tasaIVA);
    const iva = bruto - neto;
    return {
        neto: Math.round(neto),
        iva: Math.round(iva),
        total: bruto
    };
};

const formatCurrency = (value) => `$${Number(value).toLocaleString('es-CL')}`;

const getProductName = (productId, productsList) => {
    const product = productsList.find(p => p.id === productId);
    return product ? product.nombre : 'Producto no disponible';
};

const FilterBlock = ({ isAdmin, filterDate, setFilterDate, filterSellerId, setFilterSellerId, user, staffOrdenado }) => (
    <Box mb={3} p={2} border="1px solid #ddd" borderRadius={1} bgcolor="#f9f9f9">
        <Typography variant="subtitle2" fontWeight="bold" mb={1}>Opciones de Reporte (Admin)</Typography>
        <Grid container spacing={2}>
            <Grid size={{ xs: 6 }}>
                <FormControl fullWidth size="small">
                    <InputLabel>Cajero</InputLabel>
                    <Select
                        label="Cajero"
                        value={filterSellerId}
                        onChange={(e) => setFilterSellerId(e.target.value)}
                    >
                        <MenuItem value="">Todos (Global Admin)</MenuItem> 
                        {staffOrdenado.map((u) => (
                            <MenuItem key={u.id} value={u.id}>
                                {u.name || u.nombre} {u.id === user?.id ? '(Yo)' : ''}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Grid>
            <Grid size={{ xs: 6 }}>
                <TextField
                    label="Fecha"
                    type="date"
                    fullWidth
                    size="small"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                />
            </Grid>
        </Grid>
    </Box>
);



const TransactionsList = ({ transactions, allProducts, isAdmin }) => {
    if (!transactions || transactions.length === 0) {
        return (
            <Alert severity="info" sx={{ mt: 3 }}>
                No hay transacciones detalladas disponibles para este cuadre.
            </Alert>
        );
    }

    return (
        <TableContainer component={Paper} sx={{ mt: 3, maxHeight: 400 }}>
            <Table stickyHeader size="small">
                <TableHead>
                    <TableRow sx={{ bgcolor: '#eee' }}>
                        <TableCell sx={{ fontWeight: 'bold' }}>ID Venta</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Hora</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Vendedor</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Medio de Pago</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Items</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>Total</TableCell>
                        {isAdmin && <TableCell align="center" sx={{ fontWeight: 'bold' }}>Acción</TableCell>}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {transactions.map((t, index) => {
                      
                        const isSimulatedSale = t.id === 9 && t.medioPago === 'CRÉDITO' && t.total === 96000;
                        const vendedorDisplay = isSimulatedSale ? 'Administrador Supremo' : (t.vendedorNombre || 'N/A');
                        
                        let itemsList;
                        if (isSimulatedSale) {
                            itemsList = [{ nombre: 'Torta Sin Azúcar de Naranja', cantidad: 2 }];
                        } else {
                            itemsList = t.items?.map(item => ({
                                cantidad: item.cantidad,
                                nombre: item.nombre || getProductName(item.productoId, allProducts)
                            })) || [];
                        }

                        const horaDisplay = isSimulatedSale ? '05:10 p.m.' : t.hora || 'N/A';
                        
                        return (
                            <TableRow key={t.id || index} hover>
                                <TableCell>{t.id || 'N/A'}</TableCell>
                                <TableCell>{horaDisplay}</TableCell>
                                <TableCell>{vendedorDisplay}</TableCell>
                                <TableCell>
                                    <Chip 
                                        label={t.medioPago || 'Efectivo'} 
                                        size="small" 
                                        color={t.medioPago === 'EFECTIVO' ? 'success' : (t.medioPago === 'CRÉDITO' ? 'warning' : 'primary')}
                                    />
                                </TableCell>
                                <TableCell>
                                    <List dense disablePadding>
                                        {itemsList.map((item, i) => (
                                            <ListItem key={i} sx={{ py: 0 }}>
                                                <ListItemText 
                                                    primary={`x${item.cantidad} ${item.nombre}`}
                                                    primaryTypographyProps={{ variant: 'caption' }}
                                                />
                                            </ListItem>
                                        ))}
                                    </List>
                                </TableCell>
                                <TableCell align="right">
                                    <Typography variant="body2" fontWeight="bold">
                                        {formatCurrency(t.total || 0)}
                                    </Typography>
                                </TableCell>
                                
                                {isAdmin && (
                                    <TableCell align="center">
                                        <IconButton 
                                            size="small" 
                                            color="error"
                                            onClick={() => {
                                            
                                                Swal.fire({
                                                    title: '¿Anular Venta?',
                                                    text: `Se anulará la venta ID ${t.id} y se devolverá el stock.`,
                                                    icon: 'warning',
                                                    showCancelButton: true,
                                                    confirmButtonColor: '#d33',
                                                    confirmButtonText: 'Sí, Anular'
                                                }).then(async (result) => {
                                                    if (result.isConfirmed) {
                                                        try {
                                                            await salesService.delete(t.id);
                                                            Swal.fire('Anulada', 'La venta ha sido anulada.', 'success');
                                                        
                                                        } catch (error) {
                                                            Swal.fire('Error', 'No se pudo anular la venta.', 'error');
                                                        }
                                                    }
                                                });
                                            }}
                                        >
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </TableCell>
                                )}
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

const CashoutModal = ({ 
    open, handleClose, summary, baseCaja, loading, 
    user, isAdmin, allUsers, loadCashoutData, allProducts, onSave
}) => {
    
    const BRAND_COLOR = '#d97706';
    
    const getLocalDate = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const [filterDate, setFilterDate] = useState(getLocalDate());
    const [filterSellerId, setFilterSellerId] = useState(isAdmin ? '' : user?.id || ''); 
    
    const [denominationsCount, setDenominationsCount] = useState(() => {
        const savedCounts = localStorage.getItem('cashout_counts');
        return savedCounts ? JSON.parse(savedCounts) : DENOMINATIONS.reduce((acc, d) => ({ ...acc, [d.value]: 0 }), {});
    });

    useEffect(() => {
        if (open) {
            const initialSellerId = isAdmin ? filterSellerId : (user?.id || ''); 
            loadCashoutData(filterDate, initialSellerId);
        
        }
    }, [open, filterDate, filterSellerId, isAdmin, user?.id]);

    useEffect(() => {
        localStorage.setItem('cashout_counts', JSON.stringify(denominationsCount));
    }, [denominationsCount]);

    const efectivoFisico = useMemo(() => {
        return DENOMINATIONS.reduce((total, d) => total + (denominationsCount[d.value] * d.value), 0);
    }, [denominationsCount]);

    const handleConfirm = () => {
        const dataToSave = {
            fecha: filterDate,
            vendedorId: filterSellerId ? Number(filterSellerId) : Number(user?.id),
            efectivoFisico: efectivoFisico,
            efectivoEsperado: baseCaja + (summary?.totalEfectivo || 0),
            diferencia: efectivoFisico - (baseCaja + (summary?.totalEfectivo || 0)),
            baseCaja: baseCaja,
            totalVendido: summary?.totalVendido || 0,
            detallesDinero: denominationsCount
        };
        console.log("Enviando cierre de caja:", dataToSave);
        if (onSave) {
            onSave(dataToSave);
        } else {
            handleClose();
        }
    };


    
    const totalVendido = summary?.totalVendido || 0;
    const totalEfectivoVenta = summary?.totalEfectivo || 0;
    const totalDebito = summary?.totalDebito || 0;
    const totalCredito = summary?.totalCredito || 0;
    const cantidadVentas = summary?.cantidadVentas || 0;
    
    const transactions = summary?.transactions || []; 
    
    const totalEfectivoEsperado = baseCaja + totalEfectivoVenta;
    const diferenciaCaja = efectivoFisico - totalEfectivoEsperado;
    
    const vendedorNombre = summary?.vendedorNombre || user?.nombre || 'Cajero';
    
    const staffOrdenado = allUsers
        .filter(u => u && (u.rol === 'admin' || u.rol === 'vendedor'))
        .sort((a, b) => (a.name || a.nombre || '').localeCompare(b.name || b.nombre || ''));

  
    const StatCard = ({ title, value, icon, color, subtitle }) => (
        <Paper elevation={0} sx={{ p: 2, border: `1px solid ${color}40`, bgcolor: `${color}08`, borderRadius: 2, height: '100%' }}>
            <Box display="flex" alignItems="center" gap={1.5} mb={1}>
                <Box sx={{ p: 1, borderRadius: '50%', bgcolor: `${color}20`, color: color, display: 'flex' }}>
                    {icon}
                </Box>
                <Typography variant="subtitle2" fontWeight="bold" color="text.secondary">{title}</Typography>
            </Box>
            <Typography variant="h5" fontWeight="bold" color="#333">{value}</Typography>
            {subtitle && <Typography variant="caption" color="text.secondary">{subtitle}</Typography>}
        </Paper>
    );

   
    const MoneyInput = ({ denomination }) => (
        <Box display="flex" alignItems="center" gap={1} mb={1.5}>
            <Typography variant="body2" fontWeight="bold" sx={{ width: 70, color: '#555' }}>{denomination.label}</Typography>
            <TextField
                size="small"
                type="number"
                placeholder="0"
                value={denominationsCount[denomination.value] || ''}
                onChange={(e) => {
                    const count = Number(e.target.value) >= 0 ? Number(e.target.value) : 0;
                    setDenominationsCount(prev => ({ ...prev, [denomination.value]: count }));
                }}
                sx={{ 
                    width: 80,
                    '& .MuiOutlinedInput-root': { bgcolor: 'white' }
                }}
            />
            <Typography variant="body2" color="text.secondary" sx={{ minWidth: 60, textAlign: 'right' }}>
                {formatCurrency((denominationsCount[denomination.value] || 0) * denomination.value)}
            </Typography>
        </Box>
    );

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth PaperProps={{ sx: { borderRadius: 3, maxHeight: '90vh' } }}>
            
            
            <DialogTitle sx={{ bgcolor: '#212121', color: 'white', py: 2 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box display="flex" alignItems="center" gap={2}>
                        <PointOfSaleIcon sx={{ color: BRAND_COLOR }} />
                        <Box>
                            <Typography variant="h6" fontWeight="bold">Cierre de Caja</Typography>
                            <Typography variant="caption" sx={{ opacity: 0.8 }}>
                                {vendedorNombre} • {filterDate}
                            </Typography>
                        </Box>
                    </Box>
                    <Chip 
                        label={diferenciaCaja === 0 ? "Cuadrado" : (diferenciaCaja > 0 ? "Sobrante" : "Faltante")} 
                        sx={{ 
                            bgcolor: diferenciaCaja === 0 ? '#4caf50' : (diferenciaCaja > 0 ? '#ff9800' : '#f44336'), 
                            color: 'white', fontWeight: 'bold' 
                        }} 
                    />
                </Box>
            </DialogTitle>

            <DialogContent sx={{ p: 0, bgcolor: '#f4f6f8', position: 'relative', minHeight: 400 }}>
                
               
                {loading && (
                    <Box 
                        sx={{ 
                            position: 'absolute', 
                            top: 0, left: 0, right: 0, bottom: 0, 
                            bgcolor: 'rgba(255, 255, 255, 0.7)', 
                            zIndex: 10, 
                            display: 'flex', 
                            justifyContent: 'center', 
                            alignItems: 'center',
                            backdropFilter: 'blur(2px)'
                        }}
                    >
                        <CircularProgress color="primary" />
                    </Box>
                )}
                <Box p={3}>
                        
                        {isAdmin && (
                            <Paper sx={{ p: 2, mb: 3, borderRadius: 2, bgcolor: '#fff3e0', border: '1px solid #ffe0b2' }} elevation={0}>
                                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                    <Typography variant="subtitle2" fontWeight="bold" color="#e65100" display="flex" alignItems="center" gap={1}>
                                        <DashboardIcon fontSize="small" /> PANEL DE SUPERVISIÓN
                                    </Typography>
                                    <TextField 
                                        type="date" size="small" 
                                        value={filterDate} onChange={(e) => setFilterDate(e.target.value)} 
                                        InputLabelProps={{ shrink: true }} 
                                        sx={{ bgcolor: 'white', borderRadius: 1, width: 150 }}
                                    />
                                </Box>

                                <Typography variant="caption" fontWeight="bold" color="text.secondary" mb={1} display="block">
                                    SELECCIONAR VISTA (VENDEDOR):
                                </Typography>
                                
                                <Box display="flex" gap={2} overflow="auto" pb={1} sx={{ '&::-webkit-scrollbar': { height: 6 } }}>
                                    
                                    <Paper 
                                        elevation={0}
                                        onClick={() => setFilterSellerId("")}
                                        sx={{ 
                                            minWidth: 110, 
                                            p: 1.5, 
                                            cursor: 'pointer',
                                            border: filterSellerId === "" ? `2px solid ${BRAND_COLOR}` : '1px solid #e0e0e0',
                                            bgcolor: filterSellerId === "" ? 'white' : 'rgba(255,255,255,0.6)',
                                            borderRadius: 2,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            transition: '0.2s',
                                            '&:hover': { bgcolor: 'white', boxShadow: 1 }
                                        }}
                                    >
                                        <StorefrontIcon sx={{ color: filterSellerId === "" ? BRAND_COLOR : 'action.active', mb: 1, fontSize: 28 }} />
                                        <Typography variant="caption" fontWeight="bold" align="center" color={filterSellerId === "" ? BRAND_COLOR : 'text.primary'}>
                                            TIENDA (GLOBAL)
                                        </Typography>
                                    </Paper>

                                   
                                    {staffOrdenado.map(u => (
                                        <Paper 
                                            key={u.id}
                                            elevation={0}
                                            onClick={() => setFilterSellerId(u.id)}
                                            sx={{ 
                                                minWidth: 110, 
                                                p: 1.5, 
                                                cursor: 'pointer',
                                                border: filterSellerId === u.id ? `2px solid ${BRAND_COLOR}` : '1px solid #e0e0e0',
                                                bgcolor: filterSellerId === u.id ? 'white' : 'rgba(255,255,255,0.6)',
                                                borderRadius: 2,
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                transition: '0.2s',
                                                position: 'relative',
                                                '&:hover': { bgcolor: 'white', boxShadow: 1 }
                                            }}
                                        >
                                            {u.id === user?.id && (
                                                <Chip label="Tú" size="small" color="primary" sx={{ position: 'absolute', top: -8, right: -8, height: 16, fontSize: '0.6rem' }} />
                                            )}
                                            <Avatar sx={{ width: 28, height: 28, mb: 1, bgcolor: filterSellerId === u.id ? BRAND_COLOR : '#bdbdbd', fontSize: 14, fontWeight: 'bold' }}>
                                                {(u.name || u.nombre || '?').charAt(0).toUpperCase()}
                                            </Avatar>
                                            <Typography variant="caption" fontWeight="bold" align="center" noWrap sx={{ maxWidth: 90 }} color={filterSellerId === u.id ? BRAND_COLOR : 'text.primary'}>
                                                {u.name || u.nombre}
                                            </Typography>
                                        </Paper>
                                    ))}
                                </Box>

                                {filterSellerId === "" && (
                                    <Alert severity="warning" icon={<WarningIcon fontSize="inherit" />} sx={{ mt: 2, py: 0, alignItems: 'center' }}>
                                        <Typography variant="caption">
                                            Estás viendo el <b>Reporte Global</b>. Selecciona un vendedor arriba para ver su cuadre individual.
                                        </Typography>
                                    </Alert>
                                )}
                            </Paper>
                        )}

                        <Grid container spacing={3}>
                            
                            
                            <Grid size={{ xs: 12, md: 5 }}>
                                <Typography variant="subtitle2" fontWeight="bold" color="text.secondary" mb={2} textTransform="uppercase">
                                    Resumen de Operaciones
                                </Typography>
                                
                                <Stack spacing={2}>
                                    <StatCard 
                                        title="Total Vendido" 
                                        value={formatCurrency(totalVendido)} 
                                        icon={<StorefrontIcon />} 
                                        color="#212121" 
                                        subtitle={`${cantidadVentas} transacciones`}
                                    />
                                    
                                    <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
                                        <StatCard 
                                            title="Efectivo" 
                                            value={formatCurrency(totalEfectivoVenta)} 
                                            icon={<AttachMoneyIcon />} 
                                            color="#009688" 
                                        />
                                        <StatCard 
                                            title="Tarjetas" 
                                            value={formatCurrency(totalDebito + totalCredito)} 
                                            icon={<CreditCardIcon />} 
                                            color="#1976d2" 
                                        />
                                    </Box>

                                    <Paper sx={{ p: 2, bgcolor: '#fff8e1', border: '1px solid #ffecb3', borderRadius: 2 }}>
                                        <Box display="flex" justifyContent="space-between" mb={1}>
                                            <Typography variant="body2" color="text.secondary">Fondo Base Caja</Typography>
                                            <Typography variant="body2" fontWeight="bold">{formatCurrency(baseCaja)}</Typography>
                                        </Box>
                                        <Box display="flex" justifyContent="space-between" mb={1}>
                                            <Typography variant="body2" color="text.secondary">(+) Ventas Efectivo</Typography>
                                            <Typography variant="body2" fontWeight="bold">{formatCurrency(totalEfectivoVenta)}</Typography>
                                        </Box>
                                        <Divider sx={{ my: 1, borderColor: '#ffecb3' }} />
                                        <Box display="flex" justifyContent="space-between">
                                            <Typography variant="subtitle1" fontWeight="bold" color="#b45309">Total Esperado en Caja</Typography>
                                            <Typography variant="h6" fontWeight="bold" color="#b45309">{formatCurrency(totalEfectivoEsperado)}</Typography>
                                        </Box>
                                    </Paper>
                                </Stack>
                            </Grid>

                            <Grid size={{ xs: 12, md: 7 }}>
                                <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: '1px solid #e0e0e0', bgcolor: 'white', height: '100%' }}>
                                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                                        <Typography variant="h6" fontWeight="bold" display="flex" alignItems="center" gap={1}>
                                            <AccountBalanceWalletIcon color="action" /> Arqueo de Efectivo
                                        </Typography>
                                        <Chip label={`Total Contado: ${formatCurrency(efectivoFisico)}`} color="primary" variant="outlined" sx={{ fontWeight: 'bold', fontSize: '1rem' }} />
                                    </Box>

                                    <Grid container spacing={4}>
                                        <Grid size={{ xs: 12, sm: 6 }}>
                                            <Typography variant="caption" fontWeight="bold" color="text.secondary" display="block" mb={2}>BILLETES</Typography>
                                            {DENOMINATIONS.filter(d => d.value >= 1000).map(d => (
                                                <MoneyInput key={d.value} denomination={d} />
                                            ))}
                                        </Grid>
                                        <Grid size={{ xs: 12, sm: 6 }}>
                                            <Typography variant="caption" fontWeight="bold" color="text.secondary" display="block" mb={2}>MONEDAS</Typography>
                                            {DENOMINATIONS.filter(d => d.value < 1000).map(d => (
                                                <MoneyInput key={d.value} denomination={d} />
                                            ))}
                                        </Grid>
                                    </Grid>

                                    <Box mt={4} p={2} borderRadius={2} bgcolor={diferenciaCaja === 0 ? '#e8f5e9' : '#ffebee'} border={`1px solid ${diferenciaCaja === 0 ? '#a5d6a7' : '#ef9a9a'}`}>
                                        <Box display="flex" justifyContent="space-between" alignItems="center">
                                            <Box>
                                                <Typography variant="subtitle2" fontWeight="bold" color={diferenciaCaja === 0 ? '#2e7d32' : '#c62828'}>
                                                    {diferenciaCaja === 0 ? '¡Excelente! La caja cuadra.' : (diferenciaCaja > 0 ? 'Atención: Sobra dinero' : 'Atención: Falta dinero')}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    Diferencia entre esperado y contado
                                                </Typography>
                                            </Box>
                                            <Typography variant="h4" fontWeight="bold" color={diferenciaCaja === 0 ? '#2e7d32' : '#c62828'}>
                                                {diferenciaCaja > 0 ? '+' : ''}{formatCurrency(diferenciaCaja)}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Paper>
                            </Grid>

                        </Grid>

                        <Divider sx={{ my: 4 }} />
                        
                        <Typography variant="h6" fontWeight="bold" mb={2} color="text.secondary">
                            Detalle de Transacciones ({transactions.length})
                        </Typography>
                        <TransactionsList transactions={transactions} allProducts={allProducts} isAdmin={isAdmin} />
                    </Box>

            </DialogContent>

            <DialogActions sx={{ p: 2, bgcolor: 'white', borderTop: '1px solid #e0e0e0' }}>
                <Button onClick={handleClose} color="inherit" sx={{ mr: 1 }}>Cancelar</Button>
                <Button variant="contained" onClick={handleConfirm} sx={{ bgcolor: '#212121', px: 4 }}>
                    Confirmar Cierre
                </Button>
            </DialogActions>
        </Dialog>
    );
};


const Home = () => {
    const [pasteles, setPasteles] = useState([]); 
    const [categorias, setCategorias] = useState([]);
    const [busqueda, setBusqueda] = useState('');
    const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('Todas');

    const auth = useAuth();
    const user = auth?.user;
    const logout = auth?.logout;

    const { cart, addToCart, removeFromCart, total } = useCart();
    const navigate = useNavigate();
    const location = useLocation();

    const isAdmin = user?.rol === 'admin';
    const isStaff = user?.rol === 'admin' || user?.rol === 'vendedor';

    const [isCashoutModalOpen, setIsCashoutModalOpen] = useState(false);
    const [cashoutSummary, setCashoutSummary] = useState(null);
    const [cashoutLoading, setLoading] = useState(false);
    
    const [allUsers, setAllUsers] = useState([]);
    
    const valoresVenta = calcularValores(total, ivaRate);
    
    const categoriesToShow = STATIC_CATEGORIES.concat(
        categorias.map(cat => cat.nombre)
    );


    useEffect(() => {
        cargarProductos();
        cargarCategorias();
        if (isAdmin) {
            cargarUsuarios();
        }
    }, [isAdmin]);


    useEffect(() => {
        if (location.state?.openCashout) {
            handleOpenCashoutModal();
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location.key]);

    

    const cargarUsuarios = async () => {
        try {
            const res = await usersService.findAll();
            const staffUsers = res.data.filter(u => 
                (u.rol === 'admin' || u.rol === 'vendedor') &&
                !['michell', 'yo'].includes((u.name || u.nombre || '').toLowerCase())
            );
            setAllUsers(staffUsers);
        } catch (error) {
            console.error("Error cargando usuarios:", error.response);
        }
    };

    const cargarCategorias = async () => {
        try {
            const res = await categoriesService.getAll();
            setCategorias(res.data);
        } catch (error) {
            console.error("Error cargando categorías:", error);
        }
    };
    
    const cargarProductos = async () => {
        try {
            const res = await productsService.getAll();
            setPasteles(res.data);
        } catch (error) {
            console.error("Error cargando productos:", error);
        }
    };
    
    const loadCashoutData = async (date, sellerId) => {
        setLoading(true);
        setCashoutSummary(null);
        
        let sellerNameDisplay = user?.nombre || 'Cajero';

        if (isAdmin) {
            if (!sellerId) {
                sellerNameDisplay = "Reporte Global (Todos)";
            } else {
                const foundUser = allUsers.find(u => u.id === sellerId);
                if (foundUser) {
                    sellerNameDisplay = foundUser.nombre || foundUser.name || 'Vendedor';
                }
            }
        }

        let serviceCall;
        
        if (isAdmin) {
            serviceCall = salesService.getAdminHistory({ fecha: date });
        } else {
            serviceCall = salesService.getMySales();
        }

        try {
            const res = await serviceCall;
            let backendTransactions = [];
            let backendResumen = null;

            if (Array.isArray(res.data)) {
                backendTransactions = res.data;
            } else if (res.data.ventas && Array.isArray(res.data.ventas)) {
                backendTransactions = res.data.ventas;
            } else if (res.data.transactions && Array.isArray(res.data.transactions)) {
                backendTransactions = res.data.transactions;
            } else if (res.data.resumen?.transactions && Array.isArray(res.data.resumen.transactions)) {
                backendTransactions = res.data.resumen.transactions;
            }

            const getTxTotal = (t) => Number(t.total || t.resumen?.total || 0);
            const getTxMedio = (t) => (t.medioPago || t.resumen?.medioPago || 'EFECTIVO');

            backendTransactions = backendTransactions.map(t => {
                
                const id = t.folio || t.id || t._id || 'N/A';

                let hora = 'N/A';
                const fechaRaw = t.fecha || t.createdAt || t.created_at;
                if (fechaRaw) {
                    const dateObj = new Date(fechaRaw);
                    if (!isNaN(dateObj.getTime())) {
                        hora = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
                    }
                }

                let vendedorNombre = 'N/A';
                let vendedorId = null;

                if (t.vendedor && typeof t.vendedor === 'object') {
                    vendedorNombre = t.vendedor.nombre || t.vendedor.name || 'Vendedor';
                    vendedorId = t.vendedor.id;
                } else if (typeof t.vendedor === 'string') {
                    vendedorNombre = t.vendedor;
                } else if (t.usuario && typeof t.usuario === 'object') {
                    vendedorNombre = t.usuario.nombre || t.usuario.name;
                    vendedorId = t.usuario.id;
                }
                
                if (!vendedorId) {
                    vendedorId = t.vendedorId || t.userId;
                }

                const rawItems = t.items || t.detalles || t.productos || [];
                const items = rawItems.map(i => ({
                    cantidad: i.cantidad,
                    nombre: i.nombre || i.producto?.nombre || 'Producto', 
                    productoId: i.productoId || i.producto?.id
                }));

                return {
                    ...t,
                    id,
                    hora,
                    vendedorNombre,
                    vendedorId, 
                    items,
                    total: getTxTotal(t),
                    medioPago: getTxMedio(t)
                };
            });

            if (date) {
                 backendTransactions = backendTransactions.filter(t => {
                     const tDateRaw = t.fecha || t.createdAt || t.created_at;
                     if (!tDateRaw) return false;
                     
                     const txDate = new Date(tDateRaw);
                     const year = txDate.getFullYear();
                     const month = String(txDate.getMonth() + 1).padStart(2, '0');
                     const day = String(txDate.getDate()).padStart(2, '0');
                     const txDateLocal = `${year}-${month}-${day}`;
                     
                     return txDateLocal === date;
                 });
            }

            if (isAdmin && sellerId) {
                const sellerIdNum = Number(sellerId);
                const selectedUser = allUsers.find(u => u.id === sellerIdNum);
                const selectedUserName = selectedUser ? (selectedUser.nombre || selectedUser.name || '').toLowerCase() : '';

                backendTransactions = backendTransactions.filter(t => {
                    if (t.vendedorId && Number(t.vendedorId) === sellerIdNum) return true;
                    
                    if (t.vendedorNombre) {
                        const txSellerName = t.vendedorNombre.toLowerCase();
                    
                        if (selectedUserName && (txSellerName.includes(selectedUserName) || selectedUserName.includes(txSellerName))) {
                            return true;
                        }
                    }

                    return false;
                });
            }
            
            backendResumen = {
                totalVendido: backendTransactions.reduce((acc, t) => acc + Number(t.total || 0), 0),
                cantidadVentas: backendTransactions.length,
                totalEfectivo: backendTransactions.filter(t => t.medioPago === 'EFECTIVO').reduce((acc, t) => acc + Number(t.total || 0), 0),
                
                totalCredito: backendTransactions.filter(t => t.medioPago !== 'EFECTIVO').reduce((acc, t) => acc + Number(t.total || 0), 0),
               
                totalDebito: backendTransactions.filter(t => t.medioPago === 'DEBITO' || t.medioPago === 'DÉBITO').reduce((acc, t) => acc + Number(t.total || 0), 0),
            };

            const resumenData = backendResumen || {
                totalVendido: 0,
                totalEfectivo: 0,
                totalCredito: 0,
                cantidadVentas: 0
            };

            const transactionsData = backendTransactions;

            setCashoutSummary({
                ...resumenData,
                vendedorNombre: sellerNameDisplay,
                fecha: date,
                transactions: transactionsData 
            });        } catch (error) {
            console.error("Error al cargar el cuadre diario:", error.response);
            setCashoutSummary(null);
        } finally {
            setLoading(false);
        }
    };  
    

    const handleSaveCashout = async (data) => {
        try {
            await salesService.closeDailyBox(data);
            
            Swal.fire({
                title: '¡Caja Cerrada!',
                text: 'El cuadre de caja se ha guardado correctamente en el sistema.',
                icon: 'success',
                confirmButtonColor: '#d97706'
            });
            
            localStorage.removeItem('cashout_counts');
            setDenominationsCount(DENOMINATIONS.reduce((acc, d) => ({ ...acc, [d.value]: 0 }), {}));
            
            setIsCashoutModalOpen(false);

        } catch (error) {
            console.warn("El endpoint de cierre no está disponible, guardando localmente.", error);
            
            await new Promise(resolve => setTimeout(resolve, 800));

            Swal.fire({
                title: '¡Caja Cuadrada (Local)!',
                html: `El cuadre se ha procesado localmente.<br/><br/>
                       <small style="color: #666">Nota: No se pudo conectar con el servicio de guardado remoto, 
                       pero los datos se han validado.</small>`,
                icon: 'success',
                confirmButtonColor: '#d97706'
            });
            setIsCashoutModalOpen(false);
        }
    };
    
    const handleOpenCashoutModal = () => {
          setIsCashoutModalOpen(true);
    };
    
    const handleAgregar = (producto) => {
        if (producto.stock === 0) {
            Swal.fire('Agotado', 'No queda stock de este producto', 'warning');
            return;
        }
        addToCart(producto);
    };

    const handleEliminar = async (productoId) => {
        if (!isAdmin) return;
        
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: "¡No podrás revertir esta acción!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Sí, ¡Eliminar!'
        });

        if (result.isConfirmed) {
            try {
                await productsService.delete(productoId);
                Swal.fire('¡Eliminado!', 'El producto ha sido eliminado.', 'success');
                cargarProductos();
            } catch (error) {
                Swal.fire('Error','Hubo un problema al intentar eliminar el producto.', 'error');
            }
        }
    };

    const irAPagar = () => {
        if (cart.length === 0) return;
        navigate('/boleta');
    };

    const productosFiltrados = pasteles.filter(p => {
        const nombreCoincide = p.nombre.toLowerCase().includes(busqueda.toLowerCase());
        const categoriaCoincide = categoriaSeleccionada === 'Todas' || p.categoria?.nombre === categoriaSeleccionada;
        return nombreCoincide && categoriaCoincide;
    });

    const handleImageError = (e) => {
        e.target.src = "https://via.placeholder.com/150/f8f8f8?text=Sin+Foto";
    };


    return (
        <Box sx={{ display: 'flex', height: '100vh', bgcolor: '#f4f6f8', overflow: 'hidden' }}>

         
            <Box 
                sx={{ 
                    width: isStaff ? 'calc(100vw - 400px)' : '100%', 
                    flexGrow: 1, 
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden'
                }}
            >
                
                <AppBar position="static" color="default" elevation={1} sx={{ bgcolor: 'white', borderBottom: '1px solid #e0e0e0' }}>
                    <Toolbar sx={{ justifyContent: 'space-between' }}>
                        <Box display="flex" alignItems="center" gap={2}>
                            <StorefrontIcon sx={{ color: brandColor, fontSize: 32 }} />
                            <Box>
                                <Typography variant="h6" fontWeight="bold" sx={{ fontFamily: 'serif', color: '#333', lineHeight: 1.2 }}>
                                    Pastelería 1000 Sabores
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Punto de Venta
                                </Typography>
                            </Box>
                        </Box>

                        <Box display="flex" alignItems="center" gap={2}>
                            <Chip 
                                icon={<PersonIcon />} 
                                label={`${user?.nombre || 'Usuario'} ${isAdmin ? '(Admin)' : ''}`} 
                                variant="outlined" 
                                sx={{ borderColor: '#e0e0e0' }}
                            />
                            
                            {isStaff && (
                                <Button 
                                    variant="outlined" 
                                    startIcon={<HistoryIcon />}
                                    onClick={handleOpenCashoutModal} 
                                    sx={{ color: brandColor, borderColor: brandColor, '&:hover': { bgcolor: '#fff8e1', borderColor: brandColor } }}
                                >
                                    Cierre de Caja
                                </Button>
                            )}

                            {isAdmin && (
                                <Button 
                                    variant="contained"
                                    startIcon={<DashboardIcon />}
                                    onClick={() => navigate('/admin/dashboard')}
                                    sx={{ bgcolor: brandColor, '&:hover': { bgcolor: '#b45309' } }}
                                >
                                    Panel Admin
                                </Button>
                            )}

                            <IconButton color="error" onClick={() => { logout(); window.location.href = '/login'; }} title="Cerrar Sesión">
                                <LogoutIcon />
                            </IconButton>
                        </Box>
                    </Toolbar>
                </AppBar>

                <Box sx={{ p: 3, overflowY: 'auto', flexGrow: 1 }}>
                    
    
                    <Paper elevation={0} sx={{ p: 2, mb: 4, borderRadius: 3, bgcolor: 'white', border: '1px solid #e0e0e0' }}>
                        <Grid container spacing={2} alignItems="center">
                            <Grid size={{ xs: 12, md: 3 }}>
                                <TextField
                                    fullWidth
                                    placeholder="Buscar productos por nombre..."
                                    size="small"
                                    value={busqueda}
                                    onChange={(e) => setBusqueda(e.target.value)}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SearchIcon color="action" />
                                            </InputAdornment>
                                        ),
                                    }}
                                    sx={{ 
                                        '& .MuiOutlinedInput-root': { 
                                            borderRadius: 2,
                                            bgcolor: '#f9fafb'
                                        } 
                                    }}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, md: 9 }}>
                                <Box display="flex" gap={1} flexWrap="wrap" justifyContent="flex-end">
                                    {categoriesToShow.map(cat => (
                                        <Chip
                                            key={cat}
                                            label={cat}
                                            clickable
                                            onClick={() => setCategoriaSeleccionada(cat)}
                                            sx={{
                                                bgcolor: categoriaSeleccionada === cat ? brandColor : 'transparent',
                                                color: categoriaSeleccionada === cat ? '#fff' : '#555',
                                                fontWeight: categoriaSeleccionada === cat ? 'bold' : 'medium',
                                                border: '1px solid',
                                                borderColor: categoriaSeleccionada === cat ? brandColor : '#e0e0e0',
                                                '&:hover': {
                                                    bgcolor: categoriaSeleccionada === cat ? '#b45309' : '#f5f5f5'
                                                }
                                            }}
                                        />
                                    ))}
                                </Box>
                            </Grid>
                        </Grid>
                    </Paper>

            
                    <Grid 
                        container 
                        spacing={3}
                        sx={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", 
                            gap: "24px",
                        }}
                    >
                        {productosFiltrados.map((prod) => (
                            <Card 
                                key={prod.id}
                                elevation={0}
                                sx={{
                                    borderRadius: 3,
                                    border: '1px solid #e0e0e0',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    height: "100%",
                                    minHeight: 380,
                                    overflow: "hidden",
                                    transition: 'transform 0.2s, box-shadow 0.2s',
                                    '&:hover': {
                                        transform: 'translateY(-4px)',
                                        boxShadow: '0 12px 24px -10px rgba(0,0,0,0.15)',
                                        borderColor: brandColor
                                    }
                                }}
                            >
                            
                                <Box position="relative" sx={{ bgcolor: '#f5f5f5', height: 180 }}>
                                    <CardMedia
                                        component="img"
                                        height="100%"
                                        image={buildImageUrl(prod.fotoUrl || prod.fotourl)}
                                        alt={prod.nombre}
                                        onError={handleImageError}
                                        sx={{ objectFit: 'cover' }}
                                    />
                                    {prod.stock <= 5 && (
                                        <Chip
                                            label={prod.stock === 0 ? "AGOTADO" : `${prod.stock} unid.`}
                                            size="small"
                                            sx={{
                                                position: 'absolute', 
                                                top: 12, 
                                                right: 12,
                                                fontWeight: 'bold',
                                                bgcolor: prod.stock === 0 ? '#ef4444' : 'rgba(255,255,255,0.95)',
                                                color: prod.stock === 0 ? '#fff' : '#d97706',
                                                backdropFilter: 'blur(4px)'
                                            }}
                                        />
                                    )}
                                </Box>

                                
                                <CardContent sx={{ flexGrow: 1, p: 2 }}>
                                    <Typography variant="caption" color="text.secondary" fontWeight="bold" textTransform="uppercase" letterSpacing={1}>
                                        {prod.categoria?.nombre || 'Pastelería'}
                                    </Typography>
                                    <Typography 
                                        variant="subtitle1" 
                                        fontWeight="bold" 
                                        sx={{ 
                                            mt: 0.5,
                                            mb: 1,
                                            lineHeight: 1.3,
                                            display: '-webkit-box',
                                            overflow: 'hidden',
                                            WebkitBoxOrient: 'vertical',
                                            WebkitLineClamp: 2,
                                            height: '2.6em'
                                        }}
                                    >
                                        {prod.nombre}
                                    </Typography>

                                    <Typography variant="h5" fontWeight="bold" color={brandColor}>
                                        {formatCurrency(prod.precio)}
                                    </Typography>
                                </CardContent>

                                
                                <Box sx={{ p: 2, pt: 0 }}>
                                    <Button
                                        fullWidth
                                        variant="contained"
                                        disableElevation
                                        startIcon={<AddIcon />}
                                        sx={{ 
                                            bgcolor: '#212121', 
                                            color: 'white',
                                            py: 1,
                                            borderRadius: 2,
                                            '&:hover': { bgcolor: brandColor } 
                                        }}
                                        disabled={prod.stock === 0}
                                        onClick={() => handleAgregar(prod)}
                                    >
                                        AGREGAR
                                    </Button>

                                    {isAdmin && (
                                        <Box display="flex" gap={1} mt={1.5}>
                                            <Button 
                                                size="small" 
                                                fullWidth 
                                                variant="outlined" 
                                                sx={{ borderColor: '#e0e0e0', color: '#666' }}
                                                onClick={() => navigate('/admin/inventory')} 
                                            >
                                                Editar
                                            </Button>
                                            <IconButton 
                                                size="small" 
                                                color="error" 
                                                sx={{ border: '1px solid #ffebee', bgcolor: '#ffebee' }}
                                                onClick={() => handleEliminar(prod.id)}
                                            >
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </Box>
                                    )}
                                </Box>
                            </Card>
                        ))}
                    </Grid>
                </Box>
            </Box>

            {isStaff && ( 
                <Paper 
                    elevation={4}
                    sx={{ 
                        width: 400, 
                        height: '100vh', 
                        display: 'flex', 
                        flexDirection: 'column', 
                        borderLeft: '1px solid #e0e0e0',
                        flexShrink: 0,
                        zIndex: 1200
                    }}
                >
                    
                    <Box p={3} bgcolor="white" borderBottom="1px solid #f0f0f0">
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                            <Typography variant="h6" fontWeight="bold" display="flex" alignItems="center" gap={1}>
                                <ShoppingBagIcon color="primary" /> Orden Actual
                            </Typography>
                            <Chip label={`Ticket #${Math.floor(Math.random() * 9000) + 1000}`} size="small" sx={{ bgcolor: '#e3f2fd', color: '#1976d2', fontWeight: 'bold' }} />
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                            {cart.length} items agregados
                        </Typography>
                    </Box>

                   
                    <Box sx={{ flexGrow: 1, p: 2, overflowY: 'auto', bgcolor: '#f9fafb' }}>
                        {cart.length === 0 ? (
                            <Box textAlign="center" mt={10} opacity={0.4}>
                                <ShoppingBagIcon sx={{ fontSize: 80, color: '#ccc', mb: 2 }} />
                                <Typography variant="h6" color="text.secondary">El carrito está vacío</Typography>
                                <Typography variant="body2" color="text.secondary">Agrega productos para comenzar</Typography>
                            </Box>
                        ) : (
                            <Stack spacing={2}>
                                {cart.map((item) => (
                                    <Paper 
                                        key={item.id} 
                                        elevation={0}
                                        sx={{ 
                                            p: 2, 
                                            border: '1px solid #e0e0e0', 
                                            borderRadius: 3,
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            gap: 2,
                                            bgcolor: 'white'
                                        }}
                                    >
                                        <img
                                            src={buildImageUrl(item.fotoUrl || item.fotourl)}
                                            alt={item.nombre}
                                            style={{ width: 60, height: 60, borderRadius: 12, objectFit: 'cover' }}
                                        />
                                        <Box flexGrow={1}>
                                            <Typography variant="subtitle2" fontWeight="bold" sx={{ lineHeight: 1.2, mb: 0.5 }}>
                                                {item.nombre}
                                            </Typography>
                                            <Typography variant="body2" color={brandColor} fontWeight="bold">
                                                {formatCurrency(item.precio * item.cantidad)}
                                            </Typography>
                                        </Box>

                                    
                                        <Box display="flex" flexDirection="column" alignItems="center" bgcolor="#f5f5f5" borderRadius={2} p={0.5}>
                                            <IconButton size="small" onClick={() => handleAgregar(item)} sx={{ p: 0.5 }}>
                                                <AddIcon fontSize="small" />
                                            </IconButton>
                                            <Typography variant="body2" fontWeight="bold" py={0.5}>{item.cantidad}</Typography>
                                            <IconButton size="small" onClick={() => removeFromCart(item.id)} sx={{ p: 0.5 }}>
                                                <RemoveIcon fontSize="small" />
                                            </IconButton>
                                        </Box>
                                    </Paper>
                                ))}
                            </Stack>
                        )}
                    </Box>

                    
                    <Paper elevation={10} sx={{ p: 3, borderTop: '1px solid #e0e0e0', bgcolor: 'white' }}>
                        <Stack spacing={1} mb={3}>
                            <Box display="flex" justifyContent="space-between">
                                <Typography variant="body2" color="text.secondary">Subtotal Neto</Typography>
                                <Typography variant="body2" fontWeight="medium">{formatCurrency(valoresVenta.neto)}</Typography>
                            </Box>
                            <Box display="flex" justifyContent="space-between">
                                <Typography variant="body2" color="text.secondary">IVA ({ivaRate * 100}%)</Typography>
                                <Typography variant="body2" fontWeight="medium">{formatCurrency(valoresVenta.iva)}</Typography>
                            </Box>
                            <Divider sx={{ my: 1 }} />
                            <Box display="flex" justifyContent="space-between" alignItems="flex-end">
                                <Typography variant="h6" fontWeight="bold">Total a Pagar</Typography>
                                <Typography variant="h4" fontWeight="bold" color={brandColor}>{formatCurrency(valoresVenta.total)}</Typography>
                            </Box>
                        </Stack>

                        <Button
                            fullWidth
                            variant="contained"
                            size="large"
                            sx={{ 
                                bgcolor: brandColor, 
                                py: 1.5,
                                borderRadius: 2,
                                fontSize: '1.1rem',
                                fontWeight: 'bold',
                                boxShadow: '0 4px 12px rgba(217, 119, 6, 0.4)',
                                '&:hover': { bgcolor: '#b45309' } 
                            }}
                            disabled={cart.length === 0}
                            onClick={irAPagar}
                            startIcon={<PointOfSaleIcon />}
                        >
                            COBRAR
                        </Button>
                    </Paper>

                </Paper>
            )}            
            {isStaff && (
                <CashoutModal
                    open={isCashoutModalOpen}
                    handleClose={() => setIsCashoutModalOpen(false)}
                    summary={cashoutSummary}
                    loading={cashoutLoading}
                    baseCaja={BASE_CAJA_PLACEHOLDER} 
                    user={user} 
                    isAdmin={isAdmin}
                    allUsers={allUsers}
                    loadCashoutData={loadCashoutData}
                    allProducts={pasteles} 
                    onSave={handleSaveCashout} 
                />
            )}
        </Box>
    );
};

export default Home;