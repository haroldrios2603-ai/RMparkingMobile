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
import { parkingApi } from '../api/parking';
import { TicketSummary } from '../types';

/**
 * Pantalla de Monitoreo y Dashboard Operativo en Tiempo Real.
 * Sincronizada con la respuesta de NestJS del controlador de parqueaderos.
 */
export const DashboardScreen = () => {
  const [summary, setSummary] = useState<TicketSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSummary = async () => {
    try {
      const data = await parkingApi.getResumenTickets();
      setSummary(data);
    } catch (error: any) {
      console.error('Error cargando resumen operativo:', error);
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

  const renderActiveTicketItem = ({ item }: { item: any }) => {
    const placa = item.vehicle?.plate || item.placa || 'SIN PLACA';
    const rawType = item.vehicle?.type || item.vehicleType || 'CAR';
    const vehicleType = rawType === 'CAR' ? 'Automóvil' : rawType === 'MOTORCYCLE' ? 'Motocicleta' : 'Camioneta';
    const ticketCode = item.ticketCode ? `Ticket #${item.ticketCode}` : '';
    const entryTime = item.entryTime ? new Date(item.entryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--';

    return (
      <View style={styles.ticketCard}>
        <View style={styles.ticketHeader}>
          <View>
            <Text style={styles.placaText}>{placa}</Text>
            {ticketCode !== '' && <Text style={styles.ticketCodeText}>{ticketCode}</Text>}
          </View>
          <Text style={styles.badgeType}>{vehicleType}</Text>
        </View>
        <Text style={styles.timeText}>Hora de Ingreso: {entryTime}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.metricsContainer}>
        <View style={[styles.metricCard, { backgroundColor: '#EEF2FF', borderColor: '#6366F1' }]}>
          <Text style={[styles.metricNumber, { color: '#4F46E5' }]}>{summary?.activos?.length ?? 0}</Text>
          <Text style={styles.metricLabel}>Vehículos Activos</Text>
        </View>
        <View style={[styles.metricCard, { backgroundColor: '#ECFDF5', borderColor: '#10B981' }]}>
          <Text style={[styles.metricNumber, { color: '#059669' }]}>{summary?.cerrados?.length ?? 0}</Text>
          <Text style={styles.metricLabel}>Egresos Hoy</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Vehículos en Parqueadero</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#6366F1" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={summary?.activos || []}
          keyExtractor={(item) => item.id}
          renderItem={renderActiveTicketItem}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No hay vehículos activos en este momento.</Text>
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
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 12,
  },
  metricCard: {
    flex: 1,
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
  },
  metricNumber: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginTop: 4,
    textTransform: 'uppercase',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 12,
  },
  ticketCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  placaText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  ticketCodeText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  badgeType: {
    backgroundColor: '#EEF2FF',
    color: '#4F46E5',
    fontWeight: 'bold',
    fontSize: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  timeText: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
  },
  emptyText: {
    textAlign: 'center',
    color: '#94A3B8',
    marginTop: 30,
    fontSize: 14,
  },
});
