import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ImageBackground } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged } from '@firebase/auth';
import { auth } from '../firebase/firebaseConfig';

const Logscreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Datascreen' }],
        });
      }
    });
    return () => unsubscribe();
  }, [navigation]);

  const handleAuthentication = async () => {
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (error) {
      console.error('Authentication error:', error.message);
    }
  };

  return (
    <ImageBackground 
      source={require('../assets/background.jpg')} 
      style={styles.background}
    >
      <View style={styles.container}>
        <Text style={styles.title}>应用名称</Text>
        
        <View style={styles.selectionContainer}>
          <Text style={styles.selectionTitle}>选择你的身份</Text>
          <View style={styles.selectionButtons}>
            <TouchableOpacity style={styles.selectionButton}>
              <Text style={styles.buttonLabel}>父母</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.selectionButton}>
              <Text style={styles.buttonLabel}>子女</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputContainer}>
          <TextInput 
            style={styles.input} 
            placeholder="用户名" 
            placeholderTextColor="#888" 
            value={email}
            onChangeText={setEmail}
          />
          <TextInput 
            style={styles.input} 
            placeholder="密码" 
            placeholderTextColor="#888" 
            secureTextEntry 
            value={password}
            onChangeText={setPassword}
          />
        </View>

        <TouchableOpacity style={styles.loginButton} onPress={handleAuthentication}>
          <Text style={styles.loginButtonText}>{isLogin ? '登录' : '注册'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.signupButton} onPress={() => setIsLogin(!isLogin)}>
          <Text style={styles.signupButtonText}>
            {isLogin ? '没有账号？注册' : '已有账号？登录'}
          </Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

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
    backgroundColor: 'rgba(255, 255, 255, 0.6)', // 半透明白色背景，增加可读性
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
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
  buttonLabel: {
    fontSize: 16,
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
});

export default Logscreen;
