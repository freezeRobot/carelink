import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ImageBackground, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../firebase/firebaseConfig';
import { saveRole } from '../firebase/roleHelper'; // 导入 saveRole 函数

const LogScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [tempRole, setTempRole] = useState(''); // 用于暂时存储选择的身份
  const navigation = useNavigation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'DataScreen' }],
        });
      }
    });
    return () => unsubscribe();
  }, [navigation]);

  const handleAuthentication = async () => {
    try {
      if (isLogin) {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        console.log(`User signed in with email: ${email}`);
        console.log(`Selected role: ${tempRole}`); // 打印当前的tempRole

        // 上报并存储身份信息
        if (tempRole) {
          await saveRole(user.uid, tempRole);
        }
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        console.log(`User registered with email: ${email}`);
        Alert.alert('注册成功', '请重新登录');
        await signOut(auth); // 注册成功后手动签出用户
        navigation.navigate('LogScreen'); // 签出后导航回到 LogScreen
        setIsLogin(true);
        setEmail('');
        setPassword('');
      }
    } catch (error) {
      console.error('Authentication error:', error.message);
      Alert.alert('Authentication error', error.message);
    }
  };

  const handleRoleSelection = (role) => {
    setTempRole(role); // 暂时存储选择的身份
    console.log(`TempRole set to: ${role}`); // 打印当前的tempRole
  };

  return (
    <ImageBackground source={require('../assets/background.jpg')} style={styles.background}>
      <View style={styles.container}>
        <Text style={styles.title}>name</Text>
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
    fontSize: 18,
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
