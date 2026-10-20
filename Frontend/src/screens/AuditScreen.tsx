import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { auditApi, AuditLogItem } from '../api/audit';

export const AuditScreen = () => {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLogs = async () => {
    try {
      const list = await auditApi.getAuditLogs();
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
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchLogs();
  };

  const renderAuditItem = ({ item }: { item: AuditLogItem }) => (
    <View style={styles.logCard}>
      <View style={styles.cardHeader}>
        <Text style={styles.operationBadge}>{item.operation}</Text>
        <Text style={styles.dateText}>
          {new Date(item.createdAt).toLocaleDateString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
      <Text style={styles.entityText}>Entidad: {item.entity}</Text>
      {item.userEmail && <Text style={styles.userText}>Usuario: {item.userEmail}</Text>}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Historial de Auditoría</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#6366F1" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={logs}
          keyExtractor={(item) => item.id}
          renderItem={renderAuditItem}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No hay registros de auditoría registrados.</Text>
          }
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </View>
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
  },
});
