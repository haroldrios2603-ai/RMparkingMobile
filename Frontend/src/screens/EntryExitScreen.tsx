import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { parkingApi } from '../api/parking';
import { paymentsApi } from '../api/payments';
import { Parking, VehicleType } from '../types';

/**
 * Pantalla para el registro de ingresos y salidas de vehículos.
 * Sincronizada con las validaciones DTO de NestJS (@MinLength(6), VehicleType: CAR, MOTORCYCLE, VAN).
 */
export const EntryExitScreen = () => {
  const [tab, setTab] = useState<'ENTRY' | 'EXIT'>('ENTRY');
  const [placa, setPlaca] = useState('');
  const [vehicleType, setVehicleType] = useState<VehicleType>(VehicleType.CAR);
  const [parkings, setParkings] = useState<Parking[]>([]);
  const [selectedParkingId, setSelectedParkingId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [exitResult, setExitResult] = useState<any | null>(null);

  useEffect(() => {
    loadParkings();
  }, []);

  const loadParkings = async () => {
    try {
      const list = await parkingApi.getAllParkings();
      setParkings(list);
      if (list && list.length > 0) {
        setSelectedParkingId(list[0].id);
      }
    } catch (error) {
      console.error('Error cargando sedes de parqueadero:', error);
    }
  };

  const handleRegisterEntry = async () => {
    const cleanPlaca = placa.trim().toUpperCase();

    if (cleanPlaca.length !== 6) {
      Alert.alert('Validación de Placa', 'La placa debe tener exactamente 6 caracteres alfanuméricos (ej. ABC123).');
      return;
    }

    if (!selectedParkingId) {
      Alert.alert('Sede Requerida', 'Por favor selecciona una sede de parqueadero válida.');
      return;
    }

    setLoading(true);
    try {
      await parkingApi.registerEntry({
        placa: cleanPlaca,
        vehicleType,
        parkingId: selectedParkingId,
      });
      Alert.alert('Ingreso Registrado', `Vehículo con placa ${cleanPlaca} ingresado con éxito.`);
      setPlaca('');
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Error al registrar el ingreso del vehículo.';
      Alert.alert('Error de Operación', Array.isArray(msg) ? msg.join('\n') : msg);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterExit = async () => {
    const cleanPlaca = placa.trim().toUpperCase();

    if (cleanPlaca.length < 6) {
      Alert.alert('Validación de Placa', 'Ingresa una placa válida de al menos 6 caracteres.');
      return;
    }

    setLoading(true);
    setExitResult(null);
    try {
      const res = await parkingApi.registerExit({ placa: cleanPlaca });
      setExitResult(res);
    } catch (error: any) {
      const msg = error.response?.data?.message || 'No se encontró un ticket activo para esta placa.';
      Alert.alert('Error al Registrar Salida', Array.isArray(msg) ? msg.join('\n') : msg);
    } finally {
      setLoading(false);
    }
  };

  const handleCashPayment = async (exitId: string) => {
    setLoading(true);
    try {
      await paymentsApi.registerCashPayment(exitId);
      Alert.alert('Pago Confirmado', 'El cobro en efectivo ha sido registrado correctamente.');
      setExitResult(null);
      setPlaca('');
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Error al procesar el pago en efectivo.';
      Alert.alert('Error de Pago', Array.isArray(msg) ? msg.join('\n') : msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      {/* Pestañas de Ingreso / Salida */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, tab === 'ENTRY' && styles.activeTab]}
          onPress={() => { setTab('ENTRY'); setExitResult(null); }}
        >
          <Text style={[styles.tabText, tab === 'ENTRY' && styles.activeTabText]}>Ingreso de Vehículo</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, tab === 'EXIT' && styles.activeTab]}
          onPress={() => { setTab('EXIT'); setExitResult(null); }}
        >
          <Text style={[styles.tabText, tab === 'EXIT' && styles.activeTabText]}>Salida y Cobro</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.inputLabel}>Placa del Vehículo (6 Caracteres)</Text>
        <TextInput
          style={styles.placaInput}
          value={placa}
          onChangeText={(text) => setPlaca(text.toUpperCase())}
          placeholder="ABC123"
          placeholderTextColor="#94A3B8"
          autoCapitalize="characters"
          maxLength={7}
        />

        {tab === 'ENTRY' ? (
          <>
            <Text style={styles.inputLabel}>Tipo de Vehículo</Text>
            <View style={styles.typeSelector}>
              {[
                { type: VehicleType.CAR, label: 'Automóvil' },
                { type: VehicleType.MOTORCYCLE, label: 'Motocicleta' },
                { type: VehicleType.VAN, label: 'Camioneta / Van' },
              ].map((item) => (
                <TouchableOpacity
                  key={item.type}
                  style={[styles.typeOption, vehicleType === item.type && styles.selectedTypeOption]}
                  onPress={() => setVehicleType(item.type)}
                >
                  <Text style={[styles.typeText, vehicleType === item.type && styles.selectedTypeText]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleRegisterEntry}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.actionButtonText}>Registrar Ingreso</Text>}
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#DC2626' }]}
              onPress={handleRegisterExit}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.actionButtonText}>Buscar Salida</Text>}
            </TouchableOpacity>

            {exitResult && (
              <View style={styles.exitResultBox}>
                <Text style={styles.exitTitle}>Resumen de Salida</Text>
                <Text style={styles.exitDetail}>Placa: {exitResult.ticket?.vehicle?.plate || exitResult.exit?.placa || placa}</Text>
                <Text style={styles.exitDetail}>
                  Minutos Permanecidos: {exitResult.exit?.durationMinutes ?? exitResult.minutosTotal ?? 0} mins
                </Text>
                <Text style={styles.totalPrice}>
                  Total a Cobrar: ${(exitResult.exit?.totalAmount ?? exitResult.totalACobrar ?? 0).toLocaleString('es-CO')}
                </Text>

                <TouchableOpacity
                  style={styles.payButton}
                  onPress={() => handleCashPayment(exitResult.exit?.id || exitResult.id)}
                  disabled={loading}
                >
                  <Text style={styles.payButtonText}>Confirmar Cobro en Efectivo</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: 10,
    marginBottom: 16,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#4F46E5',
  },
  tabText: {
    fontWeight: 'bold',
    color: '#475569',
    fontSize: 13,
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  placaInput: {
    borderWidth: 2,
    borderColor: '#6366F1',
    borderRadius: 10,
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingVertical: 12,
    letterSpacing: 3,
    marginBottom: 20,
    backgroundColor: '#F8FAFC',
    color: '#0F172A',
  },
  typeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 6,
  },
  typeOption: {
    flex: 1,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  selectedTypeOption: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  typeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#475569',
  },
  selectedTypeText: {
    color: '#FFFFFF',
  },
  actionButton: {
    backgroundColor: '#10B981',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  exitResultBox: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  exitTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#991B1B',
    marginBottom: 8,
  },
  exitDetail: {
    fontSize: 14,
    color: '#334155',
    marginBottom: 4,
  },
  totalPrice: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#166534',
    marginVertical: 12,
  },
  payButton: {
    backgroundColor: '#166534',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  payButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});
