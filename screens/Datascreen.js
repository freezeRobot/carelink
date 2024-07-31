import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, ScrollView, Modal, TextInput, Alert, TouchableOpacity } from 'react-native';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import BottomNavigation from './BottomNavigation';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import { useAuth } from '../AuthContext';
import { getMockSteps } from '../apis/stepApi'; // 更新引用路径
import SimpleDonutChart from '../charts/SimpleDonutChart';
import SugarChart from '../charts/SugarChart';
import { fetchTasks } from './TaskListScreen'; // 导入 fetchTasks 函数

const CustomButton = ({ title, onPress, style }) => (
  <TouchableOpacity style={[styles.customButton, style]} onPress={onPress}>
    <Text style={[styles.customButtonText, style === styles.cancelButton && styles.cancelButtonText]}>{title}</Text>
  </TouchableOpacity>
);

const UnitInput = ({ value, onChangeText, placeholder, unit }) => {
  const handleChange = (text) => {
    const numericValue = text.replace(/[^0-9.]/g, '');
    onChangeText(numericValue ? `${numericValue}` : '');
  };

  return (
    <View style={styles.unitInputContainer}>
      <TextInput
        style={styles.unitInput}
        value={value}
        onChangeText={handleChange}
        keyboardType="numeric"
        placeholder={placeholder}
        placeholderTextColor="black"
      />
      <Text style={styles.unitText}>{unit}</Text>
    </View>
  );
};

const DataScreen = () => {
  const [user, setUser] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [updateType, setUpdateType] = useState(null);
  const [systolicPressure, setSystolicPressure] = useState('');
  const [diastolicPressure, setDiastolicPressure] = useState('');
  const [bloodSugar, setBloodSugar] = useState('0.0');
  const [todayBloodPressure, setTodayBloodPressure] = useState({ systolic: 0, diastolic: 0 });
  const [todayBloodSugar, setTodayBloodSugar] = useState(0);
  const [tasks, setTasks] = useState({ todo: [], done: [] });
  const [remainingTasks, setRemainingTasks] = useState(0);
  const [doneCount, setDoneCount] = useState(0);
  const [todaySteps, setTodaySteps] = useState(0); // Default to 0 steps
  const auth = getAuth();
  const firestore = getFirestore();
  const { role } = useAuth(); // 获取用户角色

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (user) {
        fetchTodayValues(user);
        fetchTasks(firestore, user.uid, setTasks, setRemainingTasks, setDoneCount);
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
    const stepsRef = doc(firestore, 'steps', `${uid}_${timestamp}`); // 新增步数文档

    const bloodPressureDoc = await getDoc(bloodPressureRef);
    const bloodSugarDoc = await getDoc(bloodSugarRef);
    const stepsDoc = await getDoc(stepsRef); // 获取步数文档

    if (bloodPressureDoc.exists()) {
      setTodayBloodPressure({
        systolic: bloodPressureDoc.data().systolic,
        diastolic: bloodPressureDoc.data().diastolic
      });
    } else {
      setTodayBloodPressure({ systolic: 0, diastolic: 0 });
    }

    setTodayBloodSugar(bloodSugarDoc.exists() ? bloodSugarDoc.data().value : 0);
    setTodaySteps(stepsDoc.exists() ? stepsDoc.data().value : 0); // 设置步数状态，默认值为0
  };

  const handleSaveValues = async () => {
    if (user) {
      const uid = user.uid;
      const today = new Date();
      const timestamp = today.toISOString().split('T')[0];

      if (updateType === 'blood pressure') {
        const bloodPressureRef = doc(firestore, 'blood pressure', `${uid}_${timestamp}`);
        await setDoc(bloodPressureRef, { uid, systolic: systolicPressure, diastolic: diastolicPressure, timestamp: new Date() }, { merge: true });
      } else if (updateType === 'blood sugar') {
        const bloodSugarRef = doc(firestore, 'blood sugar', `${uid}_${timestamp}`);
        await setDoc(bloodSugarRef, { uid, value: bloodSugar, timestamp: new Date() }, { merge: true });
      }

      setModalVisible(false);
      setUpdateType(null); // Reset update type
      fetchTodayValues(user);
      fetchTasks(firestore, user.uid, setTasks, setRemainingTasks, setDoneCount); // 更新未完成任务数
    }
  };

  const handleUpdateClick = (type) => {
    setUpdateType(type);
    setModalVisible(true);
  };

  const handleDeviceClick = () => {
    Alert.alert(
      "Connect to Smart Tracker",
      "Do you want to connect to the smart tracker?",
      [
        {
          text: "No",
          onPress: () => console.log("No Pressed"),
          style: "cancel"
        },
        {
          text: "Yes", onPress: async () => {
            if (user) {
              const steps = await getMockSteps();
              const uid = user.uid;
              const today = new Date();
              const timestamp = today.toISOString().split('T')[0];
              const stepsRef = doc(firestore, 'steps', `${uid}_${timestamp}`);
  
              const stepsDoc = await getDoc(stepsRef);
  
              if (stepsDoc.exists()) {
                // 如果文档存在，则更新数据
                await setDoc(stepsRef, { value: steps, timestamp: new Date() }, { merge: true });
              } else {
                // 如果文档不存在，则创建新文档
                await setDoc(stepsRef, { uid, value: steps, timestamp: new Date() }, { merge: true });
              }
  
              fetchTodayValues(user);
            }
          }
        }
      ]
    );
  };
  

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>My Healthy Data</Text>
        <Text style={styles.dateText}>Today {new Date().toISOString().split('T')[0]}</Text>

        <View style={styles.scoreContainer}>
          <Text style={styles.scoreText}>{remainingTasks}</Text>
          <Text style={styles.scoreLabel}>ToDo</Text>
        </View>

        {role === 'parent'&&(
          <View style={styles.healthDataContainer}>
          <View style={styles.dataRow}>
            <Text style={styles.sectionTitle}>Today's Health</Text>
            <Button title="Update" onPress={() => handleUpdateClick('select')}color="#f4a261" />
          </View>
          <View style={styles.dataBoxContainer}>
            <View style={styles.dataBox}>
              <Text style={styles.dataBoxTitle}>Blood Pressure</Text>
              <View style={styles.dataBoxValueContainer}>
                <Text style={styles.dataBoxValue}>{todayBloodPressure.systolic === 0 && todayBloodPressure.diastolic === 0 ? '0/0' : `${todayBloodPressure.systolic}/${todayBloodPressure.diastolic}`}</Text>
                <Text style={styles.dataBoxUnit}> mmHg</Text>
              </View>
            </View>
            <View style={styles.dataBox}>
              <Text style={styles.dataBoxTitle}>Blood Sugar</Text>
              <SugarChart bloodSugar={parseFloat(todayBloodSugar)} />
              <View style={styles.dataBoxValueContainer}>
                <Text style={styles.dataBoxValue}>{parseFloat(todayBloodSugar) === 0 ? '0.0' : parseFloat(todayBloodSugar)}</Text>
                <Text style={styles.dataBoxUnit}> mmol/L</Text>
              </View>
            </View>
          </View>
        </View>)}

        {role === 'parent' && (
          <View style={styles.stepsContainer}>
          <View style={styles.stepsHeader}>
            <Text style={styles.sectionTitle}>Recent Steps</Text>
             <Button title="Device" onPress={handleDeviceClick}color="#f4a261" />
          </View>
          <View style={styles.stepsContent}>
          </View>
          <SimpleDonutChart steps={todaySteps} />
          </View>)}
        <View style={styles.reportButtonContainer}>
          <Button title="Health Report" onPress={() => {}} color="#f4a261"/>
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
              <Text style={styles.modalTitle}>Select Data to Update</Text>
              <CustomButton title="Blood Pressure" onPress={() => handleUpdateClick('blood pressure')} />
              <CustomButton title="Blood Sugar" onPress={() => handleUpdateClick('blood sugar')} />
              <CustomButton title="Cancel" onPress={() => setModalVisible(false)} style={styles.cancelButton} />
            </View>
          ) : (
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Update {updateType === 'blood pressure' ? 'Blood Pressure' : 'Blood Sugar'}</Text>
              {updateType === 'blood pressure' ? (
                <>
                  <Text>高压</Text>
                  <UnitInput
                    value={systolicPressure}
                    onChangeText={setSystolicPressure}
                    placeholder="Systolic Pressure"
                    unit="mmHg"
                  />
                  <Text>低压</Text>
                  <UnitInput
                    value={diastolicPressure}
                    onChangeText={setDiastolicPressure}
                    placeholder="Diastolic Pressure"
                    unit="mmHg"
                  />
                </>
              ) : (
                <UnitInput
                  value={bloodSugar}
                  onChangeText={setBloodSugar}
                  placeholder="0.0"
                  unit="mmol/L"
                />
              )}
              <CustomButton title="Save" onPress={handleSaveValues} />
              <CustomButton title="Cancel" onPress={() => setModalVisible(false)} />
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
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  dateText: {
    fontSize: 14,
    marginBottom: 16,
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  scoreText: {
    fontSize: 40,
    color: 'red',
  },
  scoreLabel: {
    fontSize: 14,
  },
  healthDataContainer: {
    width: '100%',
    marginBottom: 16,
  },
  dataBoxContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dataBox: {
    width: '45%',
    backgroundColor: 'white', // 修改背景颜色为白色
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderColor: '#d3d3d3', // 添加边框颜色
    borderWidth: 1, // 添加边框宽度
  },
  dataBoxTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  dataBoxValueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  dataBoxValue: {
    fontSize: 24, // Larger font size for the value
    fontWeight: 'bold',
  },
  dataBoxUnit: {
    fontSize: 16, // Smaller font size for the unit
    color: 'gray', // Gray color for the unit
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
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
  unitInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 4,
    padding: 8,
    marginBottom: 16,
  },
  unitInput: {
    flex: 1,
    height: 40,
    borderColor: 'transparent',
    color: 'black',
    fontSize: 16,
  },
  unitText: {
    marginLeft: 8,
    fontSize: 16,
    color: 'gray',
  },
  customButton: {
    backgroundColor: '#f4a261',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginBottom: 10,
  },
  customButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  },
  cancelButtonText: {
    color: 'black',
  },
});

export default DataScreen;