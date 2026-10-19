import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { permissionsApi, ScreenPermissionItem } from '../api/permissions';
import { Role } from '../types';

/**
 * Pantalla de Administración de Permisos por Perfil y Roles.
 * Permite a los administradores consultar y actualizar los accesos por pantalla para cada rol.
 */
export const PermissionsScreen = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>(Role.OPERATOR);
  const [screensList, setScreensList] = useState<string[]>([]);
  const [rolePermissions, setRolePermissions] = useState<Record<string, boolean>>({});

  const fetchPermissionsData = async () => {
    try {
      setLoading(true);
      // 1. Obtener lista de pantallas protegidas del sistema
      const screens = await permissionsApi.listScreens().catch(() => [
        'operations-dashboard',
        'clients-management',
        'users-management',
        'settings-config',
        'admin-audit-logs',
        'settings-permissions-profiles',
      ]);
      const screenKeys = Array.isArray(screens) ? screens.map((s: any) => typeof s === 'string' ? s : s.key || s.screenKey) : [];
      setScreensList(screenKeys);

      // 2. Obtener permisos del rol seleccionado
      const currentPerms = await permissionsApi.getRolePermissions(selectedRole).catch(() => []);
      const permMap: Record<string, boolean> = {};
      if (Array.isArray(currentPerms)) {
        currentPerms.forEach((p: any) => {
          permMap[p.screenKey] = p.canView;
        });
      }
      setRolePermissions(permMap);
    } catch (error) {
      console.error('Error cargando permisos:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchPermissionsData();
    }, [selectedRole])
  );

  const handleTogglePermission = (screenKey: string) => {
    setRolePermissions((prev) => ({
      ...prev,
      [screenKey]: !prev[screenKey],
    }));
  };

  const handleSavePermissions = async () => {
    setSaving(true);
    try {
      // Construir arreglo UpdateScreenPermissionsDto compatible con NestJS
      const permissionsPayload: ScreenPermissionItem[] = screensList.map((screenKey) => ({
        screenKey,
        canView: !!rolePermissions[screenKey],
      }));

      await permissionsApi.updateRolePermissions(selectedRole, permissionsPayload);
      Alert.alert('Permisos Actualizados', `Se han guardado los accesos para el rol ${selectedRole}.`);
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Error guardando permisos.';
      Alert.alert('Error', Array.isArray(msg) ? msg.join('\n') : msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Administración de Permisos y Roles</Text>
      <Text style={styles.subtitle}>Configura el acceso a las pantallas operativas según el rol.</Text>

      {/* Selector de Roles */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Seleccionar Rol Objetivo</Text>
        <View style={styles.roleSelectorRow}>
          {[Role.OPERATOR, Role.ADMIN_PARKING, Role.AUDITOR, Role.SUPER_ADMIN].map((r) => (
            <TouchableOpacity
              key={r}
              style={[styles.roleTab, selectedRole === r && styles.selectedRoleTab]}
              onPress={() => setSelectedRole(r)}
            >
              <Text style={[styles.roleTabText, selectedRole === r && styles.selectedRoleTabText]}>
                {r}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Lista de Pantallas y Switches de Permisos */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Permisos de Pantallas para {selectedRole}</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#6366F1" style={{ marginVertical: 30 }} />
        ) : screensList.length === 0 ? (
          <Text style={styles.emptyText}>No hay pantallas registradas.</Text>
        ) : (
          screensList.map((screenKey) => {
            const hasAccess = !!rolePermissions[screenKey];
            return (
              <View key={screenKey} style={styles.permissionRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.screenKeyText}>{screenKey}</Text>
                  <Text style={styles.screenDescText}>
                    {hasAccess ? 'Acceso autorizado' : 'Acceso restringido'}
                  </Text>
                </View>
                <Switch
                  value={hasAccess}
                  onValueChange={() => handleTogglePermission(screenKey)}
                  trackColor={{ false: '#CBD5E1', true: '#818CF8' }}
                  thumbColor={hasAccess ? '#4F46E5' : '#F1F5F9'}
                />
              </View>
            );
          })
        )}
      </View>

      {!loading && (
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSavePermissions}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.saveButtonText}>Guardar Permisos del Rol</Text>
          )}
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 16,
    marginTop: 2,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 12,
  },
  roleSelectorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  roleTab: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#F8FAFC',
  },
  selectedRoleTab: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  roleTabText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#475569',
  },
  selectedRoleTabText: {
    color: '#FFFFFF',
  },
  permissionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  screenKeyText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
  },
  screenDescText: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  emptyText: {
    textAlign: 'center',
    color: '#94A3B8',
    marginVertical: 20,
  },
  saveButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 30,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 15,
  },
});
