import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('axiosConfig', () => {
    let mocks;
    let api;
    let localStorageMock;

    beforeEach(async () => {
        vi.resetModules();
        
        const use = vi.fn();
        const create = vi.fn(() => ({
            interceptors: {
                request: {
                    use: use
                }
            }
        }));
        
        mocks = { use, create };

        // Mock axios using doMock to ensure it applies to the dynamic import
        vi.doMock('axios', () => ({
            default: {
                create: create
            }
        }));

        // Mock localStorage
        let store = {};
        localStorageMock = {
            getItem: vi.fn((key) => store[key] || null),
            setItem: vi.fn((key, value) => { store[key] = value.toString(); }),
            removeItem: vi.fn((key) => { delete store[key]; }),
            clear: vi.fn(() => { store = {}; })
        };
        
        Object.defineProperty(window, 'localStorage', {
            value: localStorageMock,
            writable: true
        });

        // Import the module under test dynamically
        const module = await import('./axiosConfig');
        api = module.default;
    });

    it('creates axios instance with correct config', () => {
        expect(mocks.create).toHaveBeenCalledWith({
            baseURL: 'http://localhost:3006/api/v1',
            headers: { 'Content-Type': 'application/json' },
        });
    });

    it('registers a request interceptor', () => {
        expect(mocks.use).toHaveBeenCalled();
    });

    describe('request interceptor logic', () => {
        let requestInterceptor;
        let errorInterceptor;

        beforeEach(() => {
            if (mocks.use.mock.calls.length > 0) {
                const calls = mocks.use.mock.calls;
                requestInterceptor = calls[0][0];
                errorInterceptor = calls[0][1];
            }
        });

        it('adds Authorization header if token exists in localStorage', () => {
            localStorageMock.getItem.mockReturnValue('fake-jwt-token');
            
            const config = { headers: {} };
            expect(requestInterceptor).toBeDefined();
            
            const result = requestInterceptor(config);

            expect(localStorageMock.getItem).toHaveBeenCalledWith('token');
            expect(result.headers['Authorization']).toBe('Bearer fake-jwt-token');
        });

        it('does not modify headers if token does not exist', () => {
            localStorageMock.getItem.mockReturnValue(null);
            
            const config = { headers: {} };
            expect(requestInterceptor).toBeDefined();

            const result = requestInterceptor(config);

            expect(localStorageMock.getItem).toHaveBeenCalledWith('token');
            expect(result.headers['Authorization']).toBeUndefined();
        });

        it('preserves existing headers', () => {
            localStorageMock.getItem.mockReturnValue('fake-jwt-token');
            
            const config = { headers: { 'Custom-Header': 'value' } };
            expect(requestInterceptor).toBeDefined();

            const result = requestInterceptor(config);

            expect(result.headers['Custom-Header']).toBe('value');
            expect(result.headers['Authorization']).toBe('Bearer fake-jwt-token');
        });

        it('handles request errors', async () => {
            const error = new Error('Request failed');
            expect(errorInterceptor).toBeDefined();
            await expect(errorInterceptor(error)).rejects.toThrow('Request failed');
        });
    });
});
