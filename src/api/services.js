import api from './axiosConfig'; 

export const authService = {
    login: (credentials) => api.post('/auth/login', credentials),
    getProfile: () => api.get('/auth/profile'),
};

export const productsService = {
    getAll: () => api.get('/productos'),
    create: (data) => api.post('/productos', data),
    update: (id, data) => api.patch(`/productos/${id}`, data),
    delete: (id) => api.delete(`/productos/${id}`),
};

export const categoriesService = {
    getAll: () => api.get('/categorias'),
    create: (data) => api.post('/categorias', data),
    update: (id, data) => api.patch(`/categorias/${id}`, data),
    delete: (id) => api.delete(`/categorias/${id}`),
};

export const salesService = {
    createSale: (ventaData) => api.post('/ventas', ventaData), 
    
    getMyDailySummary: () => api.get('/ventas/mi-caja'),

    getMySales: () => api.get('/ventas/mis-ventas'),

    getAdminDailySummary: (fecha) => api.get('/ventas/caja-admin', { params: { fecha } }),

    getAdminHistory: (filters = {}) => api.get('/ventas/historial-admin', { params: filters }),

    closeDailyBox: (data) => api.post('/ventas/cierre-caja', data),
    
    deleteSale: (id) => api.delete(`/ventas/${id}`), 
    updateSale: (id, data) => api.patch(`/ventas/${id}`, data), 
    
    delete: (id) => api.delete(`/ventas/${id}`),
    update: (id, data) => api.patch(`/ventas/${id}`, data),
};

export const usersService = {
    create: (userData) => api.post('/users', userData), 
    findAll: () => api.get('/users'), 
    update: (id, data) => api.patch(`/users/${id}`, data),
    delete: (id) => api.delete(`/users/${id}`),
};

export const getProductos = () => productsService.getAll().then(res => res.data);
export const createProducto = (data) => productsService.create(data).then(res => res.data);
export const updateProducto = (id, data) => productsService.update(id, data).then(res => res.data);
export const deleteProducto = (id) => productsService.delete(id).then(res => res.data);

export const getCategorias = () => categoriesService.getAll().then(res => res.data);