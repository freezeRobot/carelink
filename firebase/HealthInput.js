import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

const HealthInput = ({ user, dataType }) => {
  const [todayValue, setTodayValue] = useState(null);
  const firestore = getFirestore();

  useEffect(() => {
    fetchTodayValue();
  }, []);

  const fetchTodayValue = async () => {
    if (user) {
      try {
        const uid = user.uid;
        const today = new Date();
        const timestamp = today.toISOString().split('T')[0];
        const docRef = doc(firestore, dataType, `${uid}_${timestamp}`);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setTodayValue(docSnap.data().value);
        } else {
          setTodayValue('今天尚未检测');
        }
      } catch (error) {
        console.error(`获取今天的 ${dataType} 时出错:`, error.message);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{dataType}:</Text>
      <Text style={styles.value}>{todayValue !== null ? todayValue : '加载中...'}</Text>
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
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  value: {
    fontSize: 16,
  },
});

export default HealthInput;
