import React, { createContext, useState, useEffect, useContext } from 'react';
import * as SecureStore from 'expo-secure-store';
import client from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const token = await SecureStore.getItemAsync('access_token');
      if (token) {
        const res = await client.get('/auth/profile/');
        setUser(res.data);
      }
    } catch (error) {
      await SecureStore.deleteItemAsync('access_token');
      await SecureStore.deleteItemAsync('refresh_token');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username, password) => {
    const res = await client.post('/auth/login/', { username, password });
    await SecureStore.setItemAsync('access_token', res.data.access);
    await SecureStore.setItemAsync('refresh_token', res.data.refresh);
    const profileRes = await client.get('/auth/profile/');
    setUser(profileRes.data);
  };

  const register = async (userData) => {
    const res = await client.post('/auth/register/', userData);
    await SecureStore.setItemAsync('access_token', res.data.tokens.access);
    await SecureStore.setItemAsync('refresh_token', res.data.tokens.refresh);
    setUser(res.data.user);
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync('access_token');
    await SecureStore.deleteItemAsync('refresh_token');
    setUser(null);
  };

  const refreshProfile = async () => {
    try {
      const res = await client.get('/auth/profile/');
      setUser(res.data);
    } catch (error) {}
  };

  const incrementValidCount = () => {
    setUser((prev) => prev ? { ...prev, valid_recording_count: (prev.valid_recording_count || 0) + 1 } : prev);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, refreshProfile, incrementValidCount }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
