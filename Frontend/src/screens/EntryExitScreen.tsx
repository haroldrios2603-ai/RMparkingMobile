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
 * Formatea una fecha ISO a representación legible DD/MM/YYYY hh:mm A.
 */
const formatDateTime = (dateString?: string): string => {
  if (!dateString) return 'No registrada';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Fecha inválida';

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;

  return `${day}/${month}/${year} ${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
};

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
      setParkings(list || []);
      if (list && list.length > 0) {
        setSelectedParkingId(list[0].id);
      }
    } catch (error) {
      console.error('Error cargando parqueaderos:', error);
    }
  };

  const handleRegisterEntry = async () => {
    const cleanPlaca = placa.trim().toUpperCase();

    if (cleanPlaca.length !== 6) {
      Alert.alert('Restricción de Placa', 'La placa debe contener exactamente 6 caracteres alfanuméricos (ej. ABC123).');
      return;
    }

    if (!selectedParkingId) {
      Alert.alert('Sede Requerida', 'Seleccione una sede de parqueadero.');
      return;
    }

    setLoading(true);
    try {
      const result = await parkingApi.registerEntry({
        placa: cleanPlaca,
        vehicleType,
        parkingId: selectedParkingId,
      });
      const entryTimeFormatted = formatDateTime(result?.entryTime);
      Alert.alert('Ingreso Registrado', `Placa: ${cleanPlaca}\nHora de Ingreso: ${entryTimeFormatted}`);
      setPlaca('');
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Error al registrar ingreso.';
      Alert.alert('Error', Array.isArray(msg) ? msg.join('\n') : msg);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterExit = async () => {
    const cleanPlaca = placa.trim().toUpperCase();

    if (cleanPlaca.length !== 6) {
      Alert.alert('Restricción de Placa', 'La placa debe tener exactamente 6 caracteres para consultar la salida.');
      return;
    }

    setLoading(true);
    setExitResult(null);
    try {
      const res = await parkingApi.registerExit({ placa: cleanPlaca });
      setExitResult(res);
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Vehículo no encontrado en parqueadero.';
      Alert.alert('Error de Salida', Array.isArray(msg) ? msg.join('\n') : msg);
    } finally {
      setLoading(false);
    }
  };

  const handleCashPayment = async (exitId: string) => {
    setLoading(true);
    try {
      await paymentsApi.registerCashPayment(exitId);
      Alert.alert('Pago Exitoso', 'El cobro en efectivo fue procesado correctamente.');
      setExitResult(null);
      setPlaca('');
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Error procesando cobro.';
      Alert.alert('Error de Pago', Array.isArray(msg) ? msg.join('\n') : msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, tab === 'ENTRY' && styles.activeTab]}
          onPress={() => { setTab('ENTRY'); setExitResult(null); }}
        >
          <Text style={[styles.tabText, tab === 'ENTRY' && styles.activeTabText]}>Ingreso</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, tab === 'EXIT' && styles.activeTab]}
          onPress={() => { setTab('EXIT'); setExitResult(null); }}
        >
          <Text style={[styles.tabText, tab === 'EXIT' && styles.activeTabText]}>Salida</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.inputLabel}>Placa del Vehículo (Exactamente 6 Caracteres)</Text>
        <TextInput
          style={styles.placaInput}
          value={placa}
          onChangeText={(text) => setPlaca(text.toUpperCase().trim())}
          placeholder="ABC123"
          placeholderTextColor="#94A3B8"
          autoCapitalize="characters"
          maxLength={6}
        />

        {tab === 'ENTRY' ? (
          <>
            <Text style={styles.inputLabel}>Tipo de Vehículo</Text>
            <View style={styles.typeSelector}>
              {[
                { type: VehicleType.CAR, label: 'Automóvil' },
                { type: VehicleType.MOTORCYCLE, label: 'Motocicleta' },
                { type: VehicleType.VAN, label: 'Camioneta/Van' },
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
              {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.actionButtonText}>Registrar Ingreso</Text>}
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
              {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.actionButtonText}>Buscar Salida</Text>}
            </TouchableOpacity>

            {exitResult && (
              <View style={styles.exitResultBox}>
                <Text style={styles.exitTitle}>Resumen de Registro de Salida</Text>
                <Text style={styles.exitDetail}>Placa: {exitResult.ticket?.vehicle?.plate || exitResult.exit?.placa || placa}</Text>
                <Text style={styles.exitDetail}>Fecha e Ingreso: {formatDateTime(exitResult.ticket?.entryTime)}</Text>
                <Text style={styles.exitDetail}>Fecha e Salida: {formatDateTime(exitResult.exit?.exitTime)}</Text>
                <Text style={styles.exitDetail}>Tiempo Permanecido: {exitResult.exit?.durationMinutes ?? 0} minutos</Text>
                <Text style={styles.totalPrice}>Total a Cobrar: ${(exitResult.exit?.totalAmount ?? 0).toLocaleString('es-CO')}</Text>

                <TouchableOpacity
                  style={styles.payButton}
                  onPress={() => handleCashPayment(exitResult.exit?.id)}
                  disabled={loading}
                >
                  <Text style={styles.payButtonText}>Cobrar en Efectivo</Text>
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
  },
  placaInput: {
    borderWidth: 2,
    borderColor: '#6366F1',
    borderRadius: 10,
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingVertical: 12,
    letterSpacing: 4,
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
