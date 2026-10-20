import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Modal,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { clientsApi } from '../api/clients';
import { parkingApi } from '../api/parking';
import { ClientContract, Parking } from '../types';
import { DocumentType } from './UsersScreen';

/**
 * Módulo de Clientes y Contratos de Mensualidad.
 * Sincronizado con las reglas y DTOs de NestJS (CreateClientDto).
 */
export const ClientsScreen = () => {
  const [contracts, setContracts] = useState<ClientContract[]>([]);
  const [parkings, setParkings] = useState<Parking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVO' | 'VENCIDO'>('ALL');

  // Formulario de Nuevo Cliente Mensual
  const [modalVisible, setModalVisible] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [documentType, setDocumentType] = useState<DocumentType>(DocumentType.CEDULA);
  const [documentNumber, setDocumentNumber] = useState('');
  const [monthlyFee, setMonthlyFee] = useState('180000');
  const [selectedParkingId, setSelectedParkingId] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchContracts = async () => {
    try {
      const [list, parkingsList] = await Promise.all([
        clientsApi.listContracts().catch(() => []),
        parkingApi.getAllParkings().catch(() => []),
      ]);
      setContracts(Array.isArray(list) ? list : []);
      setParkings(parkingsList || []);
      if (parkingsList && parkingsList.length > 0) {
        setSelectedParkingId(parkingsList[0].id);
      }
    } catch (error) {
      console.error('Error cargando mensualidades:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filteredContracts = contracts.filter((c: any) => {
    const query = searchQuery.toLowerCase().trim();
    const nameStr = (c.user?.fullName || c.user?.email || c.client?.nombre || c.placa || '').toLowerCase();
    const matchesQuery = !query || nameStr.includes(query);

    const estado = c.estado || c.status || 'ACTIVO';
    const isActivo = estado === 'ACTIVO' || estado === 'ACTIVE';
    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'ACTIVO' && isActivo) ||
      (statusFilter === 'VENCIDO' && !isActivo);

    return matchesQuery && matchesStatus;
  });

  useFocusEffect(
    useCallback(() => {
      fetchContracts();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchContracts();
  };

  const handleCreateContract = async () => {
    if (!fullName.trim() || !email.trim() || !contactPhone.trim() || !documentNumber.trim() || !monthlyFee) {
      Alert.alert('Atención', 'Diligencia todos los campos del cliente.');
      return;
    }

    if (!selectedParkingId) {
      Alert.alert('Atención', 'Selecciona una sede de parqueadero.');
      return;
    }

    const startDate = new Date().toISOString();
    const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    setSaving(true);
    try {
      await clientsApi.createClientContract({
        fullName: fullName.trim(),
        email: email.trim(),
        contactPhone: contactPhone.trim(),
        parkingId: selectedParkingId,
        startDate,
        endDate,
        monthlyFee: parseFloat(monthlyFee) || 180000,
        documentType,
        documentNumber: documentNumber.trim(),
      });

      Alert.alert('Éxito', `Contrato mensual registrado para ${fullName}.`);
      setModalVisible(false);
      resetForm();
      fetchContracts();
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Error registrando contrato.';
      Alert.alert('Error', Array.isArray(msg) ? msg.join('\n') : msg);
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setFullName('');
    setEmail('');
    setContactPhone('');
    setDocumentNumber('');
    setMonthlyFee('180000');
  };

  // Modal de Edición de Contrato
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingContractId, setEditingContractId] = useState<string | null>(null);
  const [editMonthlyFee, setEditMonthlyFee] = useState('180000');

  const openEditModal = (contract: any) => {
    setEditingContractId(contract.id);
    setEditMonthlyFee(String(contract.montoMensual ?? contract.monthlyFee ?? 180000));
    setEditModalVisible(true);
  };

  const handleUpdateContract = async () => {
    if (!editingContractId) return;

    setSaving(true);
    try {
      await clientsApi.updateContract(editingContractId, {
        monthlyFee: parseFloat(editMonthlyFee) || 180000,
      });

      Alert.alert('Contrato Actualizado', 'El monto mensual del contrato ha sido actualizado.');
      setEditModalVisible(false);
      setEditingContractId(null);
      fetchContracts();
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Error actualizando contrato.';
      Alert.alert('Error', Array.isArray(msg) ? msg.join('\n') : msg);
    } finally {
      setSaving(false);
    }
  };

  const renderContractItem = ({ item }: { item: any }) => {
    const clientName = item.user?.fullName || item.user?.email || item.client?.nombre || 'Cliente Registrado';
    const estado = item.estado || item.status || 'ACTIVO';
    const isActivo = estado === 'ACTIVO' || estado === 'ACTIVE';

    const handleRenew = async () => {
      try {
        const currentEnd = item.fechaFin || item.endDate ? new Date(item.fechaFin || item.endDate) : new Date();
        const baseDate = currentEnd.getTime() > Date.now() ? currentEnd : new Date();
        const newEndDate = new Date(baseDate.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
        const paymentDate = new Date().toISOString();
        const monthlyFee = item.montoMensual ?? item.monthlyFee ?? 180000;

        await clientsApi.renewContract(item.id, {
          newEndDate,
          paymentDate,
          monthlyFee,
        });
        Alert.alert('Contrato Renovado', 'Se ha renovado el contrato exitosamente por 30 días.');
        fetchContracts();
      } catch (error: any) {
        Alert.alert('Error', error.response?.data?.message || 'No se pudo renovar el contrato.');
      }
    };

    const handleDelete = async () => {
      Alert.alert(
        'Confirmar Archivo',
        `¿Estás seguro de archivar el contrato de ${clientName}?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Archivar',
            style: 'destructive',
            onPress: async () => {
              try {
                await clientsApi.deleteContract(item.id);
                Alert.alert('Archivado', 'El contrato fue archivado exitosamente.');
                fetchContracts();
              } catch (error: any) {
                Alert.alert('Error', error.response?.data?.message || 'No se pudo archivar el contrato.');
              }
            },
          },
        ]
      );
    };

    const handleRestore = async () => {
      try {
        await clientsApi.restoreContract(item.id);
        Alert.alert('Restaurado', 'El contrato fue restaurado exitosamente.');
        fetchContracts();
      } catch (error: any) {
        Alert.alert('Error', error.response?.data?.message || 'No se pudo restaurar el contrato.');
      }
    };

    return (
      <View style={styles.contractCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.placaText}>{item.placa || 'MENSUAL'}</Text>
          <Text style={[styles.badgeState, isActivo ? styles.activeBadge : styles.expiredBadge]}>
            {isActivo ? 'ACTIVO' : 'VENCIDO'}
          </Text>
        </View>

        <Text style={styles.clientName}>{clientName}</Text>
        <Text style={styles.infoText}>Mensualidad: ${(item.montoMensual ?? item.monthlyFee ?? 0).toLocaleString('es-CO')}</Text>
        <Text style={styles.dateText}>
          Vence: {item.fechaFin || item.endDate ? new Date(item.fechaFin || item.endDate).toLocaleDateString('es-CO') : 'Sin fecha'}
        </Text>

        <View style={styles.cardActionsRow}>
          <TouchableOpacity style={[styles.cardActionButton, { backgroundColor: '#4F46E5' }]} onPress={() => openEditModal(item)}>
            <Text style={styles.cardActionText}>Editar</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.cardActionButton, { backgroundColor: '#10B981' }]} onPress={handleRenew}>
            <Text style={styles.cardActionText}>Renovar (1M)</Text>
          </TouchableOpacity>

          {isActivo ? (
            <TouchableOpacity style={[styles.cardActionButton, { backgroundColor: '#DC2626' }]} onPress={handleDelete}>
              <Text style={styles.cardActionText}>Archivar</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={[styles.cardActionButton, { backgroundColor: '#3B82F6' }]} onPress={handleRestore}>
              <Text style={styles.cardActionText}>Restaurar</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Clientes y Mensualidades</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
          <Text style={styles.addButtonText}>+ Nuevo Abonado</Text>
        </TouchableOpacity>
      </View>

      {/* Barra de Búsqueda y Filtros de Estado */}
      <View style={{ marginBottom: 12 }}>
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Buscar por cliente o placa..."
          placeholderTextColor="#94A3B8"
        />
        <View style={styles.filterChipRow}>
          {(['ALL', 'ACTIVO', 'VENCIDO'] as const).map((st) => (
            <TouchableOpacity
              key={st}
              style={[styles.filterChip, statusFilter === st && styles.selectedFilterChip]}
              onPress={() => setStatusFilter(st)}
            >
              <Text style={[styles.filterChipText, statusFilter === st && styles.selectedFilterChipText]}>
                {st === 'ALL' ? 'Todos' : st}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#6366F1" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={filteredContracts}
          keyExtractor={(item) => item.id}
          renderItem={renderContractItem}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No hay contratos que coincidan con los criterios de búsqueda.</Text>
          }
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}

      {/* Modal para Registrar Cliente con Contrato Mensual */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>Nuevo Cliente Abonado</Text>

              <Text style={styles.inputLabel}>Nombre Completo *</Text>
              <TextInput
                style={styles.input}
                value={fullName}
                onChangeText={setFullName}
                placeholder="Carlos Rodríguez"
              />

              <Text style={styles.inputLabel}>Correo Electrónico *</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="carlos@ejemplo.com"
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <Text style={styles.inputLabel}>Teléfono de Contacto *</Text>
              <TextInput
                style={styles.input}
                value={contactPhone}
                onChangeText={setContactPhone}
                placeholder="3109876543"
                keyboardType="phone-pad"
              />

              <Text style={styles.inputLabel}>Tipo de Documento *</Text>
              <View style={styles.pickerRow}>
                {[DocumentType.CEDULA, DocumentType.NIT, DocumentType.PASAPORTE].map((doc) => (
                  <TouchableOpacity
                    key={doc}
                    style={[styles.pickerOption, documentType === doc && styles.selectedPickerOption]}
                    onPress={() => setDocumentType(doc)}
                  >
                    <Text style={[styles.pickerText, documentType === doc && styles.selectedPickerText]}>
                      {doc}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabel}>Número de Documento *</Text>
              <TextInput
                style={styles.input}
                value={documentNumber}
                onChangeText={setDocumentNumber}
                placeholder="1098765432"
                keyboardType="numeric"
              />

              <Text style={styles.inputLabel}>Valor Mensualidad (COP) *</Text>
              <TextInput
                style={styles.input}
                value={monthlyFee}
                onChangeText={setMonthlyFee}
                keyboardType="numeric"
              />

              <View style={styles.modalActionRow}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    setModalVisible(false);
                    resetForm();
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleCreateContract}
                  disabled={saving}
                >
                  {saving ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveButtonText}>Guardar Contrato</Text>}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal para Editar Contrato Mensual */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={editModalVisible}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>Editar Contrato Mensual</Text>

              <Text style={styles.inputLabel}>Nuevo Valor Mensualidad (COP) *</Text>
              <TextInput
                style={styles.input}
                value={editMonthlyFee}
                onChangeText={setEditMonthlyFee}
                keyboardType="numeric"
              />

              <View style={styles.modalActionRow}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setEditModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleUpdateContract}
                  disabled={saving}
                >
                  {saving ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveButtonText}>Actualizar Contrato</Text>}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
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
  addButton: {
    backgroundColor: '#4F46E5',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 13,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    backgroundColor: '#FFFFFF',
    color: '#0F172A',
    marginBottom: 8,
  },
  filterChipRow: {
    flexDirection: 'row',
    gap: 6,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#E2E8F0',
  },
  selectedFilterChip: {
    backgroundColor: '#4F46E5',
  },
  filterChipText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#475569',
  },
  selectedFilterChipText: {
    color: '#FFFFFF',
  },
  contractCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  placaText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  clientName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginVertical: 4,
  },
  infoText: {
    fontSize: 13,
    color: '#64748B',
  },
  dateText: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
  },
  badgeState: {
    fontSize: 11,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  activeBadge: {
    backgroundColor: '#ECFDF5',
    color: '#059669',
  },
  expiredBadge: {
    backgroundColor: '#FEF2F2',
    color: '#991B1B',
  },
  emptyText: {
    textAlign: 'center',
    color: '#94A3B8',
    marginTop: 40,
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    maxHeight: '85%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 4,
    marginTop: 8,
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
  pickerRow: {
    flexDirection: 'row',
    gap: 6,
    marginVertical: 4,
  },
  pickerOption: {
    flex: 1,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 6,
    alignItems: 'center',
  },
  selectedPickerOption: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  pickerText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#475569',
  },
  selectedPickerText: {
    color: '#FFFFFF',
  },
  modalActionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
    gap: 12,
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  cancelButtonText: {
    color: '#475569',
    fontWeight: '600',
  },
  saveButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#4F46E5',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});
