import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView,
} from 'react-native';
import { Audio } from 'expo-av';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function RecordingScreen() {
  const { user, incrementValidCount } = useAuth();
  const [texts, setTexts] = useState([]);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingUri, setRecordingUri] = useState(null);
  const [duration, setDuration] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [timer, setTimer] = useState(null);

  useEffect(() => {
    loadTexts();
    return () => {
      if (timer) clearInterval(timer);
    };
  }, []);

  const loadTexts = async () => {
    try {
      const res = await client.get('/texts/');
      setTexts(res.data);
    } catch (error) {
      Alert.alert('错误', '加载朗读文本失败');
    }
  };

  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('权限不足', '需要麦克风权限来录制音频');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording: rec } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(rec);
      setIsRecording(true);
      setDuration(0);
      setRecordingUri(null);

      const t = setInterval(() => {
        setDuration((d) => d + 1);
      }, 1000);
      setTimer(t);
    } catch (error) {
      Alert.alert('错误', '无法启动录音');
    }
  };

  const stopRecording = async () => {
    if (!recording) return;
    try {
      clearInterval(timer);
      setTimer(null);
      setIsRecording(false);
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecordingUri(uri);
      setRecording(null);
    } catch (error) {
      Alert.alert('错误', '停止录音失败');
    }
  };

  const uploadRecording = async () => {
    if (!recordingUri) return;
    const currentText = texts[currentTextIndex];
    if (!currentText) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('audio_file', {
        uri: recordingUri,
        name: `recording_${Date.now()}.m4a`,
        type: 'audio/m4a',
      });
      formData.append('text', currentText.id);
      formData.append('province', user.province || 1);

      const res = await client.post('/recordings/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      Alert.alert('上传成功', `录音已提交等待审核\n音量：${res.data.volume_db} dBFS`);
      incrementValidCount();
      setRecordingUri(null);
      setDuration(0);
      if (currentTextIndex < texts.length - 1) {
        setCurrentTextIndex(currentTextIndex + 1);
      }
    } catch (error) {
      if (error.response?.status === 422) {
        const data = error.response.data;
        Alert.alert(
          '音量不达标，录音未入库',
          `${data.detail}\n\n当前音量：${data.volume_db} dBFS\n要求：≥ ${data.threshold} dBFS\n\n请保持正常说话音量重新录制`,
        );
      } else if (error.response?.status === 400) {
        Alert.alert('上传失败', error.response.data?.detail || '文件格式不正确');
      } else {
        Alert.alert('上传失败', '请检查网络后重试');
      }
    } finally {
      setUploading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentText = texts[currentTextIndex];

  return (
    <ScrollView style={styles.container}>
      {currentText ? (
        <View style={styles.textCard}>
          <Text style={styles.textTitle}>{currentText.title}</Text>
          <Text style={styles.textContent}>{currentText.content}</Text>
          <Text style={styles.textHint}>
            难度：{'★'.repeat(currentText.difficulty)}{'☆'.repeat(3 - currentText.difficulty)}
            {'  '}({currentTextIndex + 1}/{texts.length})
          </Text>
        </View>
      ) : (
        <View style={styles.textCard}>
          <Text style={styles.emptyText}>加载中...</Text>
        </View>
      )}

      <View style={styles.recorderCard}>
        <Text style={styles.timerText}>{formatTime(duration)}</Text>

        <View style={styles.controls}>
          {!isRecording && !recordingUri && (
            <TouchableOpacity style={styles.recordBtn} onPress={startRecording}>
              <View style={styles.recordBtnInner} />
            </TouchableOpacity>
          )}
          {isRecording && (
            <TouchableOpacity style={styles.stopBtn} onPress={stopRecording}>
              <View style={styles.stopBtnInner} />
            </TouchableOpacity>
          )}
        </View>

        {isRecording && (
          <Text style={styles.statusText}>录音中... 请朗读上方文本</Text>
        )}

        {recordingUri && !isRecording && (
          <View style={styles.uploadSection}>
            <Text style={styles.statusText}>录音完成 ({formatTime(duration)})</Text>
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.retryBtn}
                onPress={() => { setRecordingUri(null); setDuration(0); }}
              >
                <Text style={styles.retryBtnText}>重录</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.uploadBtn, uploading && styles.btnDisabled]}
                onPress={uploadRecording}
                disabled={uploading}
              >
                <Text style={styles.uploadBtnText}>
                  {uploading ? '上传中...' : '上传'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      <View style={styles.tipsCard}>
        <Text style={styles.tipsTitle}>录音提示</Text>
        <Text style={styles.tipItem}>- 请在安静环境中录制</Text>
        <Text style={styles.tipItem}>- 使用您的本地方言朗读</Text>
        <Text style={styles.tipItem}>- 保持正常说话音量</Text>
        <Text style={styles.tipItem}>- 录音时长建议10-60秒</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  textCard: {
    backgroundColor: '#fff',
    margin: 15,
    borderRadius: 12,
    padding: 20,
  },
  textTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  textContent: {
    fontSize: 18,
    lineHeight: 28,
    color: '#222',
    backgroundColor: '#f9fbe7',
    padding: 15,
    borderRadius: 8,
  },
  textHint: {
    marginTop: 12,
    fontSize: 13,
    color: '#888',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
  },
  recorderCard: {
    backgroundColor: '#fff',
    margin: 15,
    marginTop: 0,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  timerText: {
    fontSize: 36,
    fontWeight: '300',
    color: '#333',
    marginBottom: 20,
  },
  controls: {
    marginVertical: 10,
  },
  recordBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#ffcdd2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordBtnInner: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#f44336',
  },
  stopBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#ffcdd2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stopBtnInner: {
    width: 30,
    height: 30,
    borderRadius: 4,
    backgroundColor: '#f44336',
  },
  statusText: {
    marginTop: 15,
    fontSize: 15,
    color: '#666',
  },
  uploadSection: {
    alignItems: 'center',
    width: '100%',
  },
  actionRow: {
    flexDirection: 'row',
    marginTop: 15,
    gap: 15,
  },
  retryBtn: {
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#e0e0e0',
  },
  retryBtnText: {
    fontSize: 16,
    color: '#333',
  },
  uploadBtn: {
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#4CAF50',
  },
  btnDisabled: {
    backgroundColor: '#a5d6a7',
  },
  uploadBtnText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  tipsCard: {
    backgroundColor: '#fff',
    margin: 15,
    marginTop: 0,
    borderRadius: 12,
    padding: 15,
  },
  tipsTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  tipItem: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
});
