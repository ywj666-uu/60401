import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Pressable } from 'react-native';
import Svg, { Path, G } from 'react-native-svg';
import client from '../api/client';

const PROVINCE_PATHS = {
  BJ: { d: 'M580,180 l8,0 4,8 -4,8 -8,0 -4,-8z', cx: 580, cy: 184 },
  TJ: { d: 'M588,192 l8,0 4,8 -4,8 -8,0 -4,-8z', cx: 588, cy: 196 },
  HE: { d: 'M555,175 l40,0 10,30 -5,30 -40,5 -15,-30z', cx: 565, cy: 205 },
  SX: { d: 'M520,190 l25,0 5,40 -10,35 -25,-5 -5,-35z', cx: 527, cy: 225 },
  NM: { d: 'M440,100 l120,0 30,30 -10,50 -60,20 -80,-10 -30,-40z', cx: 490, cy: 140 },
  LN: { d: 'M600,160 l30,0 10,25 -15,20 -30,-5 -10,-20z', cx: 607, cy: 180 },
  JL: { d: 'M610,130 l35,0 10,20 -10,20 -35,-5 -10,-15z', cx: 622, cy: 148 },
  HL: { d: 'M610,80 l50,0 15,30 -10,30 -45,-5 -20,-25z', cx: 632, cy: 108 },
  SH: { d: 'M610,290 l8,0 3,8 -3,8 -8,0 -3,-8z', cx: 612, cy: 294 },
  JS: { d: 'M580,260 l25,0 5,30 -10,25 -25,-5 -5,-25z', cx: 585, cy: 280 },
  ZJ: { d: 'M590,310 l20,0 5,25 -10,20 -20,-5 -5,-20z', cx: 593, cy: 328 },
  AH: { d: 'M560,265 l20,0 5,30 -10,25 -20,-5 -5,-25z', cx: 562, cy: 285 },
  FJ: { d: 'M580,345 l20,0 8,25 -10,20 -20,-5 -8,-20z', cx: 583, cy: 363 },
  JX: { d: 'M555,320 l20,0 5,30 -10,25 -20,-5 -5,-25z', cx: 558, cy: 340 },
  SD: { d: 'M570,220 l35,0 10,20 -10,20 -35,-5 -10,-15z', cx: 580, cy: 238 },
  HA: { d: 'M530,240 l30,0 8,25 -10,25 -30,-5 -8,-20z', cx: 538, cy: 260 },
  HB: { d: 'M500,280 l35,0 10,30 -10,25 -35,-5 -10,-25z', cx: 510, cy: 300 },
  HN: { d: 'M510,330 l30,0 8,30 -10,25 -30,-5 -8,-25z', cx: 518, cy: 352 },
  GD: { d: 'M510,390 l35,0 10,25 -10,20 -35,-5 -10,-20z', cx: 520, cy: 407 },
  GX: { d: 'M460,385 l35,0 8,25 -10,20 -35,-5 -8,-18z', cx: 470, cy: 400 },
  HI: { d: 'M490,440 l15,0 5,12 -5,12 -15,0 -5,-12z', cx: 493, cy: 448 },
  CQ: { d: 'M470,295 l20,0 5,20 -8,18 -20,-3 -5,-18z', cx: 475, cy: 310 },
  SC: { d: 'M400,270 l50,0 10,40 -10,40 -50,-5 -15,-35z', cx: 420, cy: 305 },
  GZ: { d: 'M460,345 l25,0 5,25 -10,20 -25,-5 -5,-20z', cx: 465, cy: 360 },
  YN: { d: 'M390,350 l40,0 8,35 -10,30 -40,-5 -10,-30z', cx: 405, cy: 378 },
  XZ: { d: 'M250,240 l100,0 15,50 -15,40 -100,-10 -20,-40z', cx: 300, cy: 280 },
  SN: { d: 'M490,215 l25,0 5,40 -10,30 -25,-5 -5,-35z', cx: 497, cy: 245 },
  GS: { d: 'M380,170 l70,0 10,35 -20,30 -60,-10 -15,-25z', cx: 410, cy: 198 },
  QH: { d: 'M330,200 l50,0 10,35 -10,30 -50,-10 -15,-25z', cx: 350, cy: 225 },
  NX: { d: 'M470,175 l18,0 4,25 -8,20 -18,-3 -4,-22z', cx: 474, cy: 195 },
  XJ: { d: 'M200,100 l120,0 20,60 -20,60 -120,-10 -30,-50z', cx: 260, cy: 155 },
  TW: { d: 'M620,365 l10,0 4,20 -4,15 -10,0 -4,-15z', cx: 622, cy: 380 },
  HK: { d: 'M555,418 l6,0 2,5 -2,5 -6,0 -2,-5z', cx: 556, cy: 421 },
  MO: { d: 'M545,420 l5,0 2,5 -2,5 -5,0 -2,-5z', cx: 546, cy: 423 },
};

const getColorForProgress = (percentage) => {
  if (percentage === 0) return '#EEEEEE';
  if (percentage <= 10) return '#FFF9C4';
  if (percentage <= 25) return '#FFF176';
  if (percentage <= 40) return '#FFD54F';
  if (percentage <= 55) return '#FF8A65';
  if (percentage <= 70) return '#EF5350';
  if (percentage <= 85) return '#C62828';
  return '#4A148C';
};

export default function ProvinceMapScreen() {
  const [progressData, setProgressData] = useState([]);
  const [tooltip, setTooltip] = useState(null);

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      const res = await client.get('/stats/province-progress/');
      setProgressData(res.data);
    } catch (error) {}
  };

  const getProvinceProgress = (code) => {
    return progressData.find((p) => p.code === code) || {
      progress_percentage: 0,
      approved_count: 0,
      target_count: 100,
      name: code,
    };
  };

  const handleProvincePress = (code) => {
    const data = getProvinceProgress(code);
    if (tooltip?.code === code) {
      setTooltip(null);
    } else {
      setTooltip({ ...data, code });
    }
  };

  const dismissTooltip = () => setTooltip(null);

  const shortfallProvinces = [...progressData]
    .sort((a, b) => a.progress_percentage - b.progress_percentage)
    .slice(0, 10);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.mapContainer}>
        <Text style={styles.mapTitle}>各省份方言采集进度</Text>

        <View style={styles.mapWrapper}>
          <Svg width="350" height="480" viewBox="180 70 500 420">
            <G>
              {Object.entries(PROVINCE_PATHS).map(([code, pathData]) => {
                const progress = getProvinceProgress(code);
                const color = getColorForProgress(progress.progress_percentage);
                return (
                  <Path
                    key={code}
                    d={pathData.d}
                    fill={color}
                    stroke="#fff"
                    strokeWidth="1"
                    onPress={() => handleProvincePress(code)}
                  />
                );
              })}
            </G>
          </Svg>

          {tooltip && (
            <Pressable style={styles.tooltipOverlay} onPress={dismissTooltip}>
              <View style={styles.tooltip}>
                <Text style={styles.tooltipTitle}>{tooltip.name}</Text>
                <View style={styles.tooltipRow}>
                  <Text style={styles.tooltipLabel}>已完成</Text>
                  <Text style={styles.tooltipValue}>{tooltip.approved_count} 条</Text>
                </View>
                <View style={styles.tooltipRow}>
                  <Text style={styles.tooltipLabel}>目标数</Text>
                  <Text style={styles.tooltipValue}>{tooltip.target_count} 条</Text>
                </View>
                <View style={styles.tooltipRow}>
                  <Text style={styles.tooltipLabel}>缺口</Text>
                  <Text style={[
                    styles.tooltipValue,
                    tooltip.approved_count < tooltip.target_count && styles.tooltipShortfall,
                  ]}>
                    {Math.max(0, tooltip.target_count - tooltip.approved_count)} 条
                  </Text>
                </View>
                <View style={styles.tooltipBarOuter}>
                  <View style={[styles.tooltipBar, { width: `${tooltip.progress_percentage}%` }]} />
                </View>
                <Text style={styles.tooltipPercent}>{tooltip.progress_percentage}%</Text>
              </View>
            </Pressable>
          )}
        </View>
      </View>

      <View style={styles.legend}>
        <Text style={styles.legendTitle}>热力图图例</Text>
        <View style={styles.legendRow}>
          <View style={[styles.legendColor, { backgroundColor: '#EEEEEE' }]} />
          <Text style={styles.legendText}>0%</Text>
          <View style={[styles.legendColor, { backgroundColor: '#FFF176' }]} />
          <Text style={styles.legendText}>~25%</Text>
          <View style={[styles.legendColor, { backgroundColor: '#FFD54F' }]} />
          <Text style={styles.legendText}>~40%</Text>
          <View style={[styles.legendColor, { backgroundColor: '#FF8A65' }]} />
          <Text style={styles.legendText}>~55%</Text>
          <View style={[styles.legendColor, { backgroundColor: '#EF5350' }]} />
          <Text style={styles.legendText}>~70%</Text>
          <View style={[styles.legendColor, { backgroundColor: '#C62828' }]} />
          <Text style={styles.legendText}>~85%</Text>
          <View style={[styles.legendColor, { backgroundColor: '#4A148C' }]} />
          <Text style={styles.legendText}>100%</Text>
        </View>
      </View>

      <View style={styles.shortfallSection}>
        <Text style={styles.shortfallTitle}>短板省份 TOP 10（完成度最低）</Text>
        {shortfallProvinces.map((province) => (
          <View key={province.id} style={styles.listItem}>
            <View style={[styles.heatBlock, { backgroundColor: getColorForProgress(province.progress_percentage) }]} />
            <Text style={styles.listName}>{province.name}</Text>
            <Text style={styles.listFraction}>
              {province.approved_count}/{province.target_count}
            </Text>
            <View style={styles.listBarContainer}>
              <View style={[styles.listBar, {
                width: `${province.progress_percentage}%`,
                backgroundColor: getColorForProgress(province.progress_percentage),
              }]} />
            </View>
            <Text style={[
              styles.listPercent,
              province.progress_percentage < 25 && styles.listPercentDanger,
            ]}>
              {province.progress_percentage}%
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.listSection}>
        <Text style={styles.listSectionTitle}>全部省份（按完成度排序）</Text>
        {[...progressData]
          .sort((a, b) => b.progress_percentage - a.progress_percentage)
          .map((province) => (
          <View key={province.id} style={styles.listItem}>
            <View style={[styles.heatBlock, { backgroundColor: getColorForProgress(province.progress_percentage) }]} />
            <Text style={styles.listName}>{province.name}</Text>
            <Text style={styles.listFraction}>
              {province.approved_count}/{province.target_count}
            </Text>
            <View style={styles.listBarContainer}>
              <View style={[styles.listBar, {
                width: `${province.progress_percentage}%`,
                backgroundColor: getColorForProgress(province.progress_percentage),
              }]} />
            </View>
            <Text style={styles.listPercent}>{province.progress_percentage}%</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  mapContainer: {
    backgroundColor: '#fff',
    margin: 15,
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
  },
  mapTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  mapWrapper: {
    position: 'relative',
  },
  tooltipOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tooltip: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    minWidth: 180,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  tooltipTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  tooltipRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  tooltipLabel: {
    fontSize: 14,
    color: '#666',
  },
  tooltipValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  tooltipShortfall: {
    color: '#D32F2F',
    fontWeight: 'bold',
  },
  tooltipBarOuter: {
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    marginTop: 8,
    overflow: 'hidden',
  },
  tooltipBar: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 3,
  },
  tooltipPercent: {
    textAlign: 'center',
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  legend: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  legendTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 3,
  },
  legendText: {
    fontSize: 12,
    color: '#666',
    marginRight: 8,
  },
  shortfallSection: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
  },
  shortfallTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#D32F2F',
    marginBottom: 12,
  },
  listSection: {
    backgroundColor: '#fff',
    margin: 15,
    marginTop: 5,
    borderRadius: 12,
    padding: 15,
  },
  listSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  heatBlock: {
    width: 12,
    height: 12,
    borderRadius: 2,
    marginRight: 6,
  },
  listName: {
    width: 72,
    fontSize: 13,
    color: '#333',
  },
  listFraction: {
    width: 52,
    fontSize: 12,
    color: '#555',
    textAlign: 'center',
  },
  listBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
    marginHorizontal: 6,
  },
  listBar: {
    height: '100%',
    borderRadius: 4,
  },
  listPercent: {
    width: 36,
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
  },
  listPercentDanger: {
    color: '#D32F2F',
    fontWeight: 'bold',
  },
});
