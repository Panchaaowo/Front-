import { useState, useEffect } from 'react';
import { usersService } from '../../api/services';
import AdminLayout from '../../components/templates/AdminLayout';
import Swal from 'sweetalert2';
import { 
    Paper, Typography, Box, TextField, Button, Grid, FormControl, 
    InputLabel, Select, MenuItem, Table, TableBody, TableCell, 
    TableContainer, TableHead, TableRow, Avatar,
    InputAdornment, Card, CardContent, Divider, Stack
} from '@mui/material';
import StatusChip from '../../components/atoms/StatusChip';
import ActionButton from '../../components/atoms/ActionButton';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import BadgeIcon from '@mui/icons-material/Badge';
import LockIcon from '@mui/icons-material/Lock';
import SecurityIcon from '@mui/icons-material/Security';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import EditIcon from '@mui/icons-material/Edit';


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

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [form, setForm] = useState({ name: '', rut: '', password: '', rol: 'vendedor' });
    const [editingId, setEditingId] = useState(null);

    useEffect(() => { loadUsers(); }, []);

    const loadUsers = async () => {
        try {
            const res = await usersService.findAll();
            setUsers(res.data);
        } catch (error) { console.error(error); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                const dataToUpdate = { ...form };
                if (!dataToUpdate.password) delete dataToUpdate.password; 
                
                await usersService.update(editingId, dataToUpdate);
                Swal.fire('Actualizado', 'Usuario actualizado correctamente', 'success');
            } else {
                await usersService.create(form);
                Swal.fire('Éxito', 'Usuario creado correctamente', 'success');
            }
            resetForm();
            loadUsers();
        } catch (error) {
            Swal.fire('Error', 'Error al guardar el usuario. Verifique los datos.', 'error');
        }
    };

    const handleEdit = (user) => {
        setForm({
            name: user.name,
            rut: user.rut,
            password: '', 
            rol: user.rol
        });
        setEditingId(user.id);
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: "No podrás revertir esta acción",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Sí, eliminar'
        });

        if (result.isConfirmed) {
            try {
                await usersService.delete(id);
                Swal.fire('Eliminado', 'El usuario ha sido eliminado.', 'success');
                loadUsers();
            } catch (error) {
                Swal.fire('Error', 'No se pudo eliminar el usuario.', 'error');
            }
        }
    };

    const resetForm = () => {
        setForm({ name: '', rut: '', password: '', rol: 'vendedor' });
        setEditingId(null);
    };

    return (
        <AdminLayout>
            <Box mb={4}>
                <Typography variant="h4" fontWeight="bold" sx={{ color: themeColors.text, mb: 1 }}>
                    Gestión de Personal
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Administra los usuarios, roles y accesos al sistema.
                </Typography>
            </Box>

            <Grid container spacing={4}>
            
                <Grid size={{ xs: 12, md: 4 }}>
                    <Card 
                        elevation={0} 
                        sx={{ 
                            border: `1px solid ${themeColors.border}`, 
                            borderRadius: 3,
                            height: '100%'
                        }}
                    >
                        <Box 
                            sx={{ 
                                p: 2, 
                                bgcolor: editingId ? '#fff7ed' : themeColors.background, 
                                borderBottom: `1px solid ${themeColors.border}`,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1
                            }}
                        >
                            {editingId ? <EditIcon sx={{ color: '#ea580c' }} /> : <PersonAddIcon sx={{ color: themeColors.primary }} />}
                            <Typography variant="h6" fontWeight="bold" color={editingId ? '#ea580c' : themeColors.text}>
                                {editingId ? 'Editar Empleado' : 'Nuevo Empleado'}
                            </Typography>
                        </Box>
                        
                        <CardContent sx={{ p: 3 }}>
                            <form onSubmit={handleSubmit}>
                                <Stack spacing={2}>
                                    <TextField 
                                        fullWidth 
                                        label="Nombre Completo" 
                                        size="small"
                                        value={form.name} 
                                        onChange={e => setForm({...form, name: e.target.value})} 
                                        required
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <AccountCircleIcon fontSize="small" color="action" />
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                    <TextField 
                                        fullWidth 
                                        label="RUT (Sin puntos)" 
                                        size="small" 
                                        placeholder="12345678-9"
                                        value={form.rut} 
                                        onChange={e => setForm({...form, rut: e.target.value})} 
                                        required
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <BadgeIcon fontSize="small" color="action" />
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                    <TextField 
                                        fullWidth 
                                        label={editingId ? "Nueva Contraseña (Opcional)" : "Contraseña"}
                                        type="password" 
                                        size="small"
                                        value={form.password} 
                                        onChange={e => setForm({...form, password: e.target.value})} 
                                        required={!editingId}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <LockIcon fontSize="small" color="action" />
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                    <FormControl fullWidth size="small">
                                        <InputLabel>Rol</InputLabel>
                                        <Select 
                                            value={form.rol} 
                                            label="Rol" 
                                            onChange={e => setForm({...form, rol: e.target.value})}
                                            startAdornment={
                                                <InputAdornment position="start">
                                                    <SecurityIcon fontSize="small" color="action" />
                                                </InputAdornment>
                                            }
                                        >
                                            <MenuItem value="vendedor">Vendedor</MenuItem>
                                            <MenuItem value="admin">Administrador</MenuItem>
                                        </Select>
                                    </FormControl>
                                    
                                    <Button 
                                        type="submit" 
                                        fullWidth 
                                        variant="contained" 
                                        size="large"
                                        sx={{ 
                                            mt: 2, 
                                            bgcolor: editingId ? '#ea580c' : themeColors.primary, 
                                            fontWeight: 'bold', 
                                            '&:hover': { bgcolor: editingId ? '#c2410c' : '#1b5e20' },
                                            borderRadius: 2
                                        }}
                                    >
                                        {editingId ? 'Actualizar Usuario' : 'Registrar Usuario'}
                                    </Button>
                                    
                                    {editingId && (
                                        <Button 
                                            fullWidth 
                                            variant="outlined" 
                                            onClick={resetForm}
                                            sx={{ mt: 1, color: '#64748b', borderColor: '#cbd5e1' }}
                                        >
                                            Cancelar Edición
                                        </Button>
                                    )}
                                </Stack>
                            </form>
                        </CardContent>
                    </Card>
                </Grid>

                
                <Grid size={{ xs: 12, md: 8 }}>
                    <TableContainer 
                        component={Paper} 
                        elevation={0} 
                        sx={{ 
                            border: `1px solid ${themeColors.border}`, 
                            borderRadius: 3,
                            overflow: 'hidden'
                        }}
                    >
                        <Table>
                            <TableHead sx={{ bgcolor: themeColors.background }}>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 'bold', color: themeColors.secondary }}>EMPLEADO</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', color: themeColors.secondary }}>RUT</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', color: themeColors.secondary }}>ROL</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', color: themeColors.secondary }}>FECHA INGRESO</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 'bold', color: themeColors.secondary }}>ACCIONES</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {users.map((u) => (
                                    <TableRow 
                                        key={u.id}
                                        hover
                                        sx={{ '&:hover': { bgcolor: '#f8fafc' } }}
                                    >
                                        <TableCell>
                                            <Box display="flex" alignItems="center" gap={2}>
                                                <Avatar 
                                                    sx={{ 
                                                        bgcolor: u.rol === 'admin' ? themeColors.text : themeColors.primary, 
                                                        width: 36, 
                                                        height: 36, 
                                                        fontSize: 16,
                                                        fontWeight: 'bold'
                                                    }}
                                                >
                                                    {u.name.charAt(0).toUpperCase()}
                                                </Avatar>
                                                <Box>
                                                    <Typography variant="body2" fontWeight="bold" color={themeColors.text}>
                                                        {u.name}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        ID: {u.id}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </TableCell>
                                        <TableCell sx={{ fontFamily: 'monospace', color: themeColors.text }}>
                                            {u.rut}
                                        </TableCell>
                                        <TableCell>
                                            <StatusChip 
                                                label={u.rol.toUpperCase()} 
                                                color={u.rol === 'admin' ? 'warning' : 'info'} 
                                            />
                                        </TableCell>
                                        <TableCell sx={{ color: 'text.secondary' }}>
                                            {new Date(u.createdAt).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell align="right">
                                            <Box display="flex" justifyContent="flex-end" gap={1}>
                                                <ActionButton 
                                                    type="edit" 
                                                    onClick={() => handleEdit(u)} 
                                                />
                                                <ActionButton 
                                                    type="delete" 
                                                    onClick={() => handleDelete(u.id)} 
                                                />
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {users.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                                            No hay usuarios registrados.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Grid>
            </Grid>
        </AdminLayout>
    );
};
export default AdminUsers;