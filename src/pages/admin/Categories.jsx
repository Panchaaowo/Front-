import { useState, useEffect } from 'react';
import { categoriesService } from '../../api/services'; 
import AdminLayout from '../../components/AdminLayout'; 
import Swal from 'sweetalert2';
import { 
    Paper, Typography, Box, TextField, Button, Table, TableBody, 
    TableCell, TableContainer, TableHead, TableRow, IconButton,
    Dialog, DialogTitle, DialogContent, DialogActions, Chip, Tooltip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CategoryIcon from '@mui/icons-material/Category';
import SaveIcon from '@mui/icons-material/Save';
import CakeIcon from '@mui/icons-material/Cake'; 
import NoFoodIcon from '@mui/icons-material/NoFood'; 
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'; 
import BakeryDiningIcon from '@mui/icons-material/BakeryDining'; 

const CATEGORY_ICONS = {
    'Tortas Cuadradas': CakeIcon,
    'Tortas Circulares': CakeIcon,
    'Postres Individuales': BakeryDiningIcon,
    'Sin Azúcar': NoFoodIcon,
    'Tradicional': BakeryDiningIcon,
    'Sin Gluten': NoFoodIcon,
    'Vegana': NoFoodIcon,
    'Especiales': EmojiEventsIcon,
    'default': CategoryIcon 
};

const getCategoryIcon = (categoryName) => {
    const IconComponent = CATEGORY_ICONS[categoryName] || CATEGORY_ICONS.default;
    return <IconComponent fontSize="small" />;
};


const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState({ id: null, nombre: '', descripcion: '' }); 
    
    const primaryColor = '#d97706'; 
    const errorColor = '#ef4444'; 
    const successColor = '#10b981'; 

    useEffect(() => { loadCategories(); }, []);

    const loadCategories = async () => {
        try {
            const res = await categoriesService.getAll();
            setCategories(res.data);
        } catch (error) {
            console.error("Error al cargar categorías:", error.response || error.message);
            Swal.fire('Error', 'Fallo al cargar categorías desde la API. Revisa tu conexión o token.', 'error');
        }
    };

    const handleOpen = (category = null) => {
        if (category) {
            setForm({ id: category.id, nombre: category.nombre, descripcion: category.descripcion || '' });
        } else {
            setForm({ id: null, nombre: '', descripcion: '' });
        }
        setOpen(true);
    };

    const handleSave = async () => {
        if (!form.nombre.trim()) {
            return Swal.fire('Error', 'El nombre es obligatorio y no puede estar vacío.', 'warning');
        }

        try {
            const dataToSubmit = { 
                nombre: form.nombre.trim(), 
                descripcion: form.descripcion.trim() 
            };
            
            if (form.id) {
                await categoriesService.update(form.id, dataToSubmit);
                Swal.fire({
                    title: 'Éxito',
                    text: 'Categoría actualizada.',
                    icon: 'success',
                    confirmButtonColor: primaryColor
                });
            } else {
                await categoriesService.create(dataToSubmit);
                Swal.fire({
                    title: 'Éxito',
                    text: 'Categoría creada correctamente.',
                    icon: 'success',
                    confirmButtonColor: primaryColor
                });
            }
            
            setOpen(false);
            loadCategories(); 
        } catch (error) {
            console.error("Error al guardar categoría:", error.response || error.message);
            const status = error.response?.status;
            let message = 'Fallo al guardar. Revisa si la API está accesible.';

            if (status === 403) {
                 message = 'Prohibido (Status 403): Tu token no tiene permisos de administrador.';
            } else if (status === 409) { 
                 message = 'Error de Conflicto (Status 409): Ya existe una categoría con ese nombre.';
            } else if (status === 400) { 
                 message = 'Datos Inválidos (Status 400): La API rechazó los datos (ej. nombre demasiado corto).';
            } else if (status >= 500) {
                 message = `Error del Servidor (Status ${status}): Revisa el log de la API.`;
            }

            Swal.fire('Error', message, 'error');
        }
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: "¡No podrás revertir esto! Se recomienda desasociar los productos primero.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: errorColor, 
            cancelButtonColor: '#64748b', 
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                await categoriesService.delete(id);
                
                Swal.fire({
                    title: 'Eliminado',
                    text: 'La categoría ha sido borrada.',
                    icon: 'success',
                    confirmButtonColor: primaryColor
                });
                loadCategories(); 
            } catch (error) {
                console.error("Error al eliminar categoría:", error.response || error.message);
                const status = error.response?.status;
                let message = 'No se pudo borrar. Asegúrate de que no haya productos asociados.';
                
                if (status === 403) {
                     message = 'Prohibido (Status 403): Tu token no tiene permisos de administrador.';
                } else if (status >= 400 && status < 500) {
                     message = 'No se pudo borrar. Hay productos que todavía usan esta categoría. Desasócialos primero.';
                } else if (status >= 500) {
                     message = `Error interno del servidor (Status ${status}). Revisa el log de la API.`;
                }

                Swal.fire('Error', message, 'error');
            }
        }
    };

    return (
        <AdminLayout>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Box>
                    <Typography variant="h4" fontWeight="800" color="#1e293b">
                        Categorías
                    </Typography>
                    <Typography variant="body2" color="#64748b">
                        Organiza tus productos en categorías
                    </Typography>
                </Box>
                <Button 
                    variant="contained" 
                    startIcon={<AddIcon />}
                    sx={{ 
                        bgcolor: primaryColor, 
                        fontWeight: 'bold', 
                        textTransform: 'none', 
                        borderRadius: 2, 
                        px: 3,
                        boxShadow: '0 4px 12px rgba(217, 119, 6, 0.3)',
                        '&:hover': { bgcolor: '#b45309' } 
                    }}
                    onClick={() => handleOpen()}
                >
                    Nueva Categoría
                </Button>
            </Box>

            <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                <Table>
                    <TableHead sx={{ bgcolor: '#f8fafc' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: '700', color: '#475569', py: 2 }}>ID</TableCell>
                            <TableCell sx={{ fontWeight: '700', color: '#475569', py: 2 }}>Nombre</TableCell>
                            <TableCell sx={{ fontWeight: '700', color: '#475569', py: 2 }}>Descripción</TableCell>
                            <TableCell align="right" sx={{ fontWeight: '700', color: '#475569', py: 2 }}>Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {categories.length > 0 ? (
                            categories.map((cat) => (
                                <TableRow key={cat.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                    <TableCell sx={{ color: '#64748b', fontWeight: '600' }}>{cat.id}</TableCell>
                                    <TableCell>
                                        <Box display="flex" alignItems="center" gap={1}>
                                            <Chip 
                                                icon={getCategoryIcon(cat.nombre)}
                                                label={cat.nombre}
                                                size="medium"
                                                sx={{ 
                                                    fontWeight: '600',
                                                    bgcolor: '#fff7ed', 
                                                    color: '#9a3412',
                                                    borderRadius: 2,
                                                    '& .MuiChip-icon': { color: '#ea580c' } 
                                                }}
                                            />
                                        </Box>
                                    </TableCell>
                                    <TableCell sx={{ color: '#64748b' }}>{cat.descripcion || 'Sin descripción'}</TableCell>
                                    <TableCell align="right">
                                        <Box sx={{ whiteSpace: 'nowrap', display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                                            <Tooltip title="Editar">
                                                <IconButton 
                                                    size="small" 
                                                    onClick={() => handleOpen(cat)} 
                                                    sx={{ color: '#3b82f6', bgcolor: '#eff6ff', '&:hover': { bgcolor: '#dbeafe' } }}
                                                >
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Eliminar">
                                                <IconButton 
                                                    size="small" 
                                                    onClick={() => handleDelete(cat.id)} 
                                                    sx={{ color: errorColor, bgcolor: '#fef2f2', '&:hover': { bgcolor: '#fee2e2' } }}
                                                >
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                                    <Typography color="text.secondary">No hay categorías registradas.</Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog 
                open={open} 
                onClose={() => setOpen(false)} 
                fullWidth 
                maxWidth="sm"
                PaperProps={{ sx: { borderRadius: 4 } }}
            >
                <DialogTitle sx={{ fontWeight: '800', color: '#1e293b', pb: 1 }}>
                    {form.id ? 'Editar' : 'Nueva'} Categoría
                </DialogTitle>
                <DialogContent sx={{ minWidth: 400 }}>
                    <Box display="flex" flexDirection="column" gap={3} mt={1}>
                        <TextField 
                            label="Nombre" 
                            fullWidth 
                            value={form.nombre}
                            onChange={(e) => setForm({...form, nombre: e.target.value})}
                            required
                            helperText="El nombre no debe estar vacío y ser único."
                            variant="outlined"
                            InputProps={{ sx: { borderRadius: 2 } }}
                        />
                        <TextField 
                            label="Descripción" 
                            fullWidth 
                            multiline 
                            rows={3}
                            value={form.descripcion}
                            onChange={(e) => setForm({...form, descripcion: e.target.value})}
                            variant="outlined"
                            InputProps={{ sx: { borderRadius: 2 } }}
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 0 }}>
                    <Button onClick={() => setOpen(false)} sx={{ color: '#64748b', fontWeight: 'bold' }}>Cancelar</Button>
                    <Button 
                        onClick={handleSave} 
                        variant="contained" 
                        startIcon={<SaveIcon />}
                        sx={{ 
                            bgcolor: primaryColor, 
                            borderRadius: 2, 
                            fontWeight: 'bold',
                            boxShadow: '0 4px 12px rgba(217, 119, 6, 0.3)',
                            '&:hover': { bgcolor: '#b45309' } 
                        }}
                    >
                        Guardar
                    </Button>
                </DialogActions>
            </Dialog>
        </AdminLayout>
    );
};
export default Categories;