import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { 
    Button, TextField, Paper, Box, Typography, Avatar, Container, CssBaseline 
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

const IMAGEN_FONDO = "https://wallpapers.com/images/hd/animal-background-kzgjbso0soj1gt77.jpg";

const Login = () => {
    const [rut, setRut] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();
    const brandColor = '#2e7d32'; // Green for exotic animals

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
                        p: 3, 
                        width: '100%',
                        maxWidth: 350,
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center', 
                        bgcolor: 'rgba(255,255,255,0.2)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: 4,
                        boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
                    }}
                >
                    <Box 
                        sx={{ 
                            m: 1, 
                            bgcolor: '#e8f5e9', 
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
                    <Typography variant="body2" color="black" sx={{ mb: 3 }}>
                        Inicia sesión en Mundo Mascota
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
                                '& .MuiOutlinedInput-root': { 
                                    borderRadius: 2, 
                                    bgcolor: '#ffffff',
                                    '&.Mui-focused fieldset': { borderColor: 'black' }
                                },
                                '& .MuiInputLabel-root.Mui-focused': { color: 'black' },
                                '& .MuiInputLabel-shrink': { transform: 'translate(14px, -20px) scale(0.75)' }
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
                                '& .MuiOutlinedInput-root': { 
                                    borderRadius: 2, 
                                    bgcolor: '#ffffff',
                                    '&.Mui-focused fieldset': { borderColor: 'black' }
                                },
                                '& .MuiInputLabel-root.Mui-focused': { color: 'black' },
                                '& .MuiInputLabel-shrink': { transform: 'translate(14px, -20px) scale(0.75)' }
                            }}
                        />
                        
                        <Button 
                            type="submit" 
                            fullWidth 
                            variant="contained" 
                            size="large"
                            sx={{ 
                                mt: 3, mb: 2, 
                                bgcolor: brandColor, 
                                py: 1.2, 
                                borderRadius: 2,
                                fontWeight: 'bold',
                                fontSize: '1rem',
                                textTransform: 'none',
                                boxShadow: '0 4px 12px rgba(46, 125, 50, 0.3)',
                                '&:hover': { 
                                    bgcolor: '#1b5e20',
                                    boxShadow: '0 6px 16px rgba(46, 125, 50, 0.4)'
                                }
                            }}
                        >
                            Ingresar al Sistema
                        </Button>
                    </Box>
                </Paper>
            </Container>
        </div>
    );
};

export default Login;