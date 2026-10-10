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

export const EntryExitScreen = () => {
  const [tab, setTab] = useState<'ENTRY' | 'EXIT'>('ENTRY');
  const [placa, setPlaca] = useState('');
  const [vehicleType, setVehicleType] = useState<VehicleType>(VehicleType.CARRO);
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
      if (list.length > 0) {
        setSelectedParkingId(list[0].id);
      }
    } catch (error) {
      console.error('Error cargando parqueaderos:', error);
    }
  };

  const handleRegisterEntry = async () => {
    if (!placa.trim()) {
      Alert.alert('Error', 'Ingrese la placa del vehículo.');
      return;
    }
    if (!selectedParkingId) {
      Alert.alert('Error', 'Seleccione una sede de parqueadero.');
      return;
    }

    setLoading(true);
    try {
      await parkingApi.registerEntry({
        placa: placa.trim().toUpperCase(),
        vehicleType,
        parkingId: selectedParkingId,
      });
      Alert.alert('Éxito', `Ingreso registrado para placa ${placa.toUpperCase()}`);
      setPlaca('');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Error al registrar ingreso.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterExit = async () => {
    if (!placa.trim()) {
      Alert.alert('Error', 'Ingrese la placa del vehículo.');
      return;
    }

    setLoading(true);
    setExitResult(null);
    try {
      const res = await parkingApi.registerExit({ placa: placa.trim().toUpperCase() });
      setExitResult(res);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Vehículo no encontrado o ya procesado.');
    } finally {
      setLoading(false);
    }
  };

  const handleCashPayment = async (exitId: string) => {
    setLoading(true);
    try {
      await paymentsApi.registerCashPayment(exitId);
      Alert.alert('Pago Confirmado', 'El pago en efectivo se ha registrado correctamente.');
      setExitResult(null);
      setPlaca('');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Error al procesar pago.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
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
        <Text style={styles.inputLabel}>Placa del Vehículo</Text>
        <TextInput
          style={styles.placaInput}
          value={placa}
          onChangeText={(text) => setPlaca(text.toUpperCase())}
          placeholder="ABC123"
          autoCapitalize="characters"
          maxLength={7}
        />

        {tab === 'ENTRY' ? (
          <>
            <Text style={styles.inputLabel}>Tipo de Vehículo</Text>
            <View style={styles.typeSelector}>
              {[VehicleType.CARRO, VehicleType.MOTO, VehicleType.BICICLETA].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[styles.typeOption, vehicleType === type && styles.selectedTypeOption]}
                  onPress={() => setVehicleType(type)}
                >
                  <Text style={[styles.typeText, vehicleType === type && styles.selectedTypeText]}>
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleRegisterEntry}
              disabled={loading}
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
            >
              {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.actionButtonText}>Buscar / Registrar Salida</Text>}
            </TouchableOpacity>

            {exitResult && (
              <View style={styles.exitResultBox}>
                <Text style={styles.exitTitle}>Resumen de Salida</Text>
                <Text style={styles.exitDetail}>Placa: {exitResult.exit?.placa || placa}</Text>
                <Text style={styles.exitDetail}>Tiempo: {exitResult.tiempoFormateado || exitResult.minutosTotal + ' mins'}</Text>
                <Text style={styles.totalPrice}>Cobro: ${exitResult.totalACobrar?.toLocaleString('es-CO')}</Text>

                <TouchableOpacity
                  style={styles.payButton}
                  onPress={() => handleCashPayment(exitResult.exit.id)}
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
    backgroundColor: '#F3F4F6',
    padding: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#E5E7EB',
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
    backgroundColor: '#1E3A8A',
  },
  tabText: {
    fontWeight: 'bold',
    color: '#4B5563',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    elevation: 2,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  placaInput: {
    borderWidth: 2,
    borderColor: '#1E3A8A',
    borderRadius: 8,
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingVertical: 10,
    letterSpacing: 2,
    marginBottom: 20,
    backgroundColor: '#F9FAFB',
  },
  typeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  typeOption: {
    flex: 1,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 2,
  },
  selectedTypeOption: {
    backgroundColor: '#1E3A8A',
    borderColor: '#1E3A8A',
  },
  typeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#4B5563',
  },
  selectedTypeText: {
    color: '#FFFFFF',
  },
  actionButton: {
    backgroundColor: '#10B981',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  exitResultBox: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#FEF2F2',
    borderRadius: 10,
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
    color: '#374151',
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
