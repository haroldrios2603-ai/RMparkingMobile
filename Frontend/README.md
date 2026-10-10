# RMparking Mobile (React Native / Expo)

Aplicación móvil oficial de **RMparking** desarrollada con **React Native (Expo)** y **TypeScript**, diseñada para conectarse directamente con el backend en **NestJS**.

---

## 🚀 Requisitos Previos

- **Node.js**: v18 o superior.
- **Expo Go** (Opcional): Aplicación móvil en Android / iOS para probar en dispositivos físicos.
- **Android Studio / Xcode** (Opcional): Para emuladores.

---

## 🛠️ Instalación y Configuración

1. Entra a la carpeta de la app móvil:
   ```bash
   cd mobile
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

3. Verifica la URL del Backend NestJS en `src/config/api.ts`:
   - Para **Android Emulator**: `http://10.0.2.2:3000` (valor por defecto).
   - Para **iOS Simulator**: `http://localhost:3000`.
   - Para **Dispositivo físico (Expo Go)**: Cambia a la IP local de tu PC (ej. `http://192.168.1.50:3000`).

---

## 📱 Ejecución de la Aplicación

- **Iniciar servidor de desarrollo Expo:**
  ```bash
  npm start
  ```
- **Lanzar directamente en Android Emulator:**
  ```bash
  npm run android
  ```
- **Lanzar directamente en iOS Simulator:**
  ```bash
  npm run ios
  ```

---

## 📁 Arquitectura del Módulo

- `src/api/`: Servicios cliente Axios sincronizados con los endpoints NestJS (`auth`, `parking`, `clients`, `payments`).
- `src/config/`: Configuración global y claves de almacenamiento.
- `src/context/`: `AuthContext` para el estado global de la sesión JWT.
- `src/navigation/`: Navegación con React Navigation (`AuthStack` y `BottomTabNavigator`).
- `src/screens/`:
  - `LoginScreen`: Iniciar sesión y probar conectividad.
  - `DashboardScreen`: Monitoreo en tiempo real de vehículos activos.
  - `EntryExitScreen`: Registro de ingresos/salidas y cobranza.
  - `ClientsScreen`: Gestión de clientes con mensualidades.
  - `ProfileScreen`: Perfil del usuario y cierre de sesión.
- `src/types/`: Definiciones TypeScript estrictas derivadas del backend DTO/Prisma.
