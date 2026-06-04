import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, RefreshControl } from 'react-native';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';

export default function ProfileScreen() {
  const { user, logout, refreshProfile } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      const res = await client.get('/stats/leaderboard/');
      setLeaderboard(res.data);
    } catch (error) {}
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadLeaderboard(), refreshProfile()]);
    setRefreshing(false);
  };

  const handleLogout = () => {
    Alert.alert('确认退出', '确定要退出登录吗？', [
      { text: '取消', style: 'cancel' },
      { text: '确定', onPress: logout },
    ]);
  };

  const myRank = leaderboard.findIndex((item) => item.user_id === user?.id) + 1;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.username?.[0]?.toUpperCase() || '?'}
          </Text>
        </View>
        <Text style={styles.username}>{user?.username}</Text>
        <Text style={styles.email}>{user?.email || '未设置邮箱'}</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{user?.valid_recording_count || 0}</Text>
          <Text style={styles.statLabel}>有效录音</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{myRank || '-'}</Text>
          <Text style={styles.statLabel}>当前排名</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{user?.province_name || '-'}</Text>
          <Text style={styles.statLabel}>方言区</Text>
        </View>
      </View>

      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>手机号</Text>
          <Text style={styles.infoValue}>{user?.phone || '未设置'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>注册时间</Text>
          <Text style={styles.infoValue}>
            {user?.date_joined ? new Date(user.date_joined).toLocaleDateString('zh-CN') : '-'}
          </Text>
        </View>
      </View>

      <View style={styles.leaderSection}>
        <Text style={styles.leaderTitle}>贡献榜（按有效录音数排序）</Text>
        {leaderboard.map((item, index) => {
          const isMe = item.user_id === user?.id;
          return (
            <View key={item.user_id} style={[styles.leaderRow, isMe && styles.leaderRowMe]}>
              <View style={styles.rankBadge}>
                <Text style={[
                  styles.rankText,
                  index < 3 && styles.rankTop,
                ]}>
                  {index + 1}
                </Text>
              </View>
              <View style={styles.leaderInfo}>
                <Text style={[styles.leaderName, isMe && styles.leaderNameMe]}>
                  {item.username}{isMe ? ' (我)' : ''}
                </Text>
                <Text style={styles.leaderProvince}>{item.province_name || '未知方言区'}</Text>
              </View>
              <View style={styles.countBadge}>
                <Text style={styles.countText}>{item.valid_count}</Text>
                <Text style={styles.countUnit}>条</Text>
              </View>
            </View>
          );
        })}
        {leaderboard.length === 0 && (
          <Text style={styles.emptyText}>暂无贡献数据</Text>
        )}
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>退出登录</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  profileCard: {
    backgroundColor: '#4CAF50',
    paddingTop: 30,
    paddingBottom: 25,
    alignItems: 'center',
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  username: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  email: {
    fontSize: 14,
    color: '#e8f5e9',
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    margin: 15,
    gap: 10,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  statLabel: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  infoCard: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    borderRadius: 12,
    padding: 5,
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  infoLabel: {
    fontSize: 15,
    color: '#666',
  },
  infoValue: {
    fontSize: 15,
    color: '#333',
  },
  leaderSection: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },
  leaderTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  leaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  leaderRowMe: {
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    marginHorizontal: -8,
    paddingHorizontal: 8,
  },
  rankBadge: {
    width: 30,
    alignItems: 'center',
  },
  rankText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#666',
  },
  rankTop: {
    color: '#FF6F00',
  },
  leaderInfo: {
    flex: 1,
    marginLeft: 8,
  },
  leaderName: {
    fontSize: 15,
    color: '#333',
  },
  leaderNameMe: {
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  leaderProvince: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  countBadge: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  countText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  countUnit: {
    fontSize: 12,
    color: '#888',
    marginLeft: 2,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 14,
    paddingVertical: 20,
  },
  logoutBtn: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginBottom: 30,
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
  },
  logoutText: {
    fontSize: 16,
    color: '#F44336',
    fontWeight: 'bold',
  },
});
