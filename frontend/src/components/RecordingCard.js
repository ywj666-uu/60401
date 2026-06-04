import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function RecordingCard({ recording }) {
  const getStatusStyle = (status) => {
    switch (status) {
      case 'pending':
        return { color: '#FF9800', bg: '#FFF3E0', label: '待审核' };
      case 'approved':
        return { color: '#4CAF50', bg: '#E8F5E9', label: '已通过' };
      case 'rejected':
        return { color: '#F44336', bg: '#FFEBEE', label: '已拒绝' };
      default:
        return { color: '#999', bg: '#f5f5f5', label: status };
    }
  };

  const statusStyle = getStatusStyle(recording.status);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={1}>{recording.text_title}</Text>
        <View style={[styles.badge, { backgroundColor: statusStyle.bg }]}>
          <Text style={[styles.badgeText, { color: statusStyle.color }]}>{statusStyle.label}</Text>
        </View>
      </View>
      <Text style={styles.info}>
        {recording.province_name} | {recording.duration ? `${recording.duration.toFixed(1)}s` : '-'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  info: {
    fontSize: 13,
    color: '#888',
    marginTop: 6,
  },
});
