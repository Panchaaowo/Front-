import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { salesService } from "../api/services"; 
import Swal from 'sweetalert2';
import { 
    Container, Grid, Paper, Typography, Box, Button, TextField, Divider, AppBar, Toolbar, IconButton, Chip,
    Dialog, DialogContent, DialogActions, Slide
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MoneyIcon from '@mui/icons-material/AttachMoney';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import StorefrontIcon from '@mui/icons-material/Storefront';
import PersonIcon from '@mui/icons-material/Person';
import PrintIcon from '@mui/icons-material/Print';
import CloseIcon from '@mui/icons-material/Close';
import DetalleBoleta from './DetalleBoleta'; 


const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const PAYMENT_OPTIONS = [
    { id: 'EFECTIVO', label: 'Efectivo', icon: <MoneyIcon fontSize="large" />, color: '#2e7d32' },
    { id: 'DEBITO', label: 'Débito', icon: <CreditCardIcon fontSize="large" />, color: '#3b82f6' },
    { id: 'CREDITO', label: 'Crédito', icon: <CreditCardIcon fontSize="large" />, color: '#f59e0b' },
];

const Boleta = () => {
    const { cart, total, clearCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();
    
    const [metodo, setMetodo] = useState('EFECTIVO'); 
    const [montoRecibido, setMontoRecibido] = useState(0);
    const [folioVenta, setFolioVenta] = useState(null); 
    const [openReceipt, setOpenReceipt] = useState(false); 

    const brandColor = '#2e7d32';
    const valorNeto = Math.round(total / 1.19);
    const valorIva = total - valorNeto;
    
    
    const vuelto = metodo === 'EFECTIVO' ? (montoRecibido > total ? montoRecibido - total : 0) : 0;
    const pagoSuficiente = metodo !== 'EFECTIVO' || montoRecibido >= total;

    useEffect(() => {
        if (cart.length === 0 && !openReceipt) navigate('/home');
    }, [cart, navigate, openReceipt]);


    const handleConfirmarVenta = async () => {
        if (!pagoSuficiente) {
            Swal.fire('Error', 'El monto recibido es insuficiente.', 'warning');
            return;
        }

        try {
            
            const itemsPayload = cart.map(item => ({
                productoId: item.id,
                cantidad: item.cantidad
            }));

            const montoEntregado = metodo === 'EFECTIVO' ? montoRecibido : total;

            const ventaPayload = {
                items: itemsPayload,
                medioPago: metodo,
                montoEntregado: montoEntregado,
                vendedorId: user?.id 
            };

            
            const res = await salesService.createSale(ventaPayload);

           
            const folioGenerado = res.data.folio || res.data.id || 'N/A';
            setFolioVenta(folioGenerado); 
            
            
            setOpenReceipt(true);

        } catch (error) {
            console.error("Error al confirmar venta:", error.response?.data);
            Swal.fire('Error', error.response?.data?.message || 'Error de conexión con el inventario.', 'error');
        }
    };

    const handleCloseReceipt = () => {
        setOpenReceipt(false);
        clearCart();
        navigate('/home');
    };

    const handlePrintReceipt = () => {
        window.print();

    };

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#f4f6f8', display: 'flex', flexDirection: 'column' }}>
            
         
            <Dialog
                open={openReceipt}
                TransitionComponent={Transition}
                keepMounted
                onClose={handleCloseReceipt}
                aria-describedby="alert-dialog-slide-description"
                maxWidth="xs"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 2,
                        bgcolor: '#fff',
                        backgroundImage: 'linear-gradient(#fff 50%, #f9f9f9 50%)',
                        backgroundSize: '100% 4px'
                    }
                }}
            >
                <DialogContent sx={{ p: 0 }}>
                    <Box sx={{ p: 3, bgcolor: '#fff', position: 'relative', overflow: 'hidden' }}>
                        
                       
                        <Box display="flex" justifyContent="center" mb={2}>
                            <Box sx={{ 
                                width: 60, height: 60, borderRadius: '50%', bgcolor: '#e8f5e9', 
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: '#2e7d32'
                            }}>
                                <CheckCircleIcon sx={{ fontSize: 40 }} />
                            </Box>
                        </Box>

                        <Typography variant="h5" align="center" fontWeight="bold" gutterBottom sx={{ color: '#2e7d32' }}>
                            ¡Venta Exitosa!
                        </Typography>
                        <Typography variant="body2" align="center" color="text.secondary" mb={3}>
                            Ticket N° {folioVenta}
                        </Typography>

                       
                        <Paper 
                            elevation={0} 
                            sx={{ 
                                p: 2, 
                                bgcolor: '#fff', 
                                border: '1px dashed #bdbdbd',
                                fontFamily: '"Courier New", Courier, monospace'
                            }}
                        >
                           
                            <Box textAlign="center" mb={2}>
                                <Typography variant="subtitle2" fontWeight="bold" textTransform="uppercase">VentaPett</Typography>
                                <Typography variant="caption" display="block">AV. Matta 4234</Typography>
                                <Typography variant="caption" display="block">{new Date().toLocaleDateString()} - {new Date().toLocaleTimeString()}</Typography>
                            </Box>

                            <Divider sx={{ borderStyle: 'dashed', mb: 2 }} />

                          
                            <Box mb={2}>
                                {cart.map((item) => (
                                    <Box key={item.id} display="flex" justifyContent="space-between" mb={1}>
                                        <Typography variant="caption" sx={{ flex: 1 }}>
                                            {item.cantidad} x {item.nombre.toUpperCase()}
                                        </Typography>
                                        <Typography variant="caption" fontWeight="bold">
                                            ${(item.precio * item.cantidad).toLocaleString('es-CL')}
                                        </Typography>
                                    </Box>
                                ))}
                            </Box>

                            <Divider sx={{ borderStyle: 'dashed', mb: 2 }} />

                           
                            <Box display="flex" justifyContent="space-between" mb={0.5}>
                                <Typography variant="caption">NETO</Typography>
                                <Typography variant="caption">${valorNeto.toLocaleString('es-CL')}</Typography>
                            </Box>
                            <Box display="flex" justifyContent="space-between" mb={1}>
                                <Typography variant="caption">IVA</Typography>
                                <Typography variant="caption">${valorIva.toLocaleString('es-CL')}</Typography>
                            </Box>
                            <Box display="flex" justifyContent="space-between">
                                <Typography variant="subtitle2" fontWeight="bold">TOTAL</Typography>
                                <Typography variant="subtitle2" fontWeight="bold">${total.toLocaleString('es-CL')}</Typography>
                            </Box>

                            
                            <Box mt={2} pt={1} borderTop="1px dashed #bdbdbd">
                                <Box display="flex" justifyContent="space-between">
                                    <Typography variant="caption">PAGO ({metodo})</Typography>
                                    <Typography variant="caption">${(metodo === 'EFECTIVO' ? montoRecibido : total).toLocaleString('es-CL')}</Typography>
                                </Box>
                                {metodo === 'EFECTIVO' && (
                                    <Box display="flex" justifyContent="space-between">
                                        <Typography variant="caption">VUELTO</Typography>
                                        <Typography variant="caption">${vuelto.toLocaleString('es-CL')}</Typography>
                                    </Box>
                                )}
                            </Box>
                        </Paper>

                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2, bgcolor: '#f5f5f5', justifyContent: 'space-between' }}>
                    <Button 
                        onClick={handleCloseReceipt} 
                        color="inherit"
                        startIcon={<CloseIcon />}
                    >
                        Cerrar
                    </Button>
                    <Button 
                        onClick={handlePrintReceipt} 
                        variant="contained" 
                        color="primary"
                        startIcon={<PrintIcon />}
                        sx={{ bgcolor: brandColor, '&:hover': { bgcolor: '#1b5e20' } }}
                    >
                        Imprimir
                    </Button>
                </DialogActions>
            </Dialog>
            
            
            <style>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    #printable-receipt, #printable-receipt * {
                        visibility: visible;
                    }
                    #printable-receipt {
                        position: absolute;
                        left: 0;
                        right: 0;
                        margin: 0 auto;
                        top: 0;
                        width: 80mm; /* Ancho estándar de boleta térmica */
                        display: block !important;
                        background-color: white;
                        padding: 10px;
                    }
                    /* Ocultar todo lo demás */
                    .no-print {
                        display: none !important;
                    }
                    @page {
                        size: auto;
                        margin: 0mm;
                    }
                }
                /* Ocultar la boleta en la vista normal */
                #printable-receipt {
                    display: none;
                }
            `}</style>

           
            <AppBar position="static" color="default" elevation={1} className="no-print" sx={{ bgcolor: 'white', borderBottom: '1px solid #e0e0e0' }}>
                <Toolbar sx={{ justifyContent: 'space-between' }}>
                    <Box display="flex" alignItems="center" gap={2}>
                        <IconButton onClick={() => navigate('/home')} sx={{ color: '#666' }}>
                            <ArrowBackIcon />
                        </IconButton>
                        <Box display="flex" alignItems="center" gap={1}>
                            <StorefrontIcon sx={{ color: brandColor }} />
                            <Typography variant="h6" fontWeight="bold" sx={{ fontFamily: 'serif', color: '#333' }}>
                                Finalizar Venta
                            </Typography>
                        </Box>
                    </Box>

                    <Box display="flex" alignItems="center" gap={2}>
                        <Chip 
                            icon={<PersonIcon />} 
                            label={user?.nombre || 'Cajero'} 
                            variant="outlined" 
                            sx={{ borderColor: '#e0e0e0' }}
                        />
                    </Box>
                </Toolbar>
            </AppBar>

            <Container maxWidth="lg" className="no-print" sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
                <Grid container spacing={4} justifyContent="center">
                   
                    <Grid size={{ xs: 12, md: 5 }}>
                        <Paper 
                            elevation={2} 
                            sx={{ 
                                p: 3, 
                                borderRadius: 2, 
                                bgcolor: '#fff',
                            }}
                        >
                            <Box display="flex" alignItems="center" gap={1} mb={2}>
                                <ReceiptLongIcon color="action" />
                                <Typography variant="h6" fontWeight="bold">Resumen del Pedido</Typography>
                            </Box>
                            
                            <Divider sx={{ mb: 2 }} />

                            <Box sx={{ maxHeight: '400px', overflowY: 'auto', mb: 2, pr: 1 }}>
                                {cart.map((item) => (
                                    <DetalleBoleta 
                                        key={item.id} 
                                        item={item} 
                                        subtotal={item.precio * item.cantidad}
                                    />
                                ))}
                            </Box>

                            <Divider sx={{ my: 2 }} />

                            <Box display="flex" justifyContent="space-between" mb={1}>
                                <Typography variant="body2" color="text.secondary">Neto</Typography>
                                <Typography variant="body2">${valorNeto.toLocaleString('es-CL')}</Typography>
                            </Box>
                            <Box display="flex" justifyContent="space-between" mb={2}>
                                <Typography variant="body2" color="text.secondary">IVA (19%)</Typography>
                                <Typography variant="body2">${valorIva.toLocaleString('es-CL')}</Typography>
                            </Box>
                            
                            <Box display="flex" justifyContent="space-between" alignItems="center" bgcolor="#f9fafb" p={2} borderRadius={1}>
                                <Typography variant="h6" fontWeight="bold">Total a Pagar</Typography>
                                <Typography variant="h5" fontWeight="bold" color={brandColor}>${total.toLocaleString('es-CL')}</Typography>
                            </Box>
                        </Paper>
                    </Grid>


                    
                    <Grid size={{ xs: 12, md: 7 }}>
                        <Paper 
                            elevation={4} 
                            sx={{ 
                                p: 4, 
                                borderRadius: 3, 
                                bgcolor: 'white'
                            }}
                        >

                            <Typography variant="h6" fontWeight="bold" mb={3} display="flex" alignItems="center" gap={1}>
                                <MoneyIcon color="action" /> Método de Pago
                            </Typography>

                            <Grid container spacing={2} mb={4}>
                                {PAYMENT_OPTIONS.map((m) => (
                                    <Grid size={{ xs: 4 }} key={m.id}>
                                        <Paper
                                            elevation={0}
                                            onClick={() => {
                                                setMetodo(m.id);
                                                if (m.id !== 'EFECTIVO') setMontoRecibido(total); 
                                            }}
                                            sx={{ 
                                                cursor: 'pointer',
                                                py: 2, 
                                                px: 1,
                                                borderRadius: 2,
                                                border: metodo === m.id ? `2px solid ${brandColor}` : '1px solid #e0e0e0',
                                                bgcolor: metodo === m.id ? '#e8f5e9' : 'white',
                                                color: metodo === m.id ? brandColor : '#666',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                transition: '0.2s',
                                                '&:hover': { borderColor: brandColor, transform: 'translateY(-2px)' }
                                            }}
                                        >
                                            <Box sx={{ mb: 1, color: metodo === m.id ? brandColor : m.color }}>
                                                {m.icon}
                                            </Box>
                                            <Typography variant="caption" fontWeight="bold" align="center">{m.label}</Typography>
                                        </Paper>
                                    </Grid>
                                ))}
                            </Grid>

                            {metodo === 'EFECTIVO' && (
                                <Box mb={4} sx={{ bgcolor: '#f4f6f8', p: 3, borderRadius: 2, border: '1px solid #e0e0e0' }}>
                                    <Typography variant="subtitle2" fontWeight="bold" mb={1} color="text.secondary">
                                        Dinero Recibido
                                    </Typography>
                                    <TextField 
                                        fullWidth 
                                        type="number" 
                                        placeholder={`Mínimo: $${total.toLocaleString('es-CL')}`}
                                        value={montoRecibido || ''}
                                        onChange={(e) => setMontoRecibido(Number(e.target.value))}
                                        InputProps={{
                                            startAdornment: <Typography color="text.secondary" mr={1}>$</Typography>,
                                            sx: { bgcolor: 'white', fontSize: '1.2rem', fontWeight: 'bold' }
                                        }}
                                    />

                                    <Box display="flex" justifyContent="space-between" mt={3} alignItems="center">
                                        <Typography variant="body1" fontWeight="bold" color="text.secondary">Vuelto:</Typography>
                                        <Typography 
                                            variant="h4" 
                                            fontWeight="bold" 
                                            color={vuelto >= 0 ? 'success.main' : 'error.main'}
                                        >
                                            ${vuelto.toLocaleString('es-CL')}
                                        </Typography>
                                    </Box>
                                </Box>
                            )}

                            <Button 
                                fullWidth 
                                variant="contained" 
                                size="large" 
                                onClick={handleConfirmarVenta}
                                disabled={!pagoSuficiente}
                                sx={{ 
                                    bgcolor: brandColor, 
                                    py: 2,
                                    borderRadius: 2, 
                                    fontSize: '1.1rem', 
                                    fontWeight: 'bold', 
                                    boxShadow: '0 4px 12px rgba(46, 125, 50, 0.4)',
                                    '&:hover': { bgcolor: '#1b5e20' } 
                                }}
                                startIcon={<CheckCircleIcon />}
                            >
                                CONFIRMAR PAGO
                            </Button>

                        </Paper>
                    </Grid>

                </Grid>
            </Container>

        
            <div id="printable-receipt">
                <Box sx={{ fontFamily: '"Courier New", Courier, monospace', textAlign: 'center' }}>
                    <Typography variant="h6" fontWeight="bold" textTransform="uppercase" sx={{ letterSpacing: 2, fontSize: '1.2rem' }}>
                        Mundo Mascota
                    </Typography>
                    <Typography variant="h5" fontWeight="bold" textTransform="uppercase" sx={{ mb: 1, fontSize: '1.4rem' }}>
                        Pet Shop
                    </Typography>
                    <Typography variant="caption" display="block" sx={{ fontSize: '0.8rem' }}>R.U.T.: 76.543.210-K</Typography>
                    <Typography variant="caption" display="block" sx={{ fontSize: '0.8rem' }}>GIRO: Venta de Mascotas</Typography>
                    <Typography variant="caption" display="block" sx={{ fontSize: '0.8rem' }}>CASA MATRIZ: AV. Matta 4234</Typography>
                    <Typography variant="caption" display="block" sx={{ fontSize: '0.8rem' }}>SANTIAGO, CHILE</Typography>
                    <Typography variant="caption" display="block" mt={1} sx={{ fontSize: '0.8rem' }}>FONO: +56 9 1234 5678</Typography>
                    
                    <Divider sx={{ my: 1, borderStyle: 'dashed', borderColor: '#000' }} />
                    
                    <Typography variant="body2" fontWeight="bold" sx={{ fontSize: '0.9rem' }}>
                        BOLETA ELECTRÓNICA N° {folioVenta || '---'}
                    </Typography>
                    <Typography variant="caption" display="block" sx={{ fontSize: '0.8rem' }}>S.I.I. - SANTIAGO CENTRO</Typography>
                    
                    <Box mt={1} display="flex" justifyContent="space-between">
                        <Typography variant="caption" sx={{ fontSize: '0.8rem' }}>FECHA: {new Date().toLocaleDateString()}</Typography>
                        <Typography variant="caption" sx={{ fontSize: '0.8rem' }}>HORA: {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                        <Typography variant="caption" sx={{ fontSize: '0.8rem' }}>VENDEDOR: {user?.nombre?.toUpperCase() || 'CAJERO'}</Typography>
                        <Typography variant="caption" sx={{ fontSize: '0.8rem' }}>CAJA: 1</Typography>
                    </Box>
                </Box>

                <Divider sx={{ my: 1, borderStyle: 'dashed', borderColor: '#000' }} />

                
                <Box sx={{ mb: 2 }}>
                    {cart.map((item) => (
                        <Box key={item.id} sx={{ mb: 1.5 }}>
                            <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                                <Typography variant="body2" sx={{ fontFamily: '"Courier New", Courier, monospace', textTransform: 'uppercase', fontWeight: 'bold', flex: 1, mr: 2, fontSize: '0.9rem' }}>
                                    {item.nombre}
                                </Typography>
                                <Typography variant="body2" sx={{ fontFamily: '"Courier New", Courier, monospace', fontWeight: 'bold', fontSize: '0.9rem' }}>
                                    ${(item.precio * item.cantidad).toLocaleString('es-CL')}
                                </Typography>
                            </Box>
                            <Typography variant="caption" sx={{ fontFamily: '"Courier New", Courier, monospace', color: '#555', display: 'block', mt: 0.5 }}>
                                {item.cantidad} x ${item.precio.toLocaleString('es-CL')}
                            </Typography>
                        </Box>
                    ))}
                </Box>

                <Divider sx={{ my: 1, borderStyle: 'dashed', borderColor: '#000' }} />

                
                <Box sx={{ fontFamily: '"Courier New", Courier, monospace' }}>
                    <Box display="flex" justifyContent="space-between" mb={0.5}>
                        <Typography variant="body2" sx={{ fontSize: '0.9rem' }}>MONTO NETO</Typography>
                        <Typography variant="body2" sx={{ fontSize: '0.9rem' }}>${valorNeto.toLocaleString('es-CL')}</Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between" mb={0.5}>
                        <Typography variant="body2" sx={{ fontSize: '0.9rem' }}>I.V.A. (19%)</Typography>
                        <Typography variant="body2" sx={{ fontSize: '0.9rem' }}>${valorIva.toLocaleString('es-CL')}</Typography>
                    </Box>
                    
                    <Box display="flex" justifyContent="space-between" mt={1} mb={1}>
                        <Typography variant="h6" fontWeight="bold">TOTAL</Typography>
                        <Typography variant="h6" fontWeight="bold">${total.toLocaleString('es-CL')}</Typography>
                    </Box>
                    
                    <Box display="flex" justifyContent="space-between">
                        <Typography variant="caption" sx={{ fontStyle: 'italic', fontSize: '0.7rem' }}></Typography>
                    </Box>
                </Box>

                <Divider sx={{ my: 2, borderStyle: 'dashed', borderColor: '#000' }} />

              
                <Box textAlign="center" sx={{ fontFamily: '"Courier New", Courier, monospace' }}>
                    <Typography variant="body2" fontWeight="bold" sx={{ fontSize: '0.9rem' }}>¡GRACIAS POR SU COMPRA!</Typography>
                    <Typography variant="caption" display="block" mt={1} sx={{ fontSize: '0.8rem' }}>VISÍTENOS EN WWW.MundoMascota.CL</Typography>
                    
                  
                    <Box mt={2} sx={{ height: 30, bgcolor: '#000', width: '90%', mx: 'auto', opacity: 0.8, maskImage: 'repeating-linear-gradient(90deg, #000, #000 2px, transparent 2px, transparent 4px)' }} />
                </Box>
            </div>

        </Box>
    );
};

export default Boleta;