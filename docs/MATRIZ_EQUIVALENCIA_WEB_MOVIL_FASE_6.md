# Matriz de Equivalencia Funcional (Sexta Fase): RM Parking Web vs. Móvil

| Módulo | Funcionalidad Web | Pantalla Móvil | Método API | Estado | Tipo de Verificación | Diferencia | Próxima Acción |
|---|---|---|---|---|---|---|---|
| Auth | Login / JWT / Perfil | `LoginScreen.tsx` | `authApi.login` | Implementado y Verificado | Estática / DTO | Ninguna | Ninguna |
| Dashboard | Aforo / Ocupación | `DashboardScreen.tsx` | `parkingApi.getResumenTickets` | Implementado y Verificado | Estática / DTO | Ninguna | Ninguna |
| Operación | Ingreso / Salida | `EntryExitScreen.tsx` | `parkingApi.registerEntry` | Implementado y Verificado | Estática / DTO | Ninguna | Ninguna |
| Clientes | CRUD / Renovación DTO | `ClientsScreen.tsx` | `clientsApi.*` | Implementado y Verificado | Estática / DTO | Ninguna | Ninguna |
| Usuarios | CRUD / Estados / Archivo | `UsersScreen.tsx` | `usersApi.*` | Implementado y Verificado | Estática / DTO | Ninguna | Ninguna |
| Reportes | KPIs / Período / Exportación | `ReportsScreen.tsx` | `reportsApi.*` | Implementado y Verificado | Estática / DTO | Ninguna | Ninguna |
| Auditoría | Historial / Timestamp / Export | `AuditScreen.tsx` | `auditApi.*` | Implementado y Verificado | Estática / DTO | Ninguna | Ninguna |
| Configuración | General / Tarifas / Pagos | `SettingsScreen.tsx` | `settingsApi.*` | Implementado y Verificado | Estática / DTO | Ninguna | Ninguna |
| Permisos | DTO ScreenPermissionItem | N/A | `permissionsApi.*` | Parcial | API Lista / Sin UI | Falta pantalla visual | Desarrollar UI |
