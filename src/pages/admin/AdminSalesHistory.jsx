import { useState, useEffect } from 'react';
import { salesService, usersService, productsService } from "../../api/services";
import AdminLayout from '../../components/templates/AdminLayout';
import Swal from 'sweetalert2';
import { 
    Paper, Typography, Box, Table, TableBody, TableCell, 
    TableContainer, TableHead, TableRow, Select, MenuItem, FormControl, 
    InputLabel, CircularProgress, Dialog, DialogTitle, 
    DialogContent, DialogActions, TextField, Button, Alert,
    Stack, Card, CardContent, Grid, InputAdornment, IconButton
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import StatusChip from '../../components/atoms/StatusChip';
import ActionButton from '../../components/atoms/ActionButton';


const themeColors = {
    primary: '#2e7d32',   
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
        case 'DÉBITO':
            return 'info';
        case 'CREDITO':
        case 'CRÉDITO':
            return 'warning';
        default:
            return 'default';
    }
};


import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import CloseIcon from '@mui/icons-material/Close';
import PrintIcon from '@mui/icons-material/Print';
import Divider from '@mui/material/Divider';

const ReceiptModal = ({ open, handleClose, sale }) => {
    if (!sale) return null;

    const total = sale.resumen?.total || 0;
    const valorNeto = Math.round(total / 1.19);
    const valorIva = total - valorNeto;
    const items = sale.items || [];
    const fecha = new Date(sale.fecha);

    const handlePrint = () => {
        const printContent = document.getElementById('receipt-content');
        const windowUrl = 'about:blank';
        const uniqueName = new Date();
        const windowName = 'Print' + uniqueName.getTime();
        const printWindow = window.open(windowUrl, windowName, 'left=50000,top=50000,width=0,height=0');

        printWindow.document.write(`
            <html>
                <head>
                    <title>Imprimir Boleta</title>
                    <style>
                        body { font-family: 'Courier New', Courier, monospace; padding: 20px; }
                        .text-center { text-align: center; }
                        .text-right { text-align: right; }
                        .font-bold { font-weight: bold; }
                        .text-sm { font-size: 12px; }
                        .text-xs { font-size: 10px; }
                        .my-2 { margin-top: 8px; margin-bottom: 8px; }
                        .mb-1 { margin-bottom: 4px; }
                        .border-dashed { border-bottom: 1px dashed #000; }
                        .flex { display: flex; justify-content: space-between; }
                        .uppercase { text-transform: uppercase; }
                    </style>
                </head>
                <body>
                    ${printContent.innerHTML}
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 250);
    };

    return (
        <Dialog 
            open={open} 
            onClose={handleClose} 
            maxWidth="xs" 
            fullWidth
            PaperProps={{ sx: { borderRadius: 2 } }}
        >
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
                <Typography fontWeight="bold">Detalle de Boleta</Typography>
                <IconButton onClick={handleClose} size="small"><CloseIcon /></IconButton>
            </DialogTitle>
            
            <DialogContent sx={{ p: 0, bgcolor: '#f9f9f9' }}>
                <Box id="receipt-content" sx={{ p: 3, bgcolor: 'white', fontFamily: '"Courier New", Courier, monospace' }}>
                    <Box textAlign="center" mb={2}>
                        <Typography variant="h6" fontWeight="bold" sx={{ letterSpacing: 2 }}>MUNDO MASCOTA</Typography>
                        <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>PET SHOP</Typography>
                        <Typography variant="caption" display="block">R.U.T.: 76.543.210-K</Typography>
                        <Typography variant="caption" display="block">GIRO: Venta de Mascotas</Typography>
                        <Typography variant="caption" display="block">CASA MATRIZ: AV. Matta 4234</Typography>
                        <Typography variant="caption" display="block">SANTIAGO, CHILE</Typography>
                        <Typography variant="caption" display="block">FONO: +56 9 1234 5678</Typography>
                    </Box>

                    <Divider sx={{ borderStyle: 'dashed', borderColor: '#000', my: 1 }} />

                    <Box textAlign="center" mb={1}>
                        <Typography variant="body2" fontWeight="bold">BOLETA ELECTRÓNICA N° {sale.folio}</Typography>
                        <Typography variant="caption">S.I.I. - SANTIAGO CENTRO</Typography>
                    </Box>

                    <Box display="flex" justifyContent="space-between" mb={0.5}>
                        <Typography variant="caption">FECHA: {fecha.toLocaleDateString()}</Typography>
                        <Typography variant="caption">HORA: {fecha.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography variant="caption">VENDEDOR: {(sale.vendedor || 'Cajero').toUpperCase()}</Typography>
                        <Typography variant="caption">CAJA: 1</Typography>
                    </Box>

                    <Divider sx={{ borderStyle: 'dashed', borderColor: '#000', my: 1 }} />

                    <Box mb={2}>
                        {items.map((item, index) => (
                            <Box key={index} mb={1}>
                                <Box display="flex" justifyContent="space-between">
                                    <Typography variant="body2" fontWeight="bold" sx={{ flex: 1, mr: 1 }}>
                                        {item.nombre}
                                    </Typography>
                                    <Typography variant="body2" fontWeight="bold">
                                        ${((item.precio) * (item.cantidad)).toLocaleString('es-CL')}
                                    </Typography>
                                </Box>
                                <Typography variant="caption" color="text.secondary">
                                    {item.cantidad} x ${(item.precio).toLocaleString('es-CL')}
                                </Typography>
                            </Box>
                        ))}
                    </Box>

                    <Divider sx={{ borderStyle: 'dashed', borderColor: '#000', my: 1 }} />

                    <Box>
                        <Box display="flex" justifyContent="space-between">
                            <Typography variant="body2">MONTO NETO</Typography>
                            <Typography variant="body2">${valorNeto.toLocaleString('es-CL')}</Typography>
                        </Box>
                        <Box display="flex" justifyContent="space-between">
                            <Typography variant="body2">I.V.A. (19%)</Typography>
                            <Typography variant="body2">${valorIva.toLocaleString('es-CL')}</Typography>
                        </Box>
                        <Box display="flex" justifyContent="space-between" mt={1}>
                            <Typography variant="h6" fontWeight="bold">TOTAL</Typography>
                            <Typography variant="h6" fontWeight="bold">${total.toLocaleString('es-CL')}</Typography>
                        </Box>
                        <Box display="flex" justifyContent="space-between" mt={1}>
                            <Typography variant="caption">MEDIO PAGO</Typography>
                            <Typography variant="caption" fontWeight="bold">{sale.resumen?.medioPago}</Typography>
                        </Box>
                    </Box>

                    <Box textAlign="center" mt={3}>
                        <Typography variant="body2" fontWeight="bold">¡GRACIAS POR SU COMPRA!</Typography>
                        <Typography variant="caption">VISÍTENOS EN WWW.MundoMascota.CL</Typography>
                    </Box>
                </Box>
            </DialogContent>
            
            <DialogActions sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                <Button onClick={handlePrint} startIcon={<PrintIcon />} variant="contained" fullWidth sx={{ bgcolor: '#2e7d32' }}>
                    Imprimir Boleta
                </Button>
            </DialogActions>
        </Dialog>
    );
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
                <Typography variant="h6" component="div" fontWeight="bold" color={themeColors.text}>
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
    const [allProducts, setAllProducts] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState('');
    // Corregido: Usar fecha local en lugar de UTC para evitar que salte al día siguiente por diferencia horaria
    const [selectedDate, setSelectedDate] = useState(() => {
        const now = new Date();
        return new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
    }); 
    const [loading, setLoading] = useState(true);

    const [selectedSale, setSelectedSale] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isReceiptOpen, setIsReceiptOpen] = useState(false);
    const [receiptSale, setReceiptSale] = useState(null);

    useEffect(() => {
        const loadCatalogs = async () => {
            try {
                const [usersRes, productsRes] = await Promise.all([
                    usersService.findAll(),
                    productsService.getAll()
                ]);
                setUsers(usersRes.data.filter(u => u.rol !== 'cliente'));
                setAllProducts(productsRes.data || []);
            } catch (error) {
                console.error("Error loading catalogs", error);
            }
        };
        loadCatalogs();
    }, []);

    useEffect(() => {
        fetchSalesHistory(selectedUserId, selectedDate);
    }, [selectedUserId, selectedDate, allProducts]);

    const clearFilters = () => {
        setSelectedUserId('');
        setSelectedDate('');
    };

    const fetchSalesHistory = async (userId, date) => {
        setLoading(true);
        try {
            // MODIFICACIÓN: No enviamos filtros al backend para asegurar que traemos todo y filtramos localmente.
            // Esto ayuda a depurar si el problema es el filtrado de fecha del servidor o el ID del vendedor.
            const res = await salesService.getAdminHistory({}); 
            
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

            let formattedSales = rawSales.map(sale => {
                 let vendedorName = 'N/A';
                 let vendedorId = null;

                 if (sale.vendedor && typeof sale.vendedor === 'object') {
                     vendedorName = sale.vendedor.nombre || sale.vendedor.name || 'Vendedor';
                     vendedorId = sale.vendedor.id;
                 } else if (typeof sale.vendedor === 'string') {
                     vendedorName = sale.vendedor;
                 } else if (sale.usuario && typeof sale.usuario === 'object') {
                     vendedorName = sale.usuario.nombre || sale.usuario.name;
                     vendedorId = sale.usuario.id;
                 }

                 if (!vendedorId) {
                     vendedorId = sale.vendedorId || sale.userId;
                 }

                 const total = Number(sale.total || sale.resumen?.total || 0);
                 const medioPago = sale.medioPago || sale.resumen?.medioPago || 'EFECTIVO';
                 
                 // Asegurar que los items vengan correctamente y enriquecer con datos del catálogo si faltan
                 const rawItems = sale.items || sale.detalles || sale.productos || [];
                 const items = rawItems.map(i => {
                     // 1. Intentar obtener nombre directo
                     let nombre = i.nombre || i.producto?.nombre || i.producto?.name;
                     
                     // 2. Intentar obtener precio y cantidad
                     let precio = i.precio || i.precioUnitario || i.producto?.precio;
                     let cantidad = Number(i.cantidad || 1);
                     
                     // Si viene subtotal y falta precio, lo calculamos
                     if (!precio && i.subtotal) {
                         precio = i.subtotal / cantidad;
                     }

                     // 3. Si falta el nombre, buscamos en el catálogo
                     if (!nombre) {
                         let pId = i.productoId || i.producto_id || i.productId || i.ProductId || i.id;
                         
                         // Si no hay ID plano, miramos dentro de 'producto'
                         if (!pId && i.producto) {
                             if (typeof i.producto === 'object') {
                                 pId = i.producto.id || i.producto._id;
                             } else {
                                 // Si es primitivo, asumimos que es el ID (o el nombre si no es numérico)
                                 pId = i.producto;
                             }
                         }

                         // Búsqueda robusta en el catálogo (comparando como strings y revisando _id)
                         if (pId && allProducts.length > 0) {
                             const productCatalog = allProducts.find(p => 
                                 String(p.id) === String(pId) || 
                                 String(p._id) === String(pId)
                             );
                             
                             if (productCatalog) {
                                 nombre = productCatalog.nombre;
                                 if (!precio) precio = productCatalog.precio;
                             }
                         }
                         
                         // 4. Fallback: Si no se encontró en catálogo, pero pId parece ser un nombre (texto largo no numérico)
                         if (!nombre && pId && typeof pId === 'string' && isNaN(Number(pId)) && pId.length > 2) {
                             nombre = pId;
                         }
                     }
                     
                     return {
                         nombre: nombre || 'Producto Desconocido',
                         cantidad: cantidad,
                         precio: Number(precio || 0)
                     };
                 });

                 return {
                    folio: sale.folio || sale.id,
                    fecha: sale.fecha || sale.createdAt, 
                    vendedor: vendedorName,
                    vendedorId: vendedorId, 
                    items: items, 
                    resumen: { medioPago, total } 
                 };
            });

            // Ordenar por fecha descendente (más reciente primero)
            formattedSales.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

            // FILTRO CLIENT-SIDE DE VENDEDOR (Relajado)
            if (userId) {
                formattedSales = formattedSales.filter(sale => {
                    // 1. Coincidencia exacta de ID
                    if (sale.vendedorId && String(sale.vendedorId) === String(userId)) return true;
                    
                    // 2. Coincidencia por nombre (Fallback por si el ID no viene)
                    const selectedUser = users.find(u => String(u.id) === String(userId));
                    if (selectedUser) {
                        const nameToFind = (selectedUser.name || selectedUser.nombre || '').toLowerCase();
                        const saleVendorName = (sale.vendedor || '').toLowerCase();
                        if (nameToFind && saleVendorName.includes(nameToFind)) return true;
                    }
                    
                    return false;
                });
            }

            // FILTRO CLIENT-SIDE DE FECHA
            if (date) {
                formattedSales = formattedSales.filter(sale => {
                    if (!sale.fecha) return false;
                    // Convertimos la fecha UTC de la venta a la fecha LOCAL del navegador
                    const txDate = new Date(sale.fecha);
                    const year = txDate.getFullYear();
                    const month = String(txDate.getMonth() + 1).padStart(2, '0');
                    const day = String(txDate.getDate()).padStart(2, '0');
                    const txDateLocal = `${year}-${month}-${day}`;
                    
                    return txDateLocal === date;
                });
            }

            setSales(formattedSales); 
        } catch (error) {
            console.error("Error al cargar el historial de ventas:", error.response);
            setSales([]);
        } finally {
            setLoading(false);
        }
    };
    
   

    const handleViewReceipt = (sale) => {
        setReceiptSale(sale);
        setIsReceiptOpen(true);
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
                                {(u.name || u.nombre || '').replace(/Adoptapet/gi, 'Mundo Mascota')} ({u.rol})
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
                
                <Button 
                    variant="outlined" 
                    color="secondary" 
                    size="small" 
                    onClick={clearFilters}
                    sx={{ height: 40 }}
                >
                    Limpiar
                </Button>
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
                                        <TableCell>{(sale.vendedor || '').replace(/Adoptapet/gi, 'Mundo Mascota')}</TableCell> 
                                        
                                        
                                        <TableCell>
                                            <StatusChip 
                                                label={sale.resumen?.medioPago} 
                                                color={getPaymentColor(sale.resumen?.medioPago)}
                                                variant="outlined"
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
                                                <ActionButton 
                                                    type="view" 
                                                    icon={<ReceiptLongIcon fontSize="small" />}
                                                    onClick={() => handleViewReceipt(sale)} 
                                                    tooltip="Ver Boleta"
                                                />
                                                <ActionButton 
                                                    type="edit" 
                                                    onClick={() => handleEdit(sale)} 
                                                    tooltip="Editar Venta"
                                                />
                                                <ActionButton 
                                                    type="delete" 
                                                    onClick={() => handleDevolucion(sale.folio)} 
                                                    tooltip="Anular Venta"
                                                />
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

            <ReceiptModal 
                open={isReceiptOpen} 
                handleClose={() => setIsReceiptOpen(false)} 
                sale={receiptSale} 
            />
        </AdminLayout>
    );
};

export default AdminSalesHistory;