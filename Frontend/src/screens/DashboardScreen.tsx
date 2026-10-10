import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { parkingApi } from '../api/parking';
import { ActiveTicket, TicketSummary } from '../types';

export const DashboardScreen = () => {
  const [summary, setSummary] = useState<TicketSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSummary = async () => {
    try {
      const data = await parkingApi.getResumenTickets();
      setSummary(data);
    } catch (error: any) {
      console.error('Error cargando resumen:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchSummary();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchSummary();
  };

  const renderActiveTicketItem = ({ item }: { item: ActiveTicket }) => (
    <View style={styles.ticketCard}>
      <View style={styles.ticketHeader}>
        <Text style={styles.placaText}>{item.placa}</Text>
        <Text style={styles.badgeType}>{item.vehicleType}</Text>
      </View>
      <Text style={styles.timeText}>
        Ingreso: {new Date(item.entryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.metricsContainer}>
        <View style={[styles.metricCard, { backgroundColor: '#E0F2FE' }]}>
          <Text style={styles.metricNumber}>{summary?.activos?.length ?? 0}</Text>
          <Text style={styles.metricLabel}>Vehículos Activos</Text>
        </View>
        <View style={[styles.metricCard, { backgroundColor: '#DCFCE7' }]}>
          <Text style={styles.metricNumber}>{summary?.cerrados?.length ?? 0}</Text>
          <Text style={styles.metricLabel}>Egresos Hoy</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Vehículos en Parqueadero</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#1E3A8A" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={summary?.activos || []}
          keyExtractor={(item) => item.id}
          renderItem={renderActiveTicketItem}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No hay vehículos registrados en este momento.</Text>
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
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  metricCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  metricNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1E3A8A',
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  ticketCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  placaText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E3A8A',
  },
  badgeType: {
    backgroundColor: '#DBEAFE',
    color: '#1E40AF',
    fontWeight: '600',
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  timeText: {
    fontSize: 14,
    color: '#6B7280',
  },
  emptyText: {
    textAlign: 'center',
    color: '#9CA3AF',
    marginTop: 30,
    fontSize: 14,
  },
});
