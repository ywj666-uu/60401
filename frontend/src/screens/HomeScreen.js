import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';

export default function HomeScreen({ navigation }) {
  const { user, refreshProfile } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const res = await client.get('/stats/leaderboard/');
      setLeaderboard(res.data.slice(0, 10));
    } catch (error) {}
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadData(), refreshProfile()]);
    setRefreshing(false);
  };

  const userRank = leaderboard.findIndex((item) => item.user_id === user?.id) + 1;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.statsCard}>
        <Text style={styles.greeting}>你好，{user?.username}！</Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{user?.valid_recording_count || 0}</Text>
            <Text style={styles.statLabel}>有效录音</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{userRank || '-'}</Text>
            <Text style={styles.statLabel}>排名</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{user?.province_name || '未设置'}</Text>
            <Text style={styles.statLabel}>方言区</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.recordButton} onPress={() => navigation.navigate('Record')}>
        <Text style={styles.recordButtonText}>开始录音</Text>
        <Text style={styles.recordButtonSub}>朗读指定文本，上传方言录音</Text>
      </TouchableOpacity>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>贡献排行榜 TOP 10</Text>
        {leaderboard.map((item, index) => (
          <View key={item.user_id} style={styles.leaderRow}>
            <Text style={styles.rankText}>#{index + 1}</Text>
            <Text style={styles.nameText}>{item.username}</Text>
            <Text style={styles.countText}>{item.valid_count} 条</Text>
          </View>
        ))}
        {leaderboard.length === 0 && (
          <Text style={styles.emptyText}>暂无数据，成为第一个贡献者吧！</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  statsCard: {
    backgroundColor: '#4CAF50',
    margin: 15,
    borderRadius: 12,
    padding: 20,
  },
  greeting: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  statLabel: {
    color: '#e8f5e9',
    fontSize: 13,
    marginTop: 4,
  },
  recordButton: {
    backgroundColor: '#fff',
    margin: 15,
    marginTop: 0,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  recordButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  recordButtonSub: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  section: {
    backgroundColor: '#fff',
    margin: 15,
    marginTop: 0,
    borderRadius: 12,
    padding: 15,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  leaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  rankText: {
    width: 35,
    fontSize: 15,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  nameText: {
    flex: 1,
    fontSize: 15,
    color: '#333',
  },
  countText: {
    fontSize: 14,
    color: '#666',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 14,
    paddingVertical: 20,
  },
});
