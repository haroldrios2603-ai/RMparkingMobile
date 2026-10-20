import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { parkingApi } from '../api/parking';
import { TicketSummary } from '../types';

/**
 * Formatea una fecha y calcula el tiempo transcurrido en el parqueadero.
 */
const calculateTimeInfo = (entryDateString?: string) => {
  if (!entryDateString) {
    return { dateFormatted: 'Sin fecha', timeFormatted: '--:--', elapsedFormatted: '0 mins' };
  }

  const entry = new Date(entryDateString);
  if (isNaN(entry.getTime())) {
    return { dateFormatted: 'Inválida', timeFormatted: '--:--', elapsedFormatted: '0 mins' };
  }

  const day = String(entry.getDate()).padStart(2, '0');
  const month = String(entry.getMonth() + 1).padStart(2, '0');
  const year = entry.getFullYear();
  const dateFormatted = `${day}/${month}/${year}`;

  let hours = entry.getHours();
  const minutes = String(entry.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  const timeFormatted = `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;

  const now = new Date();
  const elapsedMs = Math.max(0, now.getTime() - entry.getTime());
  const elapsedTotalMins = Math.floor(elapsedMs / (1000 * 60));
  const elapsedHours = Math.floor(elapsedTotalMins / 60);
  const elapsedMins = elapsedTotalMins % 60;

  const elapsedFormatted =
    elapsedHours > 0
      ? `${elapsedHours}h ${elapsedMins}m (${elapsedTotalMins} mins)`
      : `${elapsedTotalMins} mins`;

  return { dateFormatted, timeFormatted, elapsedFormatted };
};

/**
 * Pantalla de Monitoreo y Dashboard Operativo en Tiempo Real.
 * Muestra el conteo de aforo, lista de vehículos activos, fecha, hora y tiempo permanecido.
 */
export const DashboardScreen = () => {
  const [summary, setSummary] = useState<TicketSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [plateQuery, setPlateQuery] = useState('');

  // Obtiene el resumen de aforo y vehículos activos desde el backend
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

  // Filtrado en vivo por placa de los vehículos activos estacionados
  const activeTickets = summary?.activos || [];
  const filteredActiveTickets = activeTickets.filter((item: any) => {
    const q = plateQuery.toUpperCase().trim();
    if (!q) return true;
    const p = (item.vehicle?.plate || item.placa || '').toUpperCase();
    return p.includes(q);
  });

  const renderActiveTicketItem = ({ item }: { item: any }) => {
    const placa = item.vehicle?.plate || item.placa || 'SIN PLACA';
    const rawType = item.vehicle?.type || item.vehicleType || 'CAR';
    const vehicleType = rawType === 'CAR' ? 'Automóvil' : rawType === 'MOTORCYCLE' ? 'Motocicleta' : 'Camioneta';
    const ticketCode = item.ticketCode ? `Ticket #${item.ticketCode}` : '';
    const { dateFormatted, timeFormatted, elapsedFormatted } = calculateTimeInfo(item.entryTime);

    return (
      <View style={styles.ticketCard}>
        <View style={styles.ticketHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.placaText}>{placa}</Text>
            {ticketCode !== '' && <Text style={styles.ticketCodeText}>{ticketCode}</Text>}
          </View>
          <Text style={styles.badgeType}>{vehicleType}</Text>
        </View>

        <View style={styles.timeInfoRow}>
          <Text style={styles.timeDetailText}>
            📅 <Text style={styles.timeDetailBold}>Fecha:</Text> {dateFormatted}
          </Text>
          <Text style={styles.timeDetailText}>
            ⏰ <Text style={styles.timeDetailBold}>Hora:</Text> {timeFormatted}
          </Text>
        </View>

        <View style={styles.elapsedContainer}>
          <Text style={styles.elapsedLabel}>⏱️ Tiempo Permanecido en Parqueadero:</Text>
          <Text style={styles.elapsedValueText}>{elapsedFormatted}</Text>
        </View>
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

      {/* Barra de Búsqueda Rápida por Placa */}
      <TextInput
        style={styles.searchInput}
        value={plateQuery}
        onChangeText={(text) => setPlateQuery(text.toUpperCase().trim())}
        placeholder="Buscar vehículo por placa..."
        placeholderTextColor="#94A3B8"
        autoCapitalize="characters"
      />

      {loading ? (
        <ActivityIndicator size="large" color="#6366F1" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={filteredActiveTickets}
          keyExtractor={(item) => item.id}
          renderItem={renderActiveTicketItem}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No hay vehículos activos que coincidan con la búsqueda.</Text>
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
    marginBottom: 8,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    backgroundColor: '#FFFFFF',
    color: '#0F172A',
    marginBottom: 12,
  },
  ticketCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
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
  timeInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  timeDetailText: {
    fontSize: 13,
    color: '#475569',
  },
  timeDetailBold: {
    fontWeight: '700',
    color: '#1E293B',
  },
  elapsedContainer: {
    marginTop: 8,
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  elapsedLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  elapsedValueText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4F46E5',
    marginTop: 2,
  },
  emptyText: {
    textAlign: 'center',
    color: '#94A3B8',
    marginTop: 30,
    fontSize: 14,
  },
});
