import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { clientsApi } from '../api/clients';
import { ClientContract } from '../types';

/**
 * Pantalla de Contratos de Clientes Mensuales.
 * Conectada a las respuestas del controlador de clientes de NestJS.
 */
export const ClientsScreen = () => {
  const [contracts, setContracts] = useState<ClientContract[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchContracts = async () => {
    try {
      const list = await clientsApi.listContracts();
      setContracts(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error('Error cargando mensualidades:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchContracts();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchContracts();
  };

  const renderContractItem = ({ item }: { item: any }) => {
    const clientName = item.user?.fullName || item.user?.name || item.client?.nombre || 'Cliente Registrado';
    const estado = item.estado || item.status || 'ACTIVO';
    const isActivo = estado === 'ACTIVO' || estado === 'ACTIVE';

    return (
      <View style={styles.contractCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.placaText}>{item.placa}</Text>
          <Text style={[styles.badgeState, isActivo ? styles.activeBadge : styles.expiredBadge]}>
            {isActivo ? 'ACTIVO' : 'VENCIDO'}
          </Text>
        </View>

        <Text style={styles.clientName}>{clientName}</Text>
        <Text style={styles.infoText}>Monto Mensual: ${(item.montoMensual ?? item.monthlyFee ?? 0).toLocaleString('es-CO')}</Text>
        <Text style={styles.dateText}>
          Fecha de Vencimiento: {item.fechaFin ? new Date(item.fechaFin).toLocaleDateString('es-CO') : 'Sin fecha'}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Clientes y Contratos Mensuales</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#6366F1" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={contracts}
          keyExtractor={(item) => item.id}
          renderItem={renderContractItem}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No hay contratos de mensualidad registrados.</Text>
          }
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </View>
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
  contractCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  placaText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  clientName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginVertical: 4,
  },
  infoText: {
    fontSize: 13,
    color: '#64748B',
  },
  dateText: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
  },
  badgeState: {
    fontSize: 11,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  activeBadge: {
    backgroundColor: '#ECFDF5',
    color: '#059669',
  },
  expiredBadge: {
    backgroundColor: '#FEF2F2',
    color: '#991B1B',
  },
  emptyText: {
    textAlign: 'center',
    color: '#94A3B8',
    marginTop: 40,
    fontSize: 14,
  },
});
