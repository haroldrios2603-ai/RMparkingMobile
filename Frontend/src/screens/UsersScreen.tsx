import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
  ScrollView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { usersApi } from '../api/users';
import { User, Role } from '../types';

export enum DocumentType {
  CEDULA = 'CEDULA',
  TARJETA_IDENTIDAD = 'TARJETA_IDENTIDAD',
  NIT = 'NIT',
  PASAPORTE = 'PASAPORTE',
  PEP = 'PEP',
}

/**
 * Módulo de Gestión de Usuarios Operativos y Administrativos.
 * Formulario adaptado a los requerimientos DTO de NestJS (CreateUserDto).
 */
export const UsersScreen = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Formulario Completo
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>(Role.OPERATOR);
  const [documentType, setDocumentType] = useState<DocumentType>(DocumentType.CEDULA);
  const [documentNumber, setDocumentNumber] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchUsers = async () => {
    try {
      const list = await usersApi.getUsers();
      setUsers(list || []);
    } catch (error) {
      console.error('Error cargando usuarios:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchUsers();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchUsers();
  };

  const handleCreateUser = async () => {
    if (!fullName.trim() || !email.trim() || !contactPhone.trim() || !password || !documentNumber.trim()) {
      Alert.alert('Formulario Incompleto', 'Por favor diligencia todos los campos requeridos.');
      return;
    }

    if (password.length < 8) {
      Alert.alert('Validación de Contraseña', 'La contraseña debe tener al menos 8 caracteres.');
      return;
    }

    setSaving(true);
    try {
      await usersApi.createUser({
        fullName: fullName.trim(),
        email: email.trim(),
        contactPhone: contactPhone.trim(),
        password,
        role,
        documentType,
        documentNumber: documentNumber.trim(),
      } as any);

      Alert.alert('Usuario Creado', `El usuario ${fullName} ha sido registrado exitosamente.`);
      setCreateModalVisible(false);
      resetForm();
      fetchUsers();
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Error al registrar el nuevo usuario.';
      Alert.alert('Error', Array.isArray(msg) ? msg.join('\n') : msg);
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setFullName('');
    setEmail('');
    setContactPhone('');
    setPassword('');
    setDocumentNumber('');
    setRole(Role.OPERATOR);
    setDocumentType(DocumentType.CEDULA);
  };

  const renderUserItem = ({ item }: { item: any }) => (
    <View style={styles.userCard}>
      <View style={styles.cardHeader}>
        <Text style={styles.userName}>{item.fullName || item.name || item.email}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleBadgeText}>{item.role}</Text>
        </View>
      </View>

      <Text style={styles.userEmail}>Correo: {item.email}</Text>
      <Text style={styles.userDetail}>
        Documento: {item.documentType || 'CC'} - {item.documentNumber || 'Sin registrar'}
      </Text>
      <Text style={styles.userDetail}>Teléfono: {item.contactPhone || item.phone || 'Sin registrar'}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Gestión de Usuarios</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setCreateModalVisible(true)}>
          <Text style={styles.addButtonText}>+ Crear Usuario</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#6366F1" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item.id}
          renderItem={renderUserItem}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No hay usuarios registrados.</Text>
          }
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}

      {/* Modal con Formulario Completo segun CreateUserDto */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={createModalVisible}
        onRequestClose={() => setCreateModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>Registro de Usuario</Text>

              <Text style={styles.inputLabel}>Nombre Completo *</Text>
              <TextInput
                style={styles.input}
                value={fullName}
                onChangeText={setFullName}
                placeholder="Juan Carlos Pérez"
              />

              <Text style={styles.inputLabel}>Correo Electrónico Corporativo *</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="juan.perez@rmparking.com"
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <Text style={styles.inputLabel}>Teléfono de Contacto *</Text>
              <TextInput
                style={styles.input}
                value={contactPhone}
                onChangeText={setContactPhone}
                placeholder="3001234567"
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
                placeholder="1020304050"
                keyboardType="numeric"
              />

              <Text style={styles.inputLabel}>Rol Asignado *</Text>
              <View style={styles.pickerRow}>
                {[Role.OPERATOR, Role.ADMIN_PARKING, Role.SUPER_ADMIN].map((r) => (
                  <TouchableOpacity
                    key={r}
                    style={[styles.pickerOption, role === r && styles.selectedPickerOption]}
                    onPress={() => setRole(r)}
                  >
                    <Text style={[styles.pickerText, role === r && styles.selectedPickerText]}>
                      {r}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabel}>Contraseña Temporal * (Mín. 8 caracteres)</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                secureTextEntry
              />

              <View style={styles.modalActionRow}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    setCreateModalVisible(false);
                    resetForm();
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleCreateUser}
                  disabled={saving}
                >
                  {saving ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveButtonText}>Guardar Usuario</Text>}
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
  userCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  userEmail: {
    fontSize: 13,
    color: '#475569',
    marginTop: 2,
  },
  userDetail: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  roleBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  roleBadgeText: {
    color: '#4F46E5',
    fontSize: 11,
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    color: '#94A3B8',
    marginTop: 40,
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
