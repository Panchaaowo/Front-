import { useState, useEffect } from 'react';
import { usersService } from '../../api/services';
import AdminLayout from '../../components/AdminLayout';
import Swal from 'sweetalert2';
import { 
    Paper, Typography, Box, TextField, Button, Grid, FormControl, 
    InputLabel, Select, MenuItem, Table, TableBody, TableCell, 
    TableContainer, TableHead, TableRow, Chip, Avatar,
    InputAdornment, Card, CardContent, Divider, Stack
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import BadgeIcon from '@mui/icons-material/Badge';
import LockIcon from '@mui/icons-material/Lock';
import SecurityIcon from '@mui/icons-material/Security';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';


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

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [form, setForm] = useState({ name: '', rut: '', password: '', rol: 'vendedor' });

    useEffect(() => { loadUsers(); }, []);

    const loadUsers = async () => {
        try {
            const res = await usersService.findAll();
            setUsers(res.data);
        } catch (error) { console.error(error); }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await usersService.create(form);
            Swal.fire('Éxito', 'Usuario creado correctamente', 'success');
            setForm({ name: '', rut: '', password: '', rol: 'vendedor' });
            loadUsers();
        } catch (error) {
            Swal.fire('Error', 'El RUT ya existe o faltan datos', 'error');
        }
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
            
                <Grid item xs={12} md={4}>
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
                                bgcolor: themeColors.background, 
                                borderBottom: `1px solid ${themeColors.border}`,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1
                            }}
                        >
                            <PersonAddIcon sx={{ color: themeColors.primary }} />
                            <Typography variant="h6" fontWeight="bold" color={themeColors.text}>
                                Nuevo Empleado
                            </Typography>
                        </Box>
                        
                        <CardContent sx={{ p: 3 }}>
                            <form onSubmit={handleCreate}>
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
                                        label="Contraseña" 
                                        type="password" 
                                        size="small"
                                        value={form.password} 
                                        onChange={e => setForm({...form, password: e.target.value})} 
                                        required
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
                                            bgcolor: themeColors.primary, 
                                            fontWeight: 'bold', 
                                            '&:hover': { bgcolor: '#b45309' },
                                            borderRadius: 2
                                        }}
                                    >
                                        Registrar Usuario
                                    </Button>
                                </Stack>
                            </form>
                        </CardContent>
                    </Card>
                </Grid>

                
                <Grid item xs={12} md={8}>
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
                                            <Chip 
                                                label={u.rol.toUpperCase()} 
                                                size="small" 
                                                sx={{ 
                                                    bgcolor: u.rol === 'admin' ? '#f3e8ff' : '#dbeafe', 
                                                    color: u.rol === 'admin' ? '#6b21a8' : '#1e40af',
                                                    fontWeight: 'bold',
                                                    borderRadius: 1
                                                }} 
                                            />
                                        </TableCell>
                                        <TableCell sx={{ color: 'text.secondary' }}>
                                            {new Date(u.createdAt).toLocaleDateString()}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {users.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={4} align="center" sx={{ py: 4, color: 'text.secondary' }}>
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