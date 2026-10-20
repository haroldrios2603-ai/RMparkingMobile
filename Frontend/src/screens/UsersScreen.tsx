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
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('ALL');

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
      const filters: any = {};
      if (selectedRoleFilter !== 'ALL') {
        filters.role = selectedRoleFilter;
      }
      const list = await usersApi.getUsers(filters);
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
    }, [selectedRoleFilter])
  );

  const filteredUsers = users.filter((u: any) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    const nameStr = (u.fullName || u.name || '').toLowerCase();
    const emailStr = (u.email || '').toLowerCase();
    return nameStr.includes(query) || emailStr.includes(query);
  });

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

  // Formulario de Edición
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editFullName, setEditFullName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editContactPhone, setEditContactPhone] = useState('');
  const [editRole, setEditRole] = useState<Role>(Role.OPERATOR);

  const openEditModal = (user: any) => {
    setEditingUserId(user.id);
    setEditFullName(user.fullName || user.name || '');
    setEditEmail(user.email || '');
    setEditContactPhone(user.contactPhone || user.phone || '');
    setEditRole(user.role || Role.OPERATOR);
    setEditModalVisible(true);
  };

  const handleUpdateUser = async () => {
    if (!editingUserId || !editFullName.trim() || !editEmail.trim()) {
      Alert.alert('Campos Incompletos', 'Nombre y correo electrónico son requeridos.');
      return;
    }

    setSaving(true);
    try {
      await usersApi.updateUser(editingUserId, {
        fullName: editFullName.trim(),
        email: editEmail.trim(),
        contactPhone: editContactPhone.trim(),
        role: editRole,
      });

      Alert.alert('Usuario Actualizado', 'Los datos del usuario han sido guardados correctamente.');
      setEditModalVisible(false);
      setEditingUserId(null);
      fetchUsers();
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Error al actualizar usuario.';
      Alert.alert('Error', Array.isArray(msg) ? msg.join('\n') : msg);
    } finally {
      setSaving(false);
    }
  };

  const renderUserItem = ({ item }: { item: any }) => {
    const isActive = item.isActive !== false;

    const handleToggleStatus = async () => {
      try {
        await usersApi.updateUserStatus(item.id, !isActive);
        Alert.alert('Estado Actualizado', `El usuario ahora está ${!isActive ? 'ACTIVO' : 'INACTIVO'}.`);
        fetchUsers();
      } catch (error: any) {
        Alert.alert('Error', error.response?.data?.message || 'No se pudo cambiar el estado.');
      }
    };

    const handleDelete = async () => {
      Alert.alert(
        'Confirmar Archivo',
        `¿Estás seguro de archivar al usuario ${item.fullName || item.email}?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Archivar',
            style: 'destructive',
            onPress: async () => {
              try {
                await usersApi.deleteUser(item.id);
                Alert.alert('Archivado', 'El usuario ha sido archivado correctamente.');
                fetchUsers();
              } catch (error: any) {
                Alert.alert('Error', error.response?.data?.message || 'No se pudo archivar el usuario.');
              }
            },
          },
        ]
      );
    };

    const handleRestore = async () => {
      try {
        await usersApi.restoreUser(item.id);
        Alert.alert('Restaurado', 'El usuario ha sido restaurado exitosamente.');
        fetchUsers();
      } catch (error: any) {
        Alert.alert('Error', error.response?.data?.message || 'No se pudo restaurar el usuario.');
      }
    };

    return (
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
        <Text style={[styles.userDetail, { color: isActive ? '#059669' : '#DC2626', fontWeight: 'bold' }]}>
          Estado: {isActive ? 'ACTIVO' : 'INACTIVO / ARCHIVADO'}
        </Text>

        <View style={styles.cardActionsRow}>
          <TouchableOpacity style={[styles.cardActionButton, { backgroundColor: '#4F46E5' }]} onPress={() => openEditModal(item)}>
            <Text style={styles.cardActionText}>Editar</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.cardActionButton, { backgroundColor: isActive ? '#F59E0B' : '#10B981' }]} onPress={handleToggleStatus}>
            <Text style={styles.cardActionText}>{isActive ? 'Inactivar' : 'Activar'}</Text>
          </TouchableOpacity>

          {isActive ? (
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
        <Text style={styles.title}>Gestión de Usuarios</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setCreateModalVisible(true)}>
          <Text style={styles.addButtonText}>+ Crear Usuario</Text>
        </TouchableOpacity>
      </View>

      {/* Barra de Búsqueda y Filtro por Rol */}
      <View style={{ marginBottom: 12 }}>
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Buscar por nombre o correo..."
          placeholderTextColor="#94A3B8"
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
          <View style={styles.filterChipRow}>
            {['ALL', Role.OPERATOR, Role.ADMIN_PARKING, Role.SUPER_ADMIN, Role.AUDITOR].map((r) => (
              <TouchableOpacity
                key={r}
                style={[styles.filterChip, selectedRoleFilter === r && styles.selectedFilterChip]}
                onPress={() => setSelectedRoleFilter(r)}
              >
                <Text style={[styles.filterChipText, selectedRoleFilter === r && styles.selectedFilterChipText]}>
                  {r === 'ALL' ? 'Todos' : r}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#6366F1" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filteredUsers}
          keyExtractor={(item) => item.id}
          renderItem={renderUserItem}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No hay usuarios que coincidan con la búsqueda.</Text>
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

      {/* Modal de Edición de Usuario */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={editModalVisible}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>Editar Información de Usuario</Text>

              <Text style={styles.inputLabel}>Nombre Completo *</Text>
              <TextInput
                style={styles.input}
                value={editFullName}
                onChangeText={setEditFullName}
              />

              <Text style={styles.inputLabel}>Correo Electrónico *</Text>
              <TextInput
                style={styles.input}
                value={editEmail}
                onChangeText={setEditEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <Text style={styles.inputLabel}>Teléfono de Contacto</Text>
              <TextInput
                style={styles.input}
                value={editContactPhone}
                onChangeText={setEditContactPhone}
                keyboardType="phone-pad"
              />

              <Text style={styles.inputLabel}>Rol Asignado *</Text>
              <View style={styles.pickerRow}>
                {[Role.OPERATOR, Role.ADMIN_PARKING, Role.SUPER_ADMIN].map((r) => (
                  <TouchableOpacity
                    key={r}
                    style={[styles.pickerOption, editRole === r && styles.selectedPickerOption]}
                    onPress={() => setEditRole(r)}
                  >
                    <Text style={[styles.pickerText, editRole === r && styles.selectedPickerText]}>
                      {r}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.modalActionRow}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setEditModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleUpdateUser}
                  disabled={saving}
                >
                  {saving ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveButtonText}>Actualizar Usuario</Text>}
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
