import { useState, useEffect } from 'react';
import { getProductos, getCategorias, createProducto, updateProducto, deleteProducto } from '../../api/services'; 
import { useAuth } from '../../context/AuthContext'; 
import AdminLayout from '../../components/templates/AdminLayout'; 
import Swal from 'sweetalert2'; 
import { 
    Paper, Typography, Box, Button, Table, TableBody, TableCell, 
    TableContainer, TableHead, TableRow, LinearProgress, 
    TextField, Select, MenuItem, FormControl, InputLabel, CircularProgress,
    Dialog, DialogTitle, DialogContent, DialogActions, InputAdornment
} from '@mui/material';
import ReplayIcon from '@mui/icons-material/Replay';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import SearchIcon from '@mui/icons-material/Search';
import StatusChip from '../../components/atoms/StatusChip';
import ActionButton from '../../components/atoms/ActionButton';


const API_URL_BASE = 'http://localhost:3006'; 
const FALLBACK_IMAGE_URL = "https://via.placeholder.com/40/f8f8f8?text=S/F"; 

const buildImageUrl = (path) => {
    if (!path) return FALLBACK_IMAGE_URL;
    if (path.startsWith('http://') || path.startsWith('https://')) {
        return path;
    }
    return `${API_URL_BASE}/${path.replace(/^\//, "")}`; 
};

const Inventory = () => {
    const { user } = useAuth();
    const isAdmin = user && user.rol === 'admin';
    
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentProduct, setCurrentProduct] = useState(null); 
    const [formValues, setFormValues] = useState({
        nombre: '', 
        descripcion: '', 
        precio: 0, 
        stock: 0, 
        categoriaId: '',
        fotoUrl: '', 
    });
    const brandColor = '#2e7d32';

    useEffect(() => { 
        cargarInventarioYCategorias();
    }, []);

    const cargarInventarioYCategorias = async () => {
        setLoading(true);
        try {
           
            const [productsData, categoriesData] = await Promise.all([
                getProductos(), 
                getCategorias() 
            ]);
            
            const productsWithCategory = productsData.map(p => {
                if (p.categoria && typeof p.categoria === 'object') {
                    return p;
                }
                if (p.categoriaId) {
                    const foundCat = categoriesData.find(c => c.id == p.categoriaId);
                    if (foundCat) {
                        return { ...p, categoria: foundCat };
                    }
                }

        
                return p;
            });

            setProducts(productsWithCategory);
            setCategories(categoriesData);
        } catch (error) {
            console.error("Error al cargar datos:", error.response || error.message);
            Swal.fire('Error', 'Fallo al cargar inventario. Revisa tu token de Admin y la conexión del backend.', 'error');
        } finally {
            setLoading(false);
        }
    };
    

    
    const handleOpenModal = (product = null) => {
        if (!isAdmin) return;
        setCurrentProduct(product);
        if (product) {
            setFormValues({
                nombre: product.nombre || '', 
                descripcion: product.descripcion || '',
                precio: product.precio || 0, 
                stock: product.stock || 0,
                categoriaId: product.categoriaId || '', 
                fotoUrl: product.fotoUrl || product.fotourl || '', 
            });
        } else {
            setFormValues({ nombre: '', descripcion: '', precio: 0, stock: 0, categoriaId: '', fotoUrl: '' });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentProduct(null);
    };

   
    const handleChange = (e) => {
        const { name, value } = e.target;
        
        let processedValue = value;

        if (name === 'precio' || name === 'stock') {
             processedValue = Number(value);
        } else if (name === 'categoriaId') {
             processedValue = value === '' ? '' : Number(value);
        }

        setFormValues(prev => ({ 
            ...prev, 
            [name]: processedValue
        }));
    };
    
    
    const handleSubmit = async (e) => {
        e.preventDefault(); 
        if (!isAdmin) return; 
        
        const isCreating = currentProduct === null;

       
        if (isCreating) {
            const isCategoriaValid = formValues.categoriaId && formValues.categoriaId !== 0 && formValues.categoriaId !== '';

            if (!formValues.nombre.trim() || formValues.precio <= 0 || formValues.stock < 0 || !isCategoriaValid) {
                 let errorMsg = 'Complete los campos obligatorios correctamente: Nombre, Precio (>0), Stock (>=0).';
                 if (!isCategoriaValid) {
                     errorMsg += ' ¡Debe seleccionar una Categoría válida!';
                 }
                 return Swal.fire('Error', errorMsg, 'warning');
            }
        }
        
        try {
            
            const dataToSubmit = {
                nombre: formValues.nombre,
                descripcion: formValues.descripcion,
                precio: Number(formValues.precio),
                stock: Number(formValues.stock),
                categoriaId: formValues.categoriaId === '' ? undefined : Number(formValues.categoriaId),
                fotoUrl: formValues.fotoUrl || '', 
            };
            
           
            let filteredData = dataToSubmit;
            if (!isCreating) {
                filteredData = Object.fromEntries(
                    Object.entries(dataToSubmit).filter(([key, value]) => {
                        if (key === 'fotoUrl' && value === '') return false;
                        if (key === 'categoriaId' && value === undefined) return false;
                        if ((key === 'precio' || key === 'stock') && value >= 0) return true;
                        if (typeof value === 'string') return value.trim() !== '';
                        return value !== undefined;
                    })
                );
            }
            
           
            const serviceCall = isCreating
                ? createProducto(dataToSubmit) 
                : updateProducto(currentProduct.id, filteredData);

            await serviceCall;
            
            Swal.fire({
                title: 'Éxito',
                text: `Producto ${isCreating ? 'creado' : 'actualizado'} con éxito.`,
                icon: 'success',
                confirmButtonColor: brandColor
            });
            handleCloseModal();
            cargarInventarioYCategorias();
            
        } catch (error) {
            console.error("Error en la operación de CRUD:", error.response?.data || error.message);
            const status = error.response?.status;
            let errorMessage = `Fallo al guardar. Status: ${status || 'N/A'}. `;

            if (status === 403) {
                 errorMessage = "Prohibido (403): Tu token no tiene permiso de administrador.";
            } else if (status === 400) {
                 const serverMsg = error.response?.data?.message || JSON.stringify(error.response?.data);
                 errorMessage = `Error de Datos (400): ${serverMsg || 'La API rechazó los datos.'}`;
            } else if (status === 404) {
                 errorMessage = "Error (404): El producto a editar no fue encontrado.";
            } else if (status >= 500) {
                 errorMessage += " (Error interno del servidor. Verifica logs del backend).";
            } else {
                 errorMessage = `Fallo de red/conexión. Status: ${status || 'N/A'}. Revisa que la API esté corriendo.`;
            }

            Swal.fire('Error', errorMessage, 'error');
        }
    };

    const handleDelete = async (productId) => {
        if (!isAdmin) return; 
        
        const result = await Swal.fire({
            title: '¿Estás seguro?', 
            text: "¡No podrás revertir esto!", 
            icon: 'warning',
            showCancelButton: true, 
            confirmButtonColor: '#ef4444', 
            cancelButtonColor: '#64748b', 
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                await deleteProducto(productId); 
                
                Swal.fire({
                    title: 'Eliminado',
                    text: 'Producto borrado.',
                    icon: 'success',
                    confirmButtonColor: brandColor
                });
                cargarInventarioYCategorias(); 
                
            } catch (error) {
                console.error('Error al eliminar el producto:', error.response);
                
                const status = error.response?.status;
                let errorMessage = `No se pudo borrar. Status: ${status || 'N/A'}.`;

                if (status === 500) {
                     errorMessage += " (Error interno del servidor. Verifica logs del backend).";
                } else if (status === 403) {
                     errorMessage = "Prohibido (403): No tienes permiso de administrador.";
                } else if (status === 404) {
                     errorMessage = "Producto no encontrado.";
                } else if (status >= 400 && status < 500) {
                    errorMessage = "Error: El producto podría estar asociado a ventas o datos que impiden su eliminación.";
                }

                Swal.fire('Error', errorMessage, 'error');
            }
        }
    };

 
    const totalValor = products.reduce((acc, p) => acc + (p.precio * p.stock), 0);
    const alertasStock = products.filter(p => p.stock < 10).length;
    const filteredProducts = products.filter(p => 
        p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.categoria?.nombre || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const isCreating = currentProduct === null; 

    return (
        <AdminLayout>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4} flexWrap="wrap" gap={2}>
                <Box>
                    <Typography variant="h4" fontWeight="800" color="#1e293b">
                        Inventario
                    </Typography>
                    <Typography variant="body2" color="#64748b">
                        Gestión
                    </Typography>
                </Box>
                
                <Box display="flex" gap={2}>
                    {isAdmin && (
                        <Button 
                            variant="contained" 
                            startIcon={<AddIcon />} 
                            onClick={() => handleOpenModal(null)} 
                            sx={{ 
                                textTransform: 'none', 
                                bgcolor: brandColor, 
                                borderRadius: 2,
                                px: 3,
                                fontWeight: 'bold',
                                boxShadow: '0 4px 12px rgba(46, 125, 50, 0.3)',
                                '&:hover': { bgcolor: '#1b5e20' } 
                            }}
                        >
                            Nuevo Producto 
                        </Button>
                    )}
                    <Button 
                        variant="outlined" 
                        startIcon={<ReplayIcon />} 
                        onClick={cargarInventarioYCategorias}
                        sx={{ 
                            color: '#64748b', 
                            borderColor: '#cbd5e1', 
                            textTransform: 'none',
                            borderRadius: 2,
                            fontWeight: 'bold',
                            '&:hover': { borderColor: '#94a3b8', bgcolor: '#f8fafc' }
                        }}
                    >
                        Actualizar
                    </Button>
                </Box>
            </Box>

            
            <Box display="flex" gap={3} mb={4} flexWrap="wrap">
                <Paper elevation={0} sx={{ p: 3, flex: 1, minWidth: 250, borderRadius: 4, bgcolor: 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Box sx={{ p: 2, borderRadius: '50%', bgcolor: '#ecfccb', color: '#65a30d' }}>
                        <AttachMoneyIcon fontSize="large" />
                    </Box>
                    <Box>
                        <Typography color="#64748b" variant="subtitle2" fontWeight="700">Valor Total Inventario</Typography>
                        <Typography variant="h4" fontWeight="800" color="#1e293b">${totalValor.toLocaleString('es-CL')}</Typography>
                    </Box>
                </Paper>

                
                <Paper elevation={0} sx={{ p: 3, flex: 1, minWidth: 250, borderRadius: 4, bgcolor: 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Box sx={{ p: 2, borderRadius: '50%', bgcolor: '#fee2e2', color: '#dc2626' }}>
                        <WarningAmberIcon fontSize="large" />
                    </Box>
                    <Box>
                        <Typography color="#64748b" variant="subtitle2" fontWeight="700">Alertas de Stock Bajo</Typography>
                        <Typography variant="h4" fontWeight="800" color="#1e293b">{alertasStock}</Typography>
                    </Box>
                </Paper>
            </Box>

            
            <Paper elevation={0} sx={{ p: 2, mb: 3, borderRadius: 3, border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center' }}>
                <SearchIcon sx={{ color: '#94a3b8', mr: 1 }} />
                <TextField 
                    placeholder="Buscar producto por nombre o categoría..." 
                    variant="standard" 
                    fullWidth 
                    InputProps={{ disableUnderline: true }}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </Paper>

            
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress sx={{ color: brandColor }} /></Box>
            ) : (
                <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                    <Table>
                        <TableHead sx={{ bgcolor: '#f8fafc' }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: '700', color: '#475569', py: 2 }}>Producto</TableCell>
                                <TableCell sx={{ fontWeight: '700', color: '#475569', py: 2 }}>Categoría</TableCell> 
                                <TableCell sx={{ fontWeight: '700', color: '#475569', py: 2 }}>Precio</TableCell>
                                <TableCell sx={{ fontWeight: '700', color: '#475569', py: 2 }}>Stock</TableCell>
                                <TableCell sx={{ fontWeight: '700', color: '#475569', py: 2, width: '20%' }}>Estado</TableCell>
                                <TableCell align="right" sx={{ fontWeight: '700', color: '#475569', py: 2 }}>Acciones</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredProducts.length > 0 ? (
                                filteredProducts.map((row) => {
                                    const meta = 50; 
                                    const porcentaje = Math.min((row.stock / meta) * 100, 100);
                                    const esBajo = row.stock < 10;
                                    
                                    return (
                                        <TableRow key={row.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}> 
                                            
                                            <TableCell>
                                                <Box display="flex" alignItems="center" gap={2}>
                                                    <img 
                                                        src={buildImageUrl(row.fotoUrl || row.fotourl)} 
                                                        alt={row.nombre} 
                                                        style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover', border: '1px solid #f1f5f9' }}
                                                        onError={(e) => { e.target.onerror = null; e.target.src=FALLBACK_IMAGE_URL; }} 
                                                    />
                                                    <Box>
                                                        <Typography fontWeight="600" variant="body2" color="#1e293b">{row.nombre}</Typography>
                                                        <Typography variant="caption" color="#94a3b8">ID: {row.id}</Typography>
                                                    </Box>
                                                </Box>
                                            </TableCell>
                                            
                                            <TableCell>
                                                <StatusChip 
                                                    label={row.categoria?.nombre || 'Sin Categoría'} 
                                                    color="default"
                                                />
                                            </TableCell>
                                            <TableCell><Typography fontWeight="600" color="#1e293b">${row.precio?.toLocaleString('es-CL')}</Typography></TableCell>
                                            
                                            <TableCell>
                                                <Typography fontWeight="bold" color="#1e293b">
                                                    {row.stock}
                                                </Typography>
                                            </TableCell>
                                            
                                           
                                            <TableCell>
                                                <Box display="flex" justifyContent="space-between" mb={0.5}>
                                                    <StatusChip 
                                                        label={esBajo ? 'Bajo' : 'Óptimo'} 
                                                        color={esBajo ? 'error' : 'success'} 
                                                    />
                                                </Box>
                                                <LinearProgress 
                                                    variant="determinate" 
                                                    value={porcentaje} 
                                                    sx={{ 
                                                        height: 6, borderRadius: 5, bgcolor: '#f1f5f9', 
                                                        '& .MuiLinearProgress-bar': { bgcolor: esBajo ? '#ef4444' : '#22c55e', borderRadius: 5 } 
                                                    }} 
                                                />
                                            </TableCell>
                                            
                                            <TableCell align="right">
                                                {isAdmin ? (
                                                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                                                        <ActionButton 
                                                            type="edit" 
                                                            onClick={() => handleOpenModal(row)} 
                                                        />
                                                        <ActionButton 
                                                            type="delete" 
                                                            onClick={() => handleDelete(row.id)} 
                                                        />
                                                    </Box>
                                                ) : (
                                                    <Typography variant="caption" color="text.secondary">
                                                        Solo Admin
                                                    </Typography>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                                        <Typography color="text.secondary">No se encontraron productos.</Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            <Dialog 
                open={isModalOpen} 
                onClose={handleCloseModal}
                PaperProps={{ sx: { borderRadius: 4, width: '100%', maxWidth: 500 } }}
            >
                <DialogTitle sx={{ fontWeight: '800', color: '#1e293b', pb: 1 }}>
                    {currentProduct ? 'Editar Producto' : 'Nuevo Producto'}
                </DialogTitle>
                <DialogContent component="form" onSubmit={handleSubmit}>
                    <Box display="flex" flexDirection="column" gap={3} mt={1}>
                        <TextField 
                            label="Nombre del Producto" 
                            name="nombre" 
                            value={formValues.nombre} 
                            onChange={handleChange} 
                            fullWidth 
                            required={isCreating}
                            variant="outlined"
                            InputProps={{ sx: { borderRadius: 2 } }}
                        />
                        <TextField 
                            label="Descripción" 
                            name="descripcion" 
                            value={formValues.descripcion} 
                            onChange={handleChange} 
                            fullWidth 
                            multiline 
                            rows={3}
                            variant="outlined"
                            InputProps={{ sx: { borderRadius: 2 } }}
                        />
                        
                        <TextField 
                            label="URL de la Foto" 
                            name="fotoUrl" 
                            value={formValues.fotoUrl} 
                            onChange={handleChange} 
                            fullWidth 
                            helperText="URL completa o ruta relativa"
                            variant="outlined"
                            InputProps={{ sx: { borderRadius: 2 } }}
                        />
                        
                        <Box display="flex" gap={2}>
                            <TextField 
                                label="Precio" 
                                name="precio" 
                                type="number" 
                                value={formValues.precio} 
                                onChange={handleChange} 
                                fullWidth 
                                required={isCreating} 
                                inputProps={{ min: 0 }}
                                InputProps={{ 
                                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                                    sx: { borderRadius: 2 } 
                                }}
                            />
                            <TextField 
                                label="Stock" 
                                name="stock" 
                                type="number" 
                                value={formValues.stock} 
                                onChange={handleChange} 
                                fullWidth 
                                required={isCreating} 
                                inputProps={{ min: 0 }}
                                InputProps={{ sx: { borderRadius: 2 } }}
                            />
                        </Box>
                        
                        <FormControl fullWidth>
                            <InputLabel>Categoría</InputLabel>
                            <Select 
                                label="Categoría" 
                                name="categoriaId" 
                                value={formValues.categoriaId} 
                                onChange={handleChange} 
                                required={isCreating}
                                sx={{ borderRadius: 2 }}
                            >
                                <MenuItem value={''} disabled>Selecciona una Categoría</MenuItem>
                                {categories.map((cat) => (
                                    <MenuItem key={cat.id} value={cat.id}>
                                        {cat.nombre}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 0 }}>
                    <Button onClick={handleCloseModal} sx={{ color: '#64748b', fontWeight: 'bold' }}>Cancelar</Button>
                    <Button 
                        onClick={handleSubmit} 
                        variant="contained" 
                        startIcon={<SaveIcon />} 
                        sx={{ 
                            bgcolor: brandColor, 
                            borderRadius: 2, 
                            fontWeight: 'bold', 
                            boxShadow: '0 4px 12px rgba(46, 125, 50, 0.3)',
                            '&:hover': { bgcolor: '#1b5e20' } 
                        }}
                    >
                        Guardar
                    </Button>
                </DialogActions>
            </Dialog>
        </AdminLayout>
    );
};

export default Inventory;