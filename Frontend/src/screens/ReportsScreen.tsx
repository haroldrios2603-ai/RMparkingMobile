import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { reportsApi } from '../api/reports';

export const ReportsScreen = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [billingTotal, setBillingTotal] = useState<any>(null);
  const [vehicleCount, setVehicleCount] = useState<any>(null);
  const [incomeByVehicle, setIncomeByVehicle] = useState<any[]>([]);

  const fetchReportsData = async () => {
    try {
      const [billing, vehicles, income] = await Promise.all([
        reportsApi.getBillingTotal().catch(() => ({ totalIngresos: 0 })),
        reportsApi.getVehicleCount().catch(() => ({ totalVehiculos: 0 })),
        reportsApi.getIncomeByVehicle().catch(() => []),
      ]);

      setBillingTotal(billing);
      setVehicleCount(vehicles);
      setIncomeByVehicle(Array.isArray(income) ? income : []);
    } catch (error) {
      console.error('Error cargando reportes:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchReportsData();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchReportsData();
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Text style={styles.title}>Reportes y Métricas Operativas</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#6366F1" style={{ marginTop: 40 }} />
      ) : (
        <>
          {/* Tarjetas KPI de Resumen (Estilo Web Panel Card) */}
          <View style={styles.kpiContainer}>
            <View style={[styles.kpiCard, { borderColor: '#818CF8' }]}>
              <Text style={styles.kpiLabel}>Total Recaudado Hoy</Text>
              <Text style={styles.kpiValue}>
                ${(billingTotal?.totalIngresos || 0).toLocaleString('es-CO')}
              </Text>
            </View>

            <View style={[styles.kpiCard, { borderColor: '#34D399' }]}>
              <Text style={styles.kpiLabel}>Vehículos Atendidos</Text>
              <Text style={styles.kpiValue}>{vehicleCount?.totalVehiculos || 0}</Text>
            </View>
          </View>

          {/* Desglose por Tipo de Vehículo */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Ingresos por Tipo de Vehículo</Text>

            {incomeByVehicle.length === 0 ? (
              <Text style={styles.emptyText}>No hay registros de ingresos disponibles.</Text>
            ) : (
              incomeByVehicle.map((item, index) => (
                <View key={index} style={styles.incomeRow}>
                  <Text style={styles.vehicleTypeLabel}>{item.tipoVehiculo || item.vehicleType || 'GENERAL'}</Text>
                  <Text style={styles.incomeAmount}>${(item.total || 0).toLocaleString('es-CO')}</Text>
                </View>
              ))
            )}
          </View>
        </>
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
  kpiContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 16,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  kpiLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  kpiValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0F172A',
    marginTop: 6,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 14,
  },
  incomeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  vehicleTypeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
  },
  incomeAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#10B981',
  },
  emptyText: {
    color: '#94A3B8',
    textAlign: 'center',
    marginVertical: 16,
    fontSize: 14,
  },
});
