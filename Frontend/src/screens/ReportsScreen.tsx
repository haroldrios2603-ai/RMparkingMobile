import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { reportsApi } from '../api/reports';

/**
 * Pantalla de Reportes Financieros y Estadísticas Operativas.
 * Conectada directamente a los contratos de respuesta del ReportsController de NestJS.
 */
export const ReportsScreen = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [billingTotal, setBillingTotal] = useState<any>(null);
  const [vehicleCount, setVehicleCount] = useState<any>(null);
  const [incomeByVehicleList, setIncomeByVehicleList] = useState<any[]>([]);

  const fetchReportsData = async () => {
    try {
      const [billingRes, vehiclesRes, incomeRes] = await Promise.all([
        reportsApi.getBillingTotal().catch(() => ({ totalFacturado: 0 })),
        reportsApi.getVehicleCount().catch(() => ({ totalVehiculos: 0 })),
        reportsApi.getIncomeByVehicle().catch(() => ({ desglose: [] })),
      ]);

      setBillingTotal(billingRes);
      setVehicleCount(vehiclesRes);

      const desgloseArray = incomeRes?.desglose || (Array.isArray(incomeRes) ? incomeRes : []);
      setIncomeByVehicleList(desgloseArray);
    } catch (error) {
      console.error('Error cargando reportes operativos:', error);
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

  const handleExport = async (format: 'excel' | 'pdf' | 'csv') => {
    setExporting(true);
    try {
      await reportsApi.exportReport({
        reportType: 'facturacion-total',
        format,
      });
      Alert.alert('Exportación Exitosa', `El reporte en formato ${format.toUpperCase()} se generó correctamente.`);
    } catch (error: any) {
      Alert.alert('Error de Exportación', error.response?.data?.message || 'No se pudo generar el archivo de reporte.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.headerRow}>
        <Text style={styles.title}>Reportes y Métricas Operativas</Text>
        <View style={styles.exportRow}>
          <TouchableOpacity
            style={styles.exportButton}
            onPress={() => handleExport('excel')}
            disabled={exporting}
          >
            <Text style={styles.exportButtonText}>📥 Excel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.exportButton, { backgroundColor: '#059669' }]}
            onPress={() => handleExport('csv')}
            disabled={exporting}
          >
            <Text style={styles.exportButtonText}>📥 CSV</Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#6366F1" style={{ marginTop: 40 }} />
      ) : (
        <>
          {/* Tarjetas KPI Replicando el Panel Web */}
          <View style={styles.kpiContainer}>
            <View style={[styles.kpiCard, { borderColor: '#818CF8' }]}>
              <Text style={styles.kpiLabel}>Total Facturado</Text>
              <Text style={styles.kpiValue}>
                ${(billingTotal?.totalFacturado ?? billingTotal?.totalIngresos ?? 0).toLocaleString('es-CO')}
              </Text>
            </View>

            <View style={[styles.kpiCard, { borderColor: '#34D399' }]}>
              <Text style={styles.kpiLabel}>Vehículos Atendidos</Text>
              <Text style={styles.kpiValue}>{vehicleCount?.totalVehiculos ?? 0}</Text>
            </View>
          </View>

          {/* Desglose por Tipo de Vehículo */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Ingresos por Tipo de Vehículo</Text>

            {incomeByVehicleList.length === 0 ? (
              <Text style={styles.emptyText}>No hay desglose de ingresos registrado para este período.</Text>
            ) : (
              incomeByVehicleList.map((item, index) => (
                <View key={index} style={styles.incomeRow}>
                  <View>
                    <Text style={styles.vehicleTypeLabel}>
                      {item.tipoVehiculo === 'CAR' ? 'Automóviles' : item.tipoVehiculo === 'MOTORCYCLE' ? 'Motocicletas' : item.tipoVehiculo || 'General'}
                    </Text>
                    {item.cantidadServicios !== undefined && (
                      <Text style={styles.vehicleServicesText}>{item.cantidadServicios} servicios realizados</Text>
                    )}
                  </View>
                  <Text style={styles.incomeAmount}>
                    ${(item.totalIngresos ?? item.total ?? 0).toLocaleString('es-CO')}
                  </Text>
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  exportRow: {
    flexDirection: 'row',
    gap: 6,
  },
  exportButton: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  exportButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0F172A',
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
    fontSize: 11,
    fontWeight: '700',
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
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  vehicleTypeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
  },
  vehicleServicesText: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  incomeAmount: {
    fontSize: 15,
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
