import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { permissionsApi, AppScreenItem } from '../api/permissions';
import { Role } from '../types';

/**
 * Pantalla de Control de Permisos por Pantalla y Perfil de Usuario.
 * Sincronizada con el PermissionsController de NestJS.
 */
export const PermissionsScreen = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role>(Role.OPERATOR);
  const [screens, setScreens] = useState<AppScreenItem[]>([]);
  const [permissionsState, setPermissionsState] = useState<Record<string, boolean>>({});

  const fetchPermissionsData = async () => {
    setLoading(true);
    try {
      const [screensList, rolePerms] = await Promise.all([
        permissionsApi.listScreens().catch(() => []),
        permissionsApi.getRolePermissions(selectedRole).catch(() => []),
      ]);

      setScreens(Array.isArray(screensList) ? screensList : []);

      // Mapear permisos por clave de pantalla
      const map: Record<string, boolean> = {};
      if (Array.isArray(rolePerms)) {
        rolePerms.forEach((item: any) => {
          map[item.screenKey] = Boolean(item.canView);
        });
      }
      setPermissionsState(map);
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

  const togglePermission = (screenKey: string) => {
    setPermissionsState((prev) => ({
      ...prev,
      [screenKey]: !prev[screenKey],
    }));
  };

  const handleSavePermissions = async () => {
    setSaving(true);
    try {
      const payload = Object.keys(permissionsState).map((screenKey) => ({
        screenKey,
        canView: permissionsState[screenKey],
      }));

      await permissionsApi.updateRolePermissions(selectedRole, payload);
      Alert.alert('Permisos Actualizados', `Se actualizaron los permisos para el rol ${selectedRole}.`);
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Error al guardar permisos.';
      Alert.alert('Error', Array.isArray(msg) ? msg.join('\n') : msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Permisos y Perfiles de Acceso</Text>

      {/* Selector de Rol */}
      <Text style={styles.sectionLabel}>Seleccionar Rol a Configurar:</Text>
      <View style={styles.rolePickerRow}>
        {[Role.OPERATOR, Role.ADMIN_PARKING, Role.AUDITOR].map((r) => (
          <TouchableOpacity
            key={r}
            style={[styles.roleOption, selectedRole === r && styles.selectedRoleOption]}
            onPress={() => setSelectedRole(r)}
          >
            <Text style={[styles.roleText, selectedRole === r && styles.selectedRoleText]}>
              {r}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#6366F1" style={{ marginTop: 40 }} />
      ) : (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Permisos de Pantalla para {selectedRole}</Text>

          {screens.length === 0 ? (
            <Text style={styles.emptyText}>No hay catálogo de pantallas configurado en el backend.</Text>
          ) : (
            screens.map((screen) => {
              const isAllowed = Boolean(permissionsState[screen.key]);
              return (
                <View key={screen.key} style={styles.switchRow}>
                  <View style={{ flex: 1, paddingRight: 10 }}>
                    <Text style={styles.screenName}>{screen.name || screen.key}</Text>
                    {screen.description && (
                      <Text style={styles.screenDescription}>{screen.description}</Text>
                    )}
                  </View>
                  <Switch
                    value={isAllowed}
                    onValueChange={() => togglePermission(screen.key)}
                    trackColor={{ false: '#CBD5E1', true: '#818CF8' }}
                    thumbColor={isAllowed ? '#4F46E5' : '#F1F5F9'}
                  />
                </View>
              );
            })
          )}

          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSavePermissions}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.saveButtonText}>Guardar Permisos de {selectedRole}</Text>
            )}
          </TouchableOpacity>
        </View>
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
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  rolePickerRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  roleOption: {
    flex: 1,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  selectedRoleOption: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  roleText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#475569',
  },
  selectedRoleText: {
    color: '#FFFFFF',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 30,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 14,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  screenName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  screenDescription: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  saveButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 15,
  },
  emptyText: {
    textAlign: 'center',
    color: '#94A3B8',
    marginVertical: 20,
  },
});
