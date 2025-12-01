import { useState, useEffect } from 'react';
import { salesService, usersService } from "../../api/services";
import AdminLayout from '../../components/AdminLayout';
import Swal from 'sweetalert2';
import { 
    Paper, Typography, Box, Table, TableBody, TableCell, 
    TableContainer, TableHead, TableRow, Select, MenuItem, FormControl, 
    InputLabel, CircularProgress, IconButton, Dialog, DialogTitle, 
    DialogContent, DialogActions, TextField, Button, Alert,
    Chip, Stack, Tooltip, Card, CardContent, Grid, InputAdornment
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';


const themeColors = {
    primary: '#d97706',   
    secondary: '#64748b',  
    background: '#f8fafc',
    text: '#1e293b',      
    border: '#e2e8f0',    
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b',
    info: '#3b82f6'
};

const formatCurrency = (value) => `$${Number(value).toLocaleString('es-CL')}`;


const getPaymentColor = (medioPago) => {
    switch (medioPago) {
        case 'EFECTIVO':
            return 'success';
        case 'DEBITO':
            return 'info';
        case 'CREDITO':
            return 'secondary';
        default:
            return 'default';
    }
};


const EditSaleModal = ({ open, handleClose, saleData, handleSave }) => {
    const [form, setForm] = useState({});

    useEffect(() => {
        if (saleData) {
            setForm({
                id: saleData.folio, 
                medioPago: saleData.resumen?.medioPago || 'EFECTIVO',
                montoEntregado: saleData.resumen?.total || 0, 
            });
        }
    }, [saleData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };

    const handleInternalSave = () => {
        if (form.montoEntregado <= 0) {
            Swal.fire('Error', 'El monto debe ser positivo', 'warning');
            return;
        }

        handleSave(form.id, { 
            medioPago: form.medioPago, 
            montoEntregado: Number(form.montoEntregado), 
        });
    };

    if (!saleData) return null;

    return (
        <Dialog 
            open={open} 
            onClose={handleClose} 
            fullWidth 
            maxWidth="sm"
            PaperProps={{
                sx: { borderRadius: 3, padding: 1 }
            }}
        >
            <DialogTitle sx={{ pb: 1 }}>
                <Typography variant="h6" fontWeight="bold" color={themeColors.text}>
                    Editar Venta #{saleData.folio}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Vendedor: {saleData.vendedor}
                </Typography>
            </DialogTitle>
            <DialogContent>
                <Box display="flex" flexDirection="column" gap={3} mt={1}>
                    <Alert severity="info" sx={{ borderRadius: 2 }}>
                        Total Original: <strong>{formatCurrency(saleData.resumen?.total)}</strong>
                    </Alert>
                    
                    
                    <FormControl fullWidth variant="outlined">
                        <InputLabel>Medio de Pago</InputLabel>
                        <Select
                            label="Medio de Pago"
                            name="medioPago"
                            value={form.medioPago || ''}
                            onChange={handleChange}
                        >
                            <MenuItem value="EFECTIVO">EFECTIVO</MenuItem>
                            <MenuItem value="DEBITO">DÉBITO</MenuItem>
                            <MenuItem value="CREDITO">CRÉDITO</MenuItem>
                        </Select>
                    </FormControl>

                    
                    <TextField
                        label="Monto Final de la Venta (Corregir)"
                        name="montoEntregado"
                        type="number"
                        fullWidth
                        value={form.montoEntregado || ''}
                        onChange={handleChange}
                        helperText="Solo modificar si hubo un error en el cobro."
                    />

                    <Alert severity="warning" sx={{ borderRadius: 2 }}>
                        Esta acción corrige el registro de la venta. Asegúrese de que los datos sean correctos.
                    </Alert>
                </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={handleClose} sx={{ color: themeColors.secondary }}>Cancelar</Button>
                <Button 
                    onClick={handleInternalSave} 
                    variant="contained" 
                    startIcon={<SaveIcon />}
                    sx={{ 
                        bgcolor: themeColors.primary, 
                        '&:hover': { bgcolor: '#b45309' },
                        borderRadius: 2,
                        px: 3
                    }}
                >
                    Guardar Cambios
                </Button>
            </DialogActions>
        </Dialog>
    );
};


const AdminSalesHistory = () => {
    const [sales, setSales] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState('');
    // Corregido: Usar fecha local en lugar de UTC para evitar que salte al día siguiente por diferencia horaria
    const [selectedDate, setSelectedDate] = useState(() => {
        const now = new Date();
        return new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
    }); 
    const [loading, setLoading] = useState(true);

    const [selectedSale, setSelectedSale] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        fetchSalesHistory(selectedUserId, selectedDate);
    }, [selectedUserId, selectedDate]);

    const fetchUsers = async () => {
        try {
            const res = await usersService.findAll(); 
            const sellers = res.data.filter(u => u.rol !== 'cliente');
            setUsers(sellers);
        } catch (error) {
            console.error("Error al cargar la lista de usuarios para el filtro:", error.response);
        }
    };

    const fetchSalesHistory = async (userId, date) => {
        setLoading(true);
        try {
            const filters = {};
            if (userId) filters.vendedorId = userId;
            if (date) filters.fecha = date;

            const res = await salesService.getAdminHistory(filters); 
            
            
            let rawSales = [];
            if (Array.isArray(res.data)) {
                rawSales = res.data;
            } else if (res.data.ventas && Array.isArray(res.data.ventas)) {
                rawSales = res.data.ventas;
            } else if (res.data.transactions && Array.isArray(res.data.transactions)) {
                rawSales = res.data.transactions;
            } else if (res.data.resumen?.transactions && Array.isArray(res.data.resumen.transactions)) {
                rawSales = res.data.resumen.transactions;
            }

            const formattedSales = rawSales.map(sale => {
                 let vendedorName = 'N/A';
                 if (typeof sale.vendedor === 'string') {
                     vendedorName = sale.vendedor;
                 } else if (sale.vendedor && sale.vendedor.name) {
                     vendedorName = sale.vendedor.name;
                 } else if (sale.vendedor && sale.vendedor.nombre) {
                     vendedorName = sale.vendedor.nombre; 
                 }

                 
                 const total = Number(sale.total || sale.resumen?.total || 0);
                 const medioPago = sale.medioPago || sale.resumen?.medioPago || 'EFECTIVO';

                 return {
                    folio: sale.folio || sale.id,
                    fecha: sale.fecha,
                    vendedor: vendedorName, 
                    resumen: { medioPago, total } 
                 };
            });

            setSales(formattedSales); 
        } catch (error) {
            console.error("Error al cargar el historial de ventas:", error.response);
            setSales([]);
        } finally {
            setLoading(false);
        }
    };
    
   

    const handleEdit = (sale) => {
        setSelectedSale(sale);
        setIsModalOpen(true);
    };

    const handleSave = async (id, formData) => {
        try {
            await salesService.update(id, formData); 
            Swal.fire('Éxito', 'Venta actualizada correctamente.', 'success');
            setIsModalOpen(false);
            fetchSalesHistory(selectedUserId, selectedDate); 
        } catch (error) {
            Swal.fire('Error', 'No se pudo actualizar la venta.', 'error');
            console.error(error);
        }
    };


    const handleDevolucion = async (id) => {
        const result = await Swal.fire({
            title: 'Confirmar Devolución', 
            text: `¿Estás seguro de anular la Venta ID ${id}? Esta acción revertirá la venta y corregirá el stock.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: themeColors.error, 
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Sí, Anular y Devolver Productos', 
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                await salesService.delete(id); 
                Swal.fire('Devolución Exitosa', `La venta ID ${id} ha sido anulada y el stock corregido.`, 'success');
                fetchSalesHistory(selectedUserId, selectedDate); 
            } catch (error) {
                Swal.fire('Error', 'No se pudo completar la devolución.', 'error');
                console.error(error);
            }
        }
    };


    return (
        <AdminLayout>
            <Box mb={4}>
                <Typography variant="h4" fontWeight="bold" sx={{ color: themeColors.text, mb: 1 }}>
                    Historial de Ventas
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Consulta y gestiona las transacciones históricas del sistema.
                </Typography>
            </Box>

            
            <Paper 
                elevation={0} 
                sx={{ 
                    p: 2, 
                    mb: 3, 
                    border: `1px solid ${themeColors.border}`,
                    borderRadius: 3,
                    display: 'flex',
                    gap: 2,
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    bgcolor: 'white'
                }}
            >
                <Box display="flex" alignItems="center" gap={1} color="text.secondary">
                    <FilterListIcon />
                    <Typography variant="subtitle2" fontWeight="bold">Filtros:</Typography>
                </Box>

                <FormControl sx={{ minWidth: 200 }} size="small">
                    <InputLabel>Vendedor</InputLabel>
                    <Select
                        value={selectedUserId}
                        onChange={(e) => setSelectedUserId(e.target.value)}
                        label="Vendedor"
                    >
                        <MenuItem value="">
                            <em>Todos los vendedores</em>
                        </MenuItem>
                        {users.map((u) => (
                            <MenuItem key={u.id} value={u.id}>
                                {u.name} ({u.rol})
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <TextField
                    label="Fecha"
                    type="date"
                    size="small"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    sx={{ minWidth: 180 }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <CalendarTodayIcon fontSize="small" color="action" />
                            </InputAdornment>
                        ),
                    }}
                />
            </Paper>

            {loading ? (
                <Box display="flex" justifyContent="center" py={5}>
                    <CircularProgress sx={{ color: themeColors.primary }} />
                </Box>
            ) : (
                <TableContainer 
                    component={Paper} 
                    elevation={0} 
                    sx={{ 
                        borderRadius: 3, 
                        border: `1px solid ${themeColors.border}`,
                        overflow: 'hidden'
                    }}
                >
                    <Table>
                        
                        <TableHead sx={{ bgcolor: themeColors.background }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold', color: themeColors.secondary }}>ID</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', color: themeColors.secondary }}>FECHA</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', color: themeColors.secondary }}>VENDEDOR</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', color: themeColors.secondary }}>MEDIO PAGO</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 'bold', color: themeColors.secondary }}>TOTAL</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 'bold', color: themeColors.secondary }}>ACCIONES</TableCell> 
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {sales.length > 0 ? (
                                sales.map((sale) => (
                                    <TableRow 
                                        key={sale.folio} 
                                        hover
                                        sx={{ '&:hover': { bgcolor: '#f1f5f9' } }}
                                    >
                                        
                                        <TableCell sx={{ fontWeight: 'bold', color: themeColors.text }}>#{sale.folio}</TableCell> 
                                        <TableCell>{new Date(sale.fecha).toLocaleDateString()}</TableCell>
                                        <TableCell>{sale.vendedor}</TableCell> 
                                        
                                        
                                        <TableCell>
                                            <Chip 
                                                label={sale.resumen?.medioPago} 
                                                size="small"
                                                color={getPaymentColor(sale.resumen?.medioPago)}
                                                variant="outlined"
                                                sx={{ fontWeight: 'bold' }}
                                            />
                                        </TableCell>
                                        
                                        
                                        <TableCell 
                                            align="right"
                                            sx={{ color: themeColors.text, fontWeight: 'bold', fontSize: '1rem' }}
                                        >
                                            {formatCurrency(sale.resumen?.total)}
                                        </TableCell>

                                     
                                        <TableCell align="center">
                                            <Stack direction="row" spacing={1} justifyContent="center">
                                                <Tooltip title="Editar Venta">
                                                    <IconButton 
                                                        size="small" 
                                                        onClick={() => handleEdit(sale)}
                                                        sx={{ 
                                                            color: themeColors.info, 
                                                            bgcolor: '#eff6ff',
                                                            '&:hover': { bgcolor: '#dbeafe' } 
                                                        }}
                                                    >
                                                        <EditIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                
                                                <Tooltip title="Anular Venta">
                                                    <IconButton 
                                                        size="small" 
                                                        onClick={() => handleDevolucion(sale.folio)}
                                                        sx={{ 
                                                            color: themeColors.error, 
                                                            bgcolor: '#fef2f2',
                                                            '&:hover': { bgcolor: '#fee2e2' } 
                                                        }}
                                                    >
                                                        <DeleteIcon fontSize="small" /> 
                                                    </IconButton>
                                                </Tooltip>
                                            </Stack>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                                        <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
                                            <Typography variant="h6" color="text.secondary">
                                                No se encontraron ventas
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Intenta cambiar los filtros de búsqueda.
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

           
            {selectedSale && (
                <EditSaleModal
                    open={isModalOpen}
                    handleClose={() => setIsModalOpen(false)}
                    saleData={selectedSale}
                    handleSave={handleSave}
                />
            )}
        </AdminLayout>
    );
};

export default AdminSalesHistory;