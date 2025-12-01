import { describe, it, expect, vi, beforeEach } from 'vitest';
import api from './axiosConfig';
import {
    authService,
    productsService,
    categoriesService,
    salesService,
    usersService,
    getProductos,
    createProducto,
    updateProducto,
    deleteProducto,
    getCategorias
} from './services';

// Mock axios instance
vi.mock('./axiosConfig', () => ({
    default: {
        get: vi.fn(),
        post: vi.fn(),
        patch: vi.fn(),
        delete: vi.fn(),
    }
}));

describe('Services', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('authService', () => {
        it('login calls api.post with correct arguments', async () => {
            const credentials = { username: 'test', password: '123' };
            await authService.login(credentials);
            expect(api.post).toHaveBeenCalledWith('/auth/login', credentials);
        });

        it('getProfile calls api.get with correct arguments', async () => {
            await authService.getProfile();
            expect(api.get).toHaveBeenCalledWith('/auth/profile');
        });
    });

    describe('productsService', () => {
        it('getAll calls api.get with correct arguments', async () => {
            await productsService.getAll();
            expect(api.get).toHaveBeenCalledWith('/productos');
        });

        it('create calls api.post with correct arguments', async () => {
            const data = { name: 'Cake' };
            await productsService.create(data);
            expect(api.post).toHaveBeenCalledWith('/productos', data);
        });

        it('update calls api.patch with correct arguments', async () => {
            const id = 1;
            const data = { name: 'Updated Cake' };
            await productsService.update(id, data);
            expect(api.patch).toHaveBeenCalledWith(`/productos/${id}`, data);
        });

        it('delete calls api.delete with correct arguments', async () => {
            const id = 1;
            await productsService.delete(id);
            expect(api.delete).toHaveBeenCalledWith(`/productos/${id}`);
        });
    });

    describe('categoriesService', () => {
        it('getAll calls api.get with correct arguments', async () => {
            await categoriesService.getAll();
            expect(api.get).toHaveBeenCalledWith('/categorias');
        });

        it('create calls api.post with correct arguments', async () => {
            const data = { name: 'Pastries' };
            await categoriesService.create(data);
            expect(api.post).toHaveBeenCalledWith('/categorias', data);
        });

        it('update calls api.patch with correct arguments', async () => {
            const id = 1;
            const data = { name: 'Updated Pastries' };
            await categoriesService.update(id, data);
            expect(api.patch).toHaveBeenCalledWith(`/categorias/${id}`, data);
        });

        it('delete calls api.delete with correct arguments', async () => {
            const id = 1;
            await categoriesService.delete(id);
            expect(api.delete).toHaveBeenCalledWith(`/categorias/${id}`);
        });
    });

    describe('salesService', () => {
        it('createSale calls api.post with correct arguments', async () => {
            const data = { total: 100 };
            await salesService.createSale(data);
            expect(api.post).toHaveBeenCalledWith('/ventas', data);
        });

        it('getMyDailySummary calls api.get with correct arguments', async () => {
            await salesService.getMyDailySummary();
            expect(api.get).toHaveBeenCalledWith('/ventas/mi-caja');
        });

        it('getMySales calls api.get with correct arguments', async () => {
            await salesService.getMySales();
            expect(api.get).toHaveBeenCalledWith('/ventas/mis-ventas');
        });

        it('getAdminDailySummary calls api.get with correct arguments', async () => {
            const fecha = '2023-10-27';
            await salesService.getAdminDailySummary(fecha);
            expect(api.get).toHaveBeenCalledWith('/ventas/caja-admin', { params: { fecha } });
        });

        it('getAdminHistory calls api.get with correct arguments', async () => {
            const filters = { date: '2023-10-27' };
            await salesService.getAdminHistory(filters);
            expect(api.get).toHaveBeenCalledWith('/ventas/historial-admin', { params: filters });
        });

        it('closeDailyBox calls api.post with correct arguments', async () => {
            const data = { amount: 500 };
            await salesService.closeDailyBox(data);
            expect(api.post).toHaveBeenCalledWith('/ventas/cierre-caja', data);
        });

        it('deleteSale calls api.delete with correct arguments', async () => {
            const id = 1;
            await salesService.deleteSale(id);
            expect(api.delete).toHaveBeenCalledWith(`/ventas/${id}`);
        });

        it('updateSale calls api.patch with correct arguments', async () => {
            const id = 1;
            const data = { total: 200 };
            await salesService.updateSale(id, data);
            expect(api.patch).toHaveBeenCalledWith(`/ventas/${id}`, data);
        });
        
        it('delete calls api.delete with correct arguments', async () => {
            const id = 1;
            await salesService.delete(id);
            expect(api.delete).toHaveBeenCalledWith(`/ventas/${id}`);
        });

        it('update calls api.patch with correct arguments', async () => {
            const id = 1;
            const data = { total: 200 };
            await salesService.update(id, data);
            expect(api.patch).toHaveBeenCalledWith(`/ventas/${id}`, data);
        });
    });

    describe('usersService', () => {
        it('create calls api.post with correct arguments', async () => {
            const data = { username: 'user' };
            await usersService.create(data);
            expect(api.post).toHaveBeenCalledWith('/users', data);
        });

        it('findAll calls api.get with correct arguments', async () => {
            await usersService.findAll();
            expect(api.get).toHaveBeenCalledWith('/users');
        });

        it('update calls api.patch with correct arguments', async () => {
            const id = 1;
            const data = { username: 'updatedUser' };
            await usersService.update(id, data);
            expect(api.patch).toHaveBeenCalledWith(`/users/${id}`, data);
        });

        it('delete calls api.delete with correct arguments', async () => {
            const id = 1;
            await usersService.delete(id);
            expect(api.delete).toHaveBeenCalledWith(`/users/${id}`);
        });
    });

    describe('Helper functions', () => {
        it('getProductos calls productsService.getAll and returns data', async () => {
            const mockData = { data: ['prod1', 'prod2'] };
            api.get.mockResolvedValue(mockData);
            
            const result = await getProductos();
            expect(api.get).toHaveBeenCalledWith('/productos');
            expect(result).toEqual(mockData.data);
        });

        it('createProducto calls productsService.create and returns data', async () => {
            const mockData = { data: 'newProd' };
            const inputData = { name: 'prod' };
            api.post.mockResolvedValue(mockData);
            
            const result = await createProducto(inputData);
            expect(api.post).toHaveBeenCalledWith('/productos', inputData);
            expect(result).toEqual(mockData.data);
        });

        it('updateProducto calls productsService.update and returns data', async () => {
            const mockData = { data: 'updatedProd' };
            const id = 1;
            const inputData = { name: 'prod' };
            api.patch.mockResolvedValue(mockData);
            
            const result = await updateProducto(id, inputData);
            expect(api.patch).toHaveBeenCalledWith(`/productos/${id}`, inputData);
            expect(result).toEqual(mockData.data);
        });

        it('deleteProducto calls productsService.delete and returns data', async () => {
            const mockData = { data: 'deleted' };
            const id = 1;
            api.delete.mockResolvedValue(mockData);
            
            const result = await deleteProducto(id);
            expect(api.delete).toHaveBeenCalledWith(`/productos/${id}`);
            expect(result).toEqual(mockData.data);
        });

        it('getCategorias calls categoriesService.getAll and returns data', async () => {
            const mockData = { data: ['cat1', 'cat2'] };
            api.get.mockResolvedValue(mockData);
            
            const result = await getCategorias();
            expect(api.get).toHaveBeenCalledWith('/categorias');
            expect(result).toEqual(mockData.data);
        });
    });
});
