import React from 'react';
import { View, StyleSheet } from 'react-native';

export default function ProgressBar({ percentage, height = 8, color = '#4CAF50' }) {
  return (
    <View style={[styles.container, { height }]}>
      <View style={[styles.fill, { width: `${Math.min(100, percentage)}%`, backgroundColor: color }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
    width: '100%',
  },
  fill: {
    height: '100%',
    borderRadius: 4,
  },
});
