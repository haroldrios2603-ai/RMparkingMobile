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
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { settingsApi } from '../api/settings';

export const SettingsScreen = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [cashEnabled, setCashEnabled] = useState(true);
  const [qrEnabled, setQrEnabled] = useState(true);
  const [cardEnabled, setCardEnabled] = useState(true);

  const fetchSettings = async () => {
    try {
      const data = await settingsApi.getGeneralConfig().catch(() => null);
      if (data?.metodosPago) {
        setCashEnabled(data.metodosPago.aceptaEfectivo ?? true);
        setQrEnabled(data.metodosPago.aceptaQr ?? true);
        setCardEnabled(data.metodosPago.aceptaTarjeta ?? true);
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

  const handleSavePaymentMethods = async () => {
    setSaving(true);
    try {
      await settingsApi.updatePaymentMethods({
        aceptaEfectivo: cashEnabled,
        aceptaQr: qrEnabled,
        aceptaTarjeta: cardEnabled,
        aceptaEnLinea: qrEnabled,
      });
      Alert.alert('Configuración Guardada', 'Los métodos de pago han sido actualizados.');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Error al guardar métodos de pago.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Configuración del Parqueadero</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#6366F1" style={{ marginTop: 40 }} />
      ) : (
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
            <Text style={styles.switchLabel}>Pago Electrónico (QR / Wompi)</Text>
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

          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSavePaymentMethods}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.saveButtonText}>Guardar Métodos de Pago</Text>
            )}
          </TouchableOpacity>
        </View>
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
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 16,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  switchLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#334155',
  },
  saveButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 24,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 15,
  },
});
