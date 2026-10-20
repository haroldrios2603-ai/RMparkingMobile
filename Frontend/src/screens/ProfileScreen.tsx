import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { parkingApi } from '../api/parking';

/**
 * Pantalla de Perfil de Usuario y Control de Jornada Operativa.
 * Permite al operador consultar su rol, datos personales, cerrar la jornada diaria y finalizar la sesión.
 */
export const ProfileScreen = () => {
  const { user, logout } = useAuth();
  const [closingJornada, setClosingJornada] = useState(false);

  // Maneja la solicitud de cierre de la jornada operativa diaria
  const handleCerrarJornada = async () => {
    Alert.alert(
      'Cierre de Jornada Operativa',
      '¿Deseas realizar el cierre diario de la jornada? Esta acción archivará las salidas registradas en el día.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar Cierre',
          onPress: async () => {
            setClosingJornada(true);
            try {
              const res = await parkingApi.cerrarJornada();
              Alert.alert(
                'Jornada Cerrada Exitosamente',
                `Fecha de Cierre: ${res?.fechaCierre ? new Date(res.fechaCierre).toLocaleDateString('es-CO') : 'Hoy'}\nVehículos Activos Pendientes: ${res?.activosPendientes ?? 0}\nSalidas Archivadas: ${res?.salidasArchivadas ?? 0}`
              );
            } catch (error: any) {
              const msg = error.response?.data?.message || 'Error al ejecutar el cierre de jornada.';
              Alert.alert('Error', Array.isArray(msg) ? msg.join('\n') : msg);
            } finally {
              setClosingJornada(false);
            }
          },
        },
      ]
    );
  };

  // Maneja el cierre de sesión de la aplicación
  const handleLogout = () => {
    Alert.alert('Cerrar Sesión', '¿Estás seguro que deseas cerrar la sesión?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Cerrar Sesión', style: 'destructive', onPress: () => logout() },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.name?.charAt(0).toUpperCase() || 'U'}</Text>
        </View>

        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.email}>{user?.email}</Text>

        <View style={styles.badgeRole}>
          <Text style={styles.roleText}>{user?.role || 'OPERADOR'}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Documento:</Text>
          <Text style={styles.infoValue}>{user?.documentNumber || 'Sin registrar'}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Teléfono:</Text>
          <Text style={styles.infoValue}>{user?.phone || 'Sin registrar'}</Text>
        </View>

        {/* Botón para Cierre de Jornada Operativa */}
        <TouchableOpacity
          style={styles.closeJornadaButton}
          onPress={handleCerrarJornada}
          disabled={closingJornada}
        >
          {closingJornada ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.closeJornadaText}>Ejecutar Cierre de Jornada Operativa</Text>
          )}
        </TouchableOpacity>

        {/* Botón para Cerrar Sesión */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  email: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 2,
  },
  badgeRole: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  roleText: {
    color: '#4F46E5',
    fontWeight: 'bold',
    fontSize: 12,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: '#64748B',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  closeJornadaButton: {
    marginTop: 20,
    backgroundColor: '#10B981',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  closeJornadaText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  logoutButton: {
    marginTop: 12,
    backgroundColor: '#DC2626',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  logoutText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
