import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getAuth, signOut } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';

const LogoutScreen = () => {
  const navigation = useNavigation();// Get navigation object
  const auth = getAuth();// Get the Firebase authentication object
  //Logout function
  const handleLogout = async () => {
    try {
      await signOut(auth);//Perform the logout operation
      navigation.reset({
        index: 0,
        routes: [{ name: 'LogScreen' }],// Navigate to the LogScreen
      });
    } catch (error) {
      console.error('Error signing out: ', error);//test anchor
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
  },
});

export default LogoutScreen;