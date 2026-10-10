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

export const ClientsScreen = () => {
  const [contracts, setContracts] = useState<ClientContract[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchContracts = async () => {
    try {
      const list = await clientsApi.listContracts();
      setContracts(list);
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

  const renderContractItem = ({ item }: { item: ClientContract }) => (
    <View style={styles.contractCard}>
      <View style={styles.cardHeader}>
        <Text style={styles.placaText}>{item.placa}</Text>
        <Text
          style={[
            styles.badgeState,
            item.estado === 'ACTIVO' ? styles.activeBadge : styles.expiredBadge,
          ]}
        >
          {item.estado}
        </Text>
      </View>

      <Text style={styles.clientName}>{item.client?.nombre || 'Cliente Registrado'}</Text>
      <Text style={styles.infoText}>Monto: ${item.montoMensual?.toLocaleString('es-CO')}</Text>
      <Text style={styles.dateText}>
        Vence: {new Date(item.fechaFin).toLocaleDateString('es-CO')}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Clientes y Contratos Mensuales</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#1E3A8A" style={{ marginTop: 20 }} />
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
    backgroundColor: '#F9FAFB',
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  contractCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  placaText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E3A8A',
  },
  clientName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginVertical: 4,
  },
  infoText: {
    fontSize: 14,
    color: '#4B5563',
  },
  dateText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  badgeState: {
    fontSize: 12,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  activeBadge: {
    backgroundColor: '#DCFCE7',
    color: '#166534',
  },
  expiredBadge: {
    backgroundColor: '#FEE2E2',
    color: '#991B1B',
  },
  emptyText: {
    textAlign: 'center',
    color: '#9CA3AF',
    marginTop: 30,
  },
});
