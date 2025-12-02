# ?? Mundo Mascota - Sistema de Gestión y Punto de Venta

Este proyecto es una aplicación web completa para la gestión de una tienda de mascotas ('Pet Shop'). Incluye un sistema de Punto de Venta (POS), gestión de inventario, administración de usuarios, reportes financieros y un panel de control administrativo.

El frontend está construido con **React** y **Material UI**, siguiendo una arquitectura de **Atomic Design** para garantizar la escalabilidad y mantenibilidad del código.

## ?? Características Principales

### ?? Punto de Venta (POS)
- **Catálogo de Productos:** Visualización de productos con filtrado por categorías y búsqueda en tiempo real.
- **Carrito de Compras:** Gestión dinámica del carrito (agregar, eliminar, modificar cantidades).
- **Proceso de Pago:** Soporte para múltiples medios de pago (Efectivo, Débito, Crédito).
- **Generación de Boletas:** Vista previa y simulación de impresión de boletas electrónicas.
- **Cierre de Caja:** Funcionalidad para vendedores y administradores para realizar el cuadre diario de efectivo.

### ??? Panel de Administración
- **Dashboard Ejecutivo:** Métricas en tiempo real (Ventas del día, Alertas de stock, Productos top).
- **Gestión de Inventario:** CRUD completo de productos con validaciones.
- **Gestión de Categorías:** Organización de productos.
- **Gestión de Usuarios:** Administración de roles (Admin/Vendedor) y accesos.
- **Historial de Ventas:** Registro detallado de transacciones con filtros por fecha y vendedor.

### ?? Seguridad y Arquitectura
- **Autenticación JWT:** Manejo seguro de sesiones con tokens y refresh automático.
- **Rutas Protegidas:** Control de acceso basado en roles.
- **Atomic Design:** Estructura de componentes organizada en Átomos, Moléculas, Organismos y Templates.
- **Testing:** Cobertura de pruebas unitarias con Vitest y React Testing Library.

## ??? Tecnologías Utilizadas

- **Core:** [React 19](https://react.dev/), [Vite](https://vitejs.dev/)
- **UI Framework:** [Material UI (MUI) v6](https://mui.com/)
- **Enrutamiento:** [React Router v6](https://reactrouter.com/)
- **Estado & API:** Context API, [Axios](https://axios-http.com/)
- **Alertas:** [SweetAlert2](https://sweetalert2.github.io/)
- **Testing:** [Vitest](https://vitest.dev/), [React Testing Library](https://testing-library.com/)

## ?? Estructura del Proyecto (Atomic Design)

El proyecto sigue una estructura modular:

`src/
+-- api/            # Configuración de Axios y servicios
+-- components/     # Componentes UI
¦   +-- atoms/      # Botones, Chips, Inputs básicos
¦   +-- molecules/  # Tarjetas de estadísticas, Items de lista
¦   +-- organisms/  # Sidebar, Tablas complejas, Formularios
¦   +-- templates/  # Layouts de página (AdminLayout)
+-- context/        # AuthContext, CartContext
+-- pages/          # Vistas principales (Login, Home, Inventory, etc.)
+-- theme/          # Configuración de tema MUI
` 

## ?? Instalación y Ejecución

1.  **Clonar el repositorio:**
    `ash
    git clone https://github.com/tu-usuario/mundo-mascota-frontend.git
    cd mundo-mascota-frontend
    ` 

2.  **Instalar dependencias:**
    `ash
    npm install
    ` 

3.  **Ejecutar en desarrollo:**
    `ash
    npm run dev
    ` 
    La aplicación estará disponible en http://localhost:5173.

4.  **Ejecutar Pruebas:**
    `ash
    npm test
    ` 

## ?? Estado de las Pruebas

El proyecto cuenta con una suite de pruebas robusta que verifica la integridad de los componentes y la lógica de negocio.

- **Cobertura:** Componentes atómicos, navegación, protección de rutas y lógica de renderizado.
- **Ejecución:** 
pm test corre todos los tests en modo watch.

## ?? Notas Adicionales

- El sistema está diseñado para conectarse a una API RESTful en el backend (configurada en src/api/axiosConfig.js).
- Asegúrese de tener el backend en ejecución para la funcionalidad completa (Login, CRUD).

---
Desarrollado por [Tu Nombre] - 2025
