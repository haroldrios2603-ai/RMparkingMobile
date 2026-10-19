import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { settingsApi } from '../api/settings';
import { parkingApi } from '../api/parking';

/**
 * Pantalla de Configuración Completa del Parqueadero.
 * Sincronizada con UpdateGeneralConfigDto y UpdateTarifasDto de NestJS.
 */
export const SettingsScreen = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Parámetros Generales
  const [capacity, setCapacity] = useState('50');
  const [courtesyMinutes, setCourtesyMinutes] = useState('15');

  // Métodos de Pago
  const [cashEnabled, setCashEnabled] = useState(true);
  const [qrEnabled, setQrEnabled] = useState(true);
  const [cardEnabled, setCardEnabled] = useState(true);

  // Tarifas por Tipo de Vehículo
  const [selectedParkingId, setSelectedParkingId] = useState('');
  const [carBaseRate, setCarBaseRate] = useState('2000');
  const [carHourlyRate, setCarHourlyRate] = useState('2000');
  const [motoBaseRate, setMotoBaseRate] = useState('1000');
  const [motoHourlyRate, setMotoHourlyRate] = useState('1000');

  const fetchSettings = async () => {
    try {
      const [configData, parkingsList] = await Promise.all([
        settingsApi.getGeneralConfig().catch(() => null),
        parkingApi.getAllParkings().catch(() => []),
      ]);

      // El backend devuelve { configuracion, sedes, tarifas }
      const actualConfig = configData?.configuracion || configData;
      if (actualConfig) {
        if (actualConfig.capacidadTotal !== undefined) setCapacity(String(actualConfig.capacidadTotal));
        if (actualConfig.minutosCortesia !== undefined) setCourtesyMinutes(String(actualConfig.minutosCortesia));
        if (actualConfig.metodosPago) {
          setCashEnabled(actualConfig.metodosPago.aceptaEfectivo ?? true);
          setQrEnabled(actualConfig.metodosPago.aceptaQr ?? true);
          setCardEnabled(actualConfig.metodosPago.aceptaTarjeta ?? true);
        }
      }

      if (parkingsList && parkingsList.length > 0) {
        setSelectedParkingId(parkingsList[0].id);
      }
    } catch (error) {
      console.error('Error cargando configuración:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchSettings();
    }, [])
  );

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      // 1. Guardar Configuración General (Capacidad y Minutos de Cortesía)
      await settingsApi.updateGeneralConfig({
        capacidadTotal: parseInt(capacity, 10) || 50,
        minutosCortesia: parseInt(courtesyMinutes, 10) || 15,
      });

      // 2. Guardar Métodos de Pago
      await settingsApi.updatePaymentMethods({
        aceptaEfectivo: cashEnabled,
        aceptaQr: qrEnabled,
        aceptaTarjeta: cardEnabled,
        aceptaEnLinea: qrEnabled,
      });

      // 3. Guardar Tarifas si hay sede seleccionada
      if (selectedParkingId) {
        await settingsApi.updateTariffs(selectedParkingId, [
          {
            tipoVehiculo: 'CAR',
            tarifaBase: parseFloat(carBaseRate) || 2000,
            tarifaHora: parseFloat(carHourlyRate) || 2000,
          },
          {
            tipoVehiculo: 'MOTORCYCLE',
            tarifaBase: parseFloat(motoBaseRate) || 1000,
            tarifaHora: parseFloat(motoHourlyRate) || 1000,
          },
        ]);
      }

      Alert.alert('Configuración Guardada', 'Todos los parámetros del parqueadero han sido actualizados y persistidos.');
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Error al guardar configuración.';
      Alert.alert('Error', Array.isArray(msg) ? msg.join('\n') : msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Configuración del Sistema</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#6366F1" style={{ marginTop: 40 }} />
      ) : (
        <>
          {/* Métodos de Pago */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Métodos de Pago Habilitados</Text>

            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Pago en Efectivo</Text>
              <Switch
                value={cashEnabled}
                onValueChange={setCashEnabled}
                trackColor={{ false: '#CBD5E1', true: '#818CF8' }}
                thumbColor={cashEnabled ? '#4F46E5' : '#F1F5F9'}
              />
            </View>

            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Pago Electrónico QR (Wompi / Nequi)</Text>
              <Switch
                value={qrEnabled}
                onValueChange={setQrEnabled}
                trackColor={{ false: '#CBD5E1', true: '#818CF8' }}
                thumbColor={qrEnabled ? '#4F46E5' : '#F1F5F9'}
              />
            </View>

            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Cobro con Tarjeta</Text>
              <Switch
                value={cardEnabled}
                onValueChange={setCardEnabled}
                trackColor={{ false: '#CBD5E1', true: '#818CF8' }}
                thumbColor={cardEnabled ? '#4F46E5' : '#F1F5F9'}
              />
            </View>
          </View>

          {/* Tarifas de Parqueadero */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Tarifas por Tipo de Vehículo</Text>

            <Text style={styles.subSectionTitle}>Automóvil (CAR)</Text>
            <View style={styles.inputRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Tarifa Base (COP)</Text>
                <TextInput
                  style={styles.input}
                  value={carBaseRate}
                  onChangeText={setCarBaseRate}
                  keyboardType="numeric"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Tarifa por Hora (COP)</Text>
                <TextInput
                  style={styles.input}
                  value={carHourlyRate}
                  onChangeText={setCarHourlyRate}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <Text style={[styles.subSectionTitle, { marginTop: 14 }]}>Motocicleta (MOTORCYCLE)</Text>
            <View style={styles.inputRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Tarifa Base (COP)</Text>
                <TextInput
                  style={styles.input}
                  value={motoBaseRate}
                  onChangeText={setMotoBaseRate}
                  keyboardType="numeric"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Tarifa por Hora (COP)</Text>
                <TextInput
                  style={styles.input}
                  value={motoHourlyRate}
                  onChangeText={setMotoHourlyRate}
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>

          {/* Parámetros Operativos */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Parámetros de Operación</Text>

            <View style={styles.inputRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Capacidad Total</Text>
                <TextInput
                  style={styles.input}
                  value={capacity}
                  onChangeText={setCapacity}
                  keyboardType="numeric"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Minutos de Cortesía</Text>
                <TextInput
                  style={styles.input}
                  value={courtesyMinutes}
                  onChangeText={setCourtesyMinutes}
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSaveSettings}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.saveButtonText}>Guardar Configuración General</Text>
            )}
          </TouchableOpacity>
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
    marginBottom: 14,
  },
  subSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4F46E5',
    marginBottom: 6,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  switchLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  input: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    backgroundColor: '#F8FAFC',
  },
  saveButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 30,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 15,
  },
});
