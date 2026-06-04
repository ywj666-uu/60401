import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ScrollView,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';

export default function RegisterScreen({ navigation }) {
  const { register } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [province, setProvince] = useState(null);
  const [provinces, setProvinces] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadProvinces();
  }, []);

  const loadProvinces = async () => {
    try {
      const res = await client.get('/provinces/');
      setProvinces(res.data);
    } catch (error) {}
  };

  const handleRegister = async () => {
    if (!username || !password) {
      Alert.alert('提示', '请填写用户名和密码');
      return;
    }
    if (password.length < 6) {
      Alert.alert('提示', '密码至少6位');
      return;
    }
    setLoading(true);
    try {
      await register({ username, email, phone, password, province });
    } catch (error) {
      const msg = error.response?.data;
      const detail = msg?.username?.[0] || msg?.password?.[0] || '注册失败，请重试';
      Alert.alert('注册失败', detail);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>注册新账户</Text>

      <TextInput
        style={styles.input}
        placeholder="用户名 *"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="邮箱"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="手机号"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />
      <TextInput
        style={styles.input}
        placeholder="密码 * (至少6位)"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Text style={styles.label}>选择所属省份方言：</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.provinceScroll}>
        {provinces.map((p) => (
          <TouchableOpacity
            key={p.id}
            style={[styles.provinceChip, province === p.id && styles.provinceChipActive]}
            onPress={() => setProvince(p.id)}
          >
            <Text style={[styles.provinceText, province === p.id && styles.provinceTextActive]}>
              {p.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleRegister}
        disabled={loading}
      >
        <Text style={styles.buttonText}>{loading ? '注册中...' : '注册'}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.linkText}>已有账户？返回登录</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 30,
    paddingTop: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    textAlign: 'center',
    marginBottom: 30,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  label: {
    fontSize: 15,
    color: '#333',
    marginBottom: 10,
    marginTop: 5,
  },
  provinceScroll: {
    marginBottom: 20,
  },
  provinceChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#e0e0e0',
    marginRight: 8,
  },
  provinceChipActive: {
    backgroundColor: '#4CAF50',
  },
  provinceText: {
    fontSize: 14,
    color: '#333',
  },
  provinceTextActive: {
    color: '#fff',
  },
  button: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#a5d6a7',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  linkText: {
    color: '#4CAF50',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 15,
  },
});
