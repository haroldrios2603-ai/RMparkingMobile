# Matriz de Equivalencia Funcional: RM Parking Web vs. Móvil

| Módulo | Funcionalidad Web | Pantalla Móvil | Método API | Estado | Tipo de Verificación | Diferencia | Próxima Acción |
|---|---|---|---|---|---|---|---|
| Auth | Login / JWT / Perfil | `LoginScreen.tsx` | `authApi.login`, `getProfile` | Implementado y Verificado | Estática / Estructural | Ninguna | Ninguna |
| Dashboard | Aforo / Ocupación | `DashboardScreen.tsx` | `parkingApi.getResumenTickets` | Implementado y Verificado | Estática / Estructural | Ninguna | Ninguna |
| Operación | Ingreso / Salida | `EntryExitScreen.tsx` | `parkingApi.registerEntry`, `registerExit` | Implementado y Verificado | Estática / Estructural | Ninguna | Ninguna |
| Clientes | CRUD Contratos / Renovación | `ClientsScreen.tsx` | `clientsApi.*` | Implementado y Verificado | Estática / Estructural | Ninguna | Ninguna |
| Usuarios | CRUD / Estados / Archivo | `UsersScreen.tsx` | `usersApi.*` | Implementado y Verificado | Estática / Estructural | Ninguna | Ninguna |
| Reportes | KPIs / Exportación Excel/CSV | `ReportsScreen.tsx` | `reportsApi.*` | Implementado y Verificado | Estática / Estructural | Ninguna | Ninguna |
| Auditoría | Historial / Exportación CSV | `AuditScreen.tsx` | `auditApi.*` | Implementado y Verificado | Estática / Estructural | Ninguna | Ninguna |
| Configuración | Tarifas / Métodos de Pago | `SettingsScreen.tsx` | `settingsApi.*` | Implementado y Verificado | Estática / Estructural | Ninguna | Ninguna |
| Permisos | Gestión por Rol / Pantallas | N/A (Servicio API listo) | `permissionsApi.*` | Parcial | API Lista / Sin UI | Falta pantalla de administración | Desarrollar UI de permisos |
