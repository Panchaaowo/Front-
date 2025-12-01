import { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../api/services';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = () => {
            const token = localStorage.getItem('token');
            const savedUser = localStorage.getItem('user');
            
            if (token && savedUser) {
                setUser(JSON.parse(savedUser));
                setIsAuthenticated(true);
            }
            setLoading(false);
        };
        initAuth();
    }, []);

    const login = async (rut, password) => {
        try {
            const response = await authService.login({ rut, password });
            
            if (response.data && response.data.access_token) {
                const { access_token, rol, rut: usuarioRut, id, name } = response.data;
                
                const userData = { 
                    id,
                    rut: usuarioRut, 
                    rol, 
                    nombre: name || (rol === 'admin' ? 'Jefe' : 'Vendedor') 
                };

                localStorage.setItem('token', access_token);
                localStorage.setItem('user', JSON.stringify(userData));
                
                setUser(userData);
                setIsAuthenticated(true);
                
                return { success: true, rol }; 
            }
            return { success: false };
        } catch (error) {
            console.error("Login falló", error.response?.data);
            return { success: false, error: error.response?.data?.message };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setIsAuthenticated(false);
        window.location.href = '/login';
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isAuthenticated, loading }}>
            {children}
        </AuthContext.Provider>
    );
};