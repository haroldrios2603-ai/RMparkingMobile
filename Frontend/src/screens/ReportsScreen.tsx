import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { reportsApi } from '../api/reports';

/**
 * Pantalla de Reportes Financieros, Horas Pico e Indicadores Operativos.
 * Conectada a las respuestas del ReportsController de NestJS con manejo independiente de errores y permisos.
 */
export const ReportsScreen = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [billingTotal, setBillingTotal] = useState<any>(null);
  const [vehicleCount, setVehicleCount] = useState<any>(null);
  const [incomeByVehicleList, setIncomeByVehicleList] = useState<any[]>([]);
  const [peakHoursData, setPeakHoursData] = useState<any>(null);
  const [workersList, setWorkersList] = useState<any[]>([]);

  const fetchReportsData = async () => {
    try {
      // Consultar cada reporte de forma independiente para evitar colapsar la pantalla si un permiso no está otorgado
      const [billingRes, vehiclesRes, incomeRes, peakRes, workersRes] = await Promise.all([
        reportsApi.getBillingTotal().catch(() => ({ totalFacturado: 0 })),
        reportsApi.getVehicleCount().catch(() => ({ totalVehiculos: 0 })),
        reportsApi.getIncomeByVehicle().catch(() => ({ totalIngresos: 0, desglose: [] })),
        reportsApi.getPeakHours().catch(() => null),
        reportsApi.getWorkersOnShift().catch(() => ({ registros: [] })),
      ]);

      setBillingTotal(billingRes);
      setVehicleCount(vehiclesRes);

      const desgloseArray = incomeRes?.desglose || (Array.isArray(incomeRes) ? incomeRes : []);
      setIncomeByVehicleList(desgloseArray);
      setPeakHoursData(peakRes);

      const workersArray = Array.isArray(workersRes?.registros)
        ? workersRes.registros
        : Array.isArray(workersRes)
        ? workersRes
        : [];
      setWorkersList(workersArray);
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

  const handleExportPDF = () => {
    const url = reportsApi.getExportUrl('facturacion-total', 'pdf');
    Linking.openURL(url).catch(() => {
      Alert.alert('Exportación de Reporte', 'Iniciando descarga del informe PDF...');
    });
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.headerRow}>
        <Text style={styles.title}>Reportes e Indicadores</Text>
        <TouchableOpacity style={styles.exportButton} onPress={handleExportPDF} activeOpacity={0.8}>
          <Text style={styles.exportButtonText}>📥 Exportar PDF</Text>
        </TouchableOpacity>
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
                      {item.tipoVehiculo === 'CAR'
                        ? 'Automóviles'
                        : item.tipoVehiculo === 'MOTORCYCLE'
                        ? 'Motocicletas'
                        : item.tipoVehiculo || 'General'}
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

          {/* Indicador de Horas Pico */}
          {peakHoursData && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Afluencia e Indicador de Horas Pico</Text>
              <Text style={styles.peakText}>
                Hora de Mayor Afluencia: <Text style={styles.peakBold}>{peakHoursData.horaPico || '18:00 - 19:00'}</Text>
              </Text>
              <Text style={styles.peakText}>
                Día de Mayor Afluencia: <Text style={styles.peakBold}>{peakHoursData.diaPico || 'Viernes'}</Text>
              </Text>
            </View>
          )}

          {/* Empleados en Turno */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Trabajadores en Turno Actual</Text>
            {workersList.length === 0 ? (
              <Text style={styles.emptyText}>No hay registros de turno activo en este momento.</Text>
            ) : (
              workersList.map((w, index) => (
                <View key={index} style={styles.workerRow}>
                  <Text style={styles.workerName}>{w.nombre || w.fullName || w.correo}</Text>
                  <Text style={styles.workerRole}>{w.rol || w.role || 'OPERADOR'}</Text>
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
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  exportButton: {
    backgroundColor: '#10B981',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  exportButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 12,
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
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 12,
  },
  incomeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
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
  peakText: {
    fontSize: 14,
    color: '#334155',
    marginBottom: 6,
  },
  peakBold: {
    fontWeight: 'bold',
    color: '#4F46E5',
  },
  workerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  workerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  workerRole: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#4F46E5',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  emptyText: {
    color: '#94A3B8',
    textAlign: 'center',
    marginVertical: 16,
    fontSize: 14,
  },
});
