import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { auditApi, AuditLogItem } from '../api/audit';

/**
 * Pantalla de Trazabilidad e Historial de Auditoría.
 * Incluye filtros por operación y modal de inspección de cambios anteriores y nuevos.
 */
export const AuditScreen = () => {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedOperation, setSelectedOperation] = useState<string>('TODOS');

  // Modal de Detalle
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);

  const fetchLogs = async () => {
    try {
      const filters = selectedOperation !== 'TODOS' ? { operation: selectedOperation } : undefined;
      const list = await auditApi.getAuditLogs(filters);
      setLogs(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error('Error cargando auditoría:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchLogs();
    }, [selectedOperation])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchLogs();
  };

  const handleOpenDetail = async (item: AuditLogItem) => {
    setSelectedLog(item);
    setDetailModalVisible(true);
    try {
      const fullLog = await auditApi.getAuditLogById(item.id);
      if (fullLog) setSelectedLog(fullLog);
    } catch {
      // Mantenemos el ítem inicial si falla la consulta del ID
    }
  };

  const renderAuditItem = ({ item }: { item: AuditLogItem }) => (
    <TouchableOpacity
      style={styles.logCard}
      onPress={() => handleOpenDetail(item)}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.operationBadge}>{item.operation}</Text>
        <Text style={styles.dateText}>
          {new Date(item.createdAt).toLocaleDateString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
      <Text style={styles.entityText}>Módulo: {item.entity}</Text>
      {item.userEmail && <Text style={styles.userText}>Usuario: {item.userEmail}</Text>}
    </TouchableOpacity>
  );

  const [exporting, setExporting] = useState(false);

  // Maneja la exportación del historial de auditoría en formato CSV
  const handleExportCSV = async () => {
    setExporting(true);
    try {
      await auditApi.exportLogs({ format: 'csv' });
      Alert.alert('Exportación Exitosa', 'El historial de auditoría ha sido exportado en formato CSV.');
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Error al exportar auditoría.';
      Alert.alert('Error', Array.isArray(msg) ? msg.join('\n') : msg);
    } finally {
      setExporting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Historial de Auditoría</Text>
        <TouchableOpacity
          style={styles.exportButton}
          onPress={handleExportCSV}
          disabled={exporting}
          activeOpacity={0.8}
        >
          {exporting ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.exportButtonText}>📥 Exportar CSV</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Selector de Filtros de Operación */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScrollView}>
        {['TODOS', 'LOGIN', 'CREATE', 'UPDATE', 'DELETE', 'EXPORT'].map((op) => (
          <TouchableOpacity
            key={op}
            style={[styles.filterChip, selectedOperation === op && styles.selectedFilterChip]}
            onPress={() => setSelectedOperation(op)}
          >
            <Text style={[styles.filterChipText, selectedOperation === op && styles.selectedFilterChipText]}>
              {op}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? (
        <ActivityIndicator size="large" color="#6366F1" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={logs}
          keyExtractor={(item) => item.id}
          renderItem={renderAuditItem}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No hay registros de auditoría para el filtro seleccionado.</Text>
          }
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}

      {/* Modal de Inspección de Cambios Anteriores y Nuevos */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={detailModalVisible}
        onRequestClose={() => setDetailModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>Detalle del Registro de Auditoría</Text>

              {selectedLog && (
                <>
                  <Text style={styles.detailLabel}>Operación: <Text style={styles.detailValue}>{selectedLog.operation}</Text></Text>
                  <Text style={styles.detailLabel}>Entidad: <Text style={styles.detailValue}>{selectedLog.entity}</Text></Text>
                  <Text style={styles.detailLabel}>Usuario: <Text style={styles.detailValue}>{selectedLog.userEmail || 'Sistema'}</Text></Text>
                  <Text style={styles.detailLabel}>Fecha: <Text style={styles.detailValue}>{new Date(selectedLog.createdAt).toLocaleString()}</Text></Text>

                  {selectedLog.previousValues && (
                    <View style={styles.jsonBox}>
                      <Text style={styles.jsonTitle}>Valores Anteriores:</Text>
                      <Text style={styles.jsonText}>{JSON.stringify(selectedLog.previousValues, null, 2)}</Text>
                    </View>
                  )}

                  {selectedLog.newValues && (
                    <View style={styles.jsonBox}>
                      <Text style={styles.jsonTitle}>Valores Nuevos:</Text>
                      <Text style={styles.jsonText}>{JSON.stringify(selectedLog.newValues, null, 2)}</Text>
                    </View>
                  )}
                </>
              )}

              <TouchableOpacity
                style={styles.closeModalButton}
                onPress={() => setDetailModalVisible(false)}
              >
                <Text style={styles.closeModalButtonText}>Cerrar Inspección</Text>
              </TouchableOpacity>
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
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  exportButton: {
    backgroundColor: '#10B981',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  exportButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 12,
  },
  filterScrollView: {
    flexGrow: 0,
    marginBottom: 16,
  },
  filterChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#E2E8F0',
    marginRight: 8,
  },
  selectedFilterChip: {
    backgroundColor: '#4F46E5',
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#475569',
  },
  selectedFilterChipText: {
    color: '#FFFFFF',
  },
  logCard: {
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
    marginBottom: 6,
  },
  operationBadge: {
    backgroundColor: '#EEF2FF',
    color: '#4F46E5',
    fontWeight: 'bold',
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  dateText: {
    fontSize: 12,
    color: '#94A3B8',
  },
  entityText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
  },
  userText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
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
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 14,
  },
  detailLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 6,
  },
  detailValue: {
    fontWeight: 'normal',
    color: '#0F172A',
  },
  jsonBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 12,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  jsonTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#4F46E5',
    marginBottom: 4,
  },
  jsonText: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: '#334155',
  },
  closeModalButton: {
    backgroundColor: '#0F172A',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  closeModalButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});
