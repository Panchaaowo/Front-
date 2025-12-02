# 🚀 Mundo Mascota - Sistema de Gestión y Punto de Venta (POS)

Este proyecto es una aplicación web completa, diseñada para la gestión integral de una tienda de mascotas (*Pet Shop*). Incluye un robusto sistema de **Punto de Venta (POS)**, gestión detallada de inventario, administración de personal y usuarios, y un completo *dashboard* para reportes y métricas financieras, garantizando la optimización de las operaciones diarias.

El **frontend** está construido con **React** y **Material UI**, siguiendo una arquitectura de **Atomic Design** para garantizar la escalabilidad y mantenibilidad del código.

## 🔑 Credenciales de Acceso para Pruebas

Para ingresar y probar las funcionalidades con diferentes niveles de acceso:

| Rol | Usuario (Rut/ID) | Contraseña |
| :--- | :--- | :--- |
| **Administrador** | 1-9 | admin123 |
| **Vendedor** | 2-7 | vendedor123 |

---

## 🌟 Características Principales

### 🛒 Punto de Venta (POS)
- **Catálogo de Productos:** Visualización rápida de productos con filtrado por categorías y búsqueda en tiempo real.
- **Carrito de Compras:** Gestión dinámica del carrito (agregar, eliminar, modificar cantidades) con cálculo de totales instantáneo.
- **Proceso de Pago:** Soporte flexible para **múltiples medios de pago** (Efectivo, Débito, Crédito).
- **Generación de Boletas:** Vista previa y simulación de impresión de boletas electrónicas.
- **Cierre de Caja:** Funcionalidad crítica para vendedores y administradores para realizar el **cuadre diario** de efectivo.

### 📊 Panel de Administración
- **Dashboard Ejecutivo:** Métricas en tiempo real de alto valor (*Ventas del día*, *Alertas de stock*, *Productos top*).
- **Gestión de Inventario:** **CRUD** (Crear, Leer, Actualizar, Eliminar) completo de productos con validaciones robustas.
- **Gestión de Categorías:** Herramientas para la organización lógica y jerárquica de los productos.
- **Gestión de Usuarios:** Administración de roles (**Admin** / **Vendedor**) y control de accesos por permisos.
- **Historial de Ventas:** Registro detallado de transacciones con filtros avanzados por fecha y vendedor.

### 🔒 Seguridad y Arquitectura
- **Autenticación JWT:** Manejo seguro de sesiones con *tokens* JWT y *refresh* automático.
- **Rutas Protegidas:** Control de acceso estricto basado en roles para asegurar la integridad del sistema.
- **Atomic Design:** Estructura de componentes organizada en Átomos, Moléculas, Organismos y *Templates* para la modularidad del código.
- **Testing:** Cobertura de pruebas unitarias implementada con **Vitest** y **React Testing Library** para asegurar la calidad y el comportamiento correcto de los componentes.


