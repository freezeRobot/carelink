import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, ScrollView, Modal, TextInput, TouchableOpacity } from 'react-native';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import BottomNavigation from './BottomNavigation';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';

const DataScreen = () => {
  const [user, setUser] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [updateType, setUpdateType] = useState(null);
  const [bloodPressure, setBloodPressure] = useState('');
  const [bloodSugar, setBloodSugar] = useState('');
  const [todayBloodPressure, setTodayBloodPressure] = useState(null);
  const [todayBloodSugar, setTodayBloodSugar] = useState(null);
  const [remainingTasks, setRemainingTasks] = useState(0);
  const auth = getAuth();
  const firestore = getFirestore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (user) {
        fetchTodayValues(user);
      }
    });

    return () => unsubscribe();
  }, [auth]);

  const fetchTodayValues = async (user) => {
    const uid = user.uid;
    const today = new Date();
    const timestamp = today.toISOString().split('T')[0];
    
    const bloodPressureRef = doc(firestore, 'blood pressure', `${uid}_${timestamp}`);
    const bloodSugarRef = doc(firestore, 'blood sugar', `${uid}_${timestamp}`);

    const bloodPressureDoc = await getDoc(bloodPressureRef);
    const bloodSugarDoc = await getDoc(bloodSugarRef);

    setTodayBloodPressure(bloodPressureDoc.exists() ? bloodPressureDoc.data().value : '今天尚未检测');
    setTodayBloodSugar(bloodSugarDoc.exists() ? bloodSugarDoc.data().value : '今天尚未检测');
    setRemainingTasks(0); // 默认剩余任务数为0，可以根据实际数据进行调整
  };

  const handleSaveValues = async () => {
    if (user) {
      const uid = user.uid;
      const today = new Date();
      const timestamp = today.toISOString().split('T')[0];

      if (updateType === 'blood pressure') {
        const bloodPressureRef = doc(firestore, 'blood pressure', `${uid}_${timestamp}`);
        await setDoc(bloodPressureRef, { value: bloodPressure, timestamp: new Date() }, { merge: true });
      } else if (updateType === 'blood sugar') {
        const bloodSugarRef = doc(firestore, 'blood sugar', `${uid}_${timestamp}`);
        await setDoc(bloodSugarRef, { value: bloodSugar, timestamp: new Date() }, { merge: true });
      }

      setModalVisible(false);
      setUpdateType(null); // 重置更新类型
      fetchTodayValues(user);
    }
  };

  const handleUpdateClick = (type) => {
    setUpdateType(type);
    setModalVisible(true);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>我的健康数据</Text>
        <Text style={styles.dateText}>Today {new Date().toISOString().split('T')[0]}</Text>

        <View style={styles.scoreContainer}>
          <Text style={styles.scoreText}>92</Text>
          <Text style={styles.scoreLabel}>Score</Text>
        </View>

        <View style={styles.healthDataContainer}>
          <View style={styles.dataRow}>
            <Text style={styles.sectionTitle}>今日健康</Text>
            <Button title="更新" onPress={() => handleUpdateClick('select')} />
          </View>
          <View style={styles.dataBox}>
            <View style={styles.dataContentRow}>
              <View style={styles.circle} />
              <Text style={styles.dataLabel}>血压: </Text>
              <Text style={styles.dataValue}>{todayBloodPressure}</Text>
            </View>
            <View style={styles.dataContentRow}>
              <View style={[styles.circle, styles.grayCircle]} />
              <Text style={styles.dataLabel}>血糖: </Text>
              <Text style={styles.dataValue}>{todayBloodSugar}</Text>
            </View>
            <View style={styles.dataContentRow}>
              <View style={[styles.circle, styles.blueCircle]} />
              <Text style={styles.dataLabel}>剩余任务数: </Text>
              <Text style={styles.dataValue}>{remainingTasks}</Text>
            </View>
          </View>
        </View>

        <View style={styles.stepsContainer}>
          <View style={styles.stepsHeader}>
            <Text style={styles.sectionTitle}>近期步数</Text>
            <Button title="设备" onPress={() => {}} />
          </View>
          <View style={styles.chartPlaceholder}>
            <Text style={styles.chartText}>CHART</Text>
          </View>
        </View>

        <View style={styles.reportButtonContainer}>
          <Button title="生成健康报告" onPress={() => {}} />
        </View>
      </ScrollView>

      <BottomNavigation />

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          {updateType === 'select' ? (
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>选择要更新的项目</Text>
              <Button title="更新血压" onPress={() => handleUpdateClick('blood pressure')} />
              <Button title="更新血糖" onPress={() => handleUpdateClick('blood sugar')} />
              <Button title="取消" onPress={() => setModalVisible(false)} />
            </View>
          ) : (
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>更新{updateType === 'blood pressure' ? '血压' : '血糖'}</Text>
              <TextInput
                style={styles.input}
                placeholder={`输入${updateType === 'blood pressure' ? '血压' : '血糖'}`}
                value={updateType === 'blood pressure' ? bloodPressure : bloodSugar}
                onChangeText={updateType === 'blood pressure' ? setBloodPressure : setBloodSugar}
                keyboardType="numeric"
              />
              <Button title="保存" onPress={handleSaveValues} />
              <Button title="取消" onPress={() => setModalVisible(false)} />
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    paddingBottom: 60,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  dateText: {
    fontSize: 16,
    marginBottom: 16,
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  scoreText: {
    fontSize: 48,
    color: 'red',
  },
  scoreLabel: {
    fontSize: 18,
  },
  healthDataContainer: {
    width: '100%',
    marginBottom: 16,
  },
  dataBox: {
    backgroundColor: '#d3d3d3',
    padding: 16,
    borderRadius: 8,
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  dataContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dataLabel: {
    fontSize: 16,
  },
  dataValue: {
    fontSize: 16,
    marginLeft: 8,
  },
  circle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'green',
    marginRight: 8,
  },
  grayCircle: {
    backgroundColor: 'gray',
  },
  blueCircle: {
    backgroundColor: 'blue',
  },
  stepsContainer: {
    width: '100%',
    marginBottom: 16,
  },
  stepsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  chartPlaceholder: {
    backgroundColor: '#d3d3d3',
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  chartText: {
    fontSize: 24,
  },
  reportButtonContainer: {
    width: '100%',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    marginBottom: 16,
    padding: 8,
    borderRadius: 4,
  },
});

export default DataScreen;
