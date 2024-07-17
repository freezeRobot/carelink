import React, { useEffect } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { getAuth, signOut } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';

const LogoutScreen = () => {
  const navigation = useNavigation();
  const auth = getAuth();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigation.reset({
        index: 0,
        routes: [{ name: 'LogScreen' }],
      });
    } catch (error) {
      console.error('Error signing out: ', error);
    }
  };

  useEffect(() => {
    handleLogout();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.message}>Logging out...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
  },
  message: {
    fontSize: 18,
    color: '#333',
  },
});

export default LogoutScreen;