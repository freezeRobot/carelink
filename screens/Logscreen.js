import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ImageBackground, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../firebase/firebaseConfig';
import {  getRole } from '../firebase/roleHelper'; // 导入 saveRole 和 getRole 函数
import { useAuth } from '../AuthContext'; // 导入 useAuth

const LogScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [tempRole, setTempRole] = useState(''); // 用于暂时存储选择的身份
  const navigation = useNavigation();
  const { setUser, setRole, updateRole } = useAuth(); // 使用 AuthContext

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userRole = await getRole(user.uid);
        setUser(user);
        setRole(userRole);
        navigation.reset({
          index: 0,
          routes: [{ name: 'DataScreen' }],
        });
      }
    });
    return () => unsubscribe();
  }, [navigation, setUser, setRole]);

  const validateEmail = (email) => {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
  };

  const handleAuthentication = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter username and password');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Error', 'Invalid email format');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }
    if (isLogin && !tempRole) {
      Alert.alert('Error', 'Please select a role before logging in');
      return;
    }

    try {
      if (isLogin) {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        console.log(`User signed in with email: ${email}`);
        console.log(`Selected role: ${tempRole}`);

        // 检查并更新角色信息
        const existingRole = await getRole(user.uid);
        if (tempRole && tempRole !== existingRole) {
          await updateRole(user.uid, tempRole);
        }
        setUser(user);
        setRole(tempRole || existingRole); // 使用新角色或现有角色
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        console.log(`User registered with email: ${email}`);
        Alert.alert('Registration Successful', 'Please log in with your new account.');
        await signOut(auth); // 用户注册后登出
        navigation.navigate('LogScreen');
        setIsLogin(true);
        setEmail('');
        setPassword('');
      }
    } catch (error) {
      let errorMessage = 'Authentication error';
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'User does not exist';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address';
      } else if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Email already in use';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak';
      } else if (error.code === 'auth/invalid-credential') {
        errorMessage = 'Invalid credentials provided';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many requests, please try again later';
      }
      console.error('Authentication error:', error.message);
      Alert.alert('Authentication error', error.message);
    }
  };

  const handleRoleSelection = (role) => {
    setTempRole(role);
    console.log(`TempRole set to: ${role}`);
  };

  return (
    <ImageBackground source={require('../assets/background.jpg')} style={styles.background}>
      <View style={styles.container}>
        <Text style={styles.title}>CareLink</Text>
        {isLogin && (
          <View style={styles.selectionContainer}>
            <Text style={styles.selectionTitle}>choose role</Text>
            <View style={styles.selectionButtons}>
              <TouchableOpacity
                style={[styles.selectionButton, tempRole === 'parent' && styles.selectedButton]}
                onPress={() => handleRoleSelection('parent')}
              >
                <Text style={styles.buttonLabel}>Parent</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.selectionButton, tempRole === 'child' && styles.selectedButton]}
                onPress={() => handleRoleSelection('child')}
              >
                <Text style={styles.buttonLabel}>Child</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="username"
            placeholderTextColor="#888"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            style={styles.input}
            placeholder="password"
            placeholderTextColor="#888"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>
        <TouchableOpacity style={styles.loginButton} onPress={handleAuthentication}>
          <Text style={styles.loginButtonText}>{isLogin ? 'Log In' : 'Sign Up'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.signupButton} onPress={() => setIsLogin(!isLogin)}>
          <Text style={styles.signupButtonText}>{isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Log In'}</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    color:'#f88',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 24,
  },
  input: {
    backgroundColor: '#eee',
    width: '100%',
    padding: 12,
    borderRadius: 4,
    marginBottom: 12,
    fontSize: 16,
  },
  loginButton: {
    backgroundColor: '#f88',
    padding: 12,
    borderRadius: 4,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  signupButton: {
    backgroundColor: '#f88',
    padding: 12,
    borderRadius: 4,
    width: '100%',
    alignItems: 'center',
  },
  signupButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  selectionContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  selectionTitle: {
    fontSize: 14,
    marginBottom: 8,
  },
  selectionButtons: {
    flexDirection: 'row',
  },
  selectionButton: {
    backgroundColor: '#ddd',
    padding: 10,
    borderRadius: 4,
    marginHorizontal: 8,
  },
  selectedButton: {
    backgroundColor: '#aaa',
  },
  buttonLabel: {
    fontSize: 16,
  },
});

export default LogScreen;
