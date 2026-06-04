import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl } from 'react-native';
import client from '../api/client';

export default function MyRecordingsScreen() {
  const [recordings, setRecordings] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadRecordings();
  }, []);

  const loadRecordings = async () => {
    try {
      const res = await client.get('/recordings/');
      setRecordings(res.data.results || res.data);
    } catch (error) {}
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRecordings();
    setRefreshing(false);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return { text: '待审核', color: '#FF9800', bg: '#FFF3E0' };
      case 'approved':
        return { text: '已通过', color: '#4CAF50', bg: '#E8F5E9' };
      case 'rejected':
        return { text: '已拒绝', color: '#F44336', bg: '#FFEBEE' };
      default:
        return { text: status, color: '#999', bg: '#f5f5f5' };
    }
  };

  const renderItem = ({ item }) => {
    const badge = getStatusBadge(item.status);
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.textTitle}>{item.text_title}</Text>
          <View style={[styles.badge, { backgroundColor: badge.bg }]}>
            <Text style={[styles.badgeText, { color: badge.color }]}>{badge.text}</Text>
          </View>
        </View>
        <View style={styles.cardBody}>
          <Text style={styles.infoText}>方言：{item.province_name}</Text>
          <Text style={styles.infoText}>
            时长：{item.duration ? `${item.duration.toFixed(1)}秒` : '-'}
          </Text>
          <Text style={styles.infoText}>
            音量：{item.volume_db ? `${item.volume_db} dBFS` : '-'}
            {item.volume_valid ? ' ✓' : ' ✗'}
          </Text>
        </View>
        {item.reject_reason ? (
          <Text style={styles.rejectReason}>原因：{item.reject_reason}</Text>
        ) : null}
        <Text style={styles.dateText}>
          {new Date(item.created_at).toLocaleString('zh-CN')}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={recordings}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <Text style={styles.emptyText}>暂无录音记录，去录制第一条吧！</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  list: {
    padding: 15,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  textTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  cardBody: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  infoText: {
    fontSize: 13,
    color: '#666',
  },
  rejectReason: {
    fontSize: 13,
    color: '#F44336',
    marginTop: 8,
  },
  dateText: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 15,
    marginTop: 50,
  },
});
