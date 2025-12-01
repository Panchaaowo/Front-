import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { 
    Button, TextField, Paper, Box, Typography, Avatar, Container, CssBaseline 
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

const IMAGEN_FONDO = "https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=1920&auto=format&fit=crop";

const Login = () => {
    const [rut, setRut] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();
    const brandColor = '#b45309';

    const handleSubmit = async (e) => {
        e.preventDefault();
        
       
        const result = await login(rut, password);

        if (result.success) {
            
           
            const path = '/home';

            Swal.fire({
                title: `¡Bienvenido!`,
                text: 'Redirigiendo...',
                icon: 'success',
                timer: 1000,
                showConfirmButton: false
            });
            
            
            setTimeout(() => navigate(path), 1000); 

        } else {
            Swal.fire('Error', 'Credenciales inválidas.', 'error');
        }
    };

    return (
        <div style={{ 
            backgroundImage: `url(${IMAGEN_FONDO})`, 
            backgroundSize: 'cover', 
            backgroundPosition: 'center',
            height: '100vh', 
            width: '100vw',
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center' 
        }}>
            <CssBaseline />
            <Container component="main" maxWidth="xs">
                <Paper 
                    elevation={6} 
                    sx={{ 
                        p: 5, 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center', 
                        bgcolor: 'rgba(255,255,255,0.95)',
                        backdropFilter: 'blur(4px)',
                        borderRadius: 4,
                        boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
                    }}
                >
                    <Box 
                        sx={{ 
                            m: 1, 
                            bgcolor: '#fff7ed', 
                            p: 2, 
                            borderRadius: '50%',
                            color: brandColor,
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            mb: 2
                        }}
                    >
                        <LockOutlinedIcon fontSize="large" />
                    </Box>
                    
                    <Typography component="h1" variant="h5" fontWeight="800" color="#1e293b" sx={{ mb: 1 }}>
                        Bienvenido
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Inicia sesión en Pastelería Dulce Sabor
                    </Typography>

                    <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
                        <TextField 
                            margin="normal" 
                            required 
                            fullWidth 
                            label="RUT de Usuario" 
                            placeholder="Ej: 12345678-9"
                            autoFocus 
                            value={rut} 
                            onChange={(e) => setRut(e.target.value)} 
                            sx={{ 
                                '& .MuiOutlinedInput-root': { borderRadius: 2 }
                            }}
                        />
                        <TextField 
                            margin="normal" 
                            required 
                            fullWidth 
                            label="Contraseña" 
                            type="password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            sx={{ 
                                '& .MuiOutlinedInput-root': { borderRadius: 2 }
                            }}
                        />
                        
                        <Button 
                            type="submit" 
                            fullWidth 
                            variant="contained" 
                            size="large"
                            sx={{ 
                                mt: 4, mb: 2, 
                                bgcolor: brandColor, 
                                py: 1.5, 
                                borderRadius: 2,
                                fontWeight: 'bold',
                                fontSize: '1rem',
                                textTransform: 'none',
                                boxShadow: '0 4px 12px rgba(217, 119, 6, 0.3)',
                                '&:hover': { 
                                    bgcolor: '#9a3412',
                                    boxShadow: '0 6px 16px rgba(217, 119, 6, 0.4)'
                                }
                            }}
                        >
                            Ingresar al Sistema
                        </Button>

                        
                        <Box sx={{ mt: 2, p: 2, bgcolor: '#f8fafc', borderRadius: 2, border: '1px dashed #cbd5e1' }}>
                            <Typography variant="caption" display="block" color="text.secondary" align="center" fontWeight="bold" mb={1}>
                        
                            </Typography>
                            <Box display="flex" justifyContent="space-between" gap={2}>
                                <Box>
                                    <Typography variant="caption" display="block" fontWeight="bold" color="#d97706">Administrador</Typography>
                                    <Typography variant="caption" display="block" color="text.secondary">RUT: 1-9</Typography>
                                    <Typography variant="caption" display="block" color="text.secondary">Pass: admin123</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" display="block" fontWeight="bold" color="#3b82f6">Vendedor</Typography>
                                    <Typography variant="caption" display="block" color="text.secondary">RUT: 2-7</Typography>
                                    <Typography variant="caption" display="block" color="text.secondary">Pass: vendedor123</Typography>
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                </Paper>
            </Container>
        </div>
    );
};

export default Login;