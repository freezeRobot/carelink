// firebase/HealthInput.js
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';

const HealthInput = ({ user, dataType }) => {
  const [value, setValue] = useState(''); // 当前输入的值
  const [todayValue, setTodayValue] = useState(null); // 当天的值
  const firestore = getFirestore(); // 获取 Firestore 实例

  // 保存输入的值到 Firestore
  const handleSaveValue = async () => {
    if (user) {
      try {
        const uid = user.uid;
        const today = new Date();
        const timestamp = today.toISOString().split('T')[0]; // YYYY-MM-DD 格式
        const docRef = doc(firestore, dataType, `${uid}_${timestamp}`);

        await setDoc(docRef, {
          value,
          timestamp: new Date(),
        });

        alert(`${dataType} 保存成功!`);
        setValue('');
        fetchTodayValue(); // 保存后获取当天的值
      } catch (error) {
        console.error(`保存 ${dataType} 时出错:`, error.message);
      }
    }
  };

  // 获取当天的值
  const fetchTodayValue = async () => {
    if (user) {
      try {
        const uid = user.uid;
        const today = new Date();
        const timestamp = today.toISOString().split('T')[0]; // YYYY-MM-DD 格式
        const docRef = doc(firestore, dataType, `${uid}_${timestamp}`);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setTodayValue(docSnap.data().value);
        } else {
          setTodayValue(null);
        }
      } catch (error) {
        console.error(`获取今天的 ${dataType} 时出错:`, error.message);
      }
    }
  };

  // 组件挂载时获取当天的值
  useEffect(() => {
    fetchTodayValue();
  }, []);

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder={`输入 ${dataType}`}
        value={value}
        onChangeText={setValue}
        keyboardType="numeric"
      />
      <View style={styles.buttonContainer}>
        <Button title={`保存 ${dataType}`} onPress={handleSaveValue} color="#3498db" />
      </View>
      {todayValue !== null && (
        <View style={styles.valueContainer}>
          <Text style={styles.valueText}>今天的 {dataType}: {todayValue}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    elevation: 3,
    marginBottom: 16,
  },
  input: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    marginBottom: 16,
    padding: 8,
    borderRadius: 4,
  },
  buttonContainer: {
    marginBottom: 16,
  },
  valueContainer: {
    marginTop: 16,
  },
  valueText: {
    fontSize: 18,
    textAlign: 'center',
    color: '#2c3e50',
  },
});

export default HealthInput;