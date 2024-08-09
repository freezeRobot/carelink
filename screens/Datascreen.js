import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, ScrollView, Modal, TextInput, Alert, TouchableOpacity } from 'react-native';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import BottomNavigation from './BottomNavigation';
import { getFirestore, doc, setDoc, getDoc, addDoc,collection,query,where,getDocs} from 'firebase/firestore';
import { useAuth } from '../AuthContext';
import { getMockSteps } from '../apis/stepApi'; // 更新引用路径
import SimpleDonutChart from '../charts/SimpleDonutChart';
import SugarChart from '../charts/SugarChart';
import ChildViewPressure from '../charts/ChildChartP';
import ChildViewSugar from '../charts/ChildChartS';
import ChildViewStep from '../charts/ChildChartF'; // 确保路径正确
import LineP from '../charts/LineP'; //血压线
import { fetchTasks } from './TaskListScreen'; // 导入 fetchTasks 函数
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';

const CustomButton = ({ title, onPress, style }) => (
  <TouchableOpacity style={[styles.customButton, style]} onPress={onPress}>
    <Text style={[styles.customButtonText, style === styles.cancelButton && styles.cancelButtonText]}>{title}</Text>
  </TouchableOpacity>
);

const IconButton = ({ onPress }) => (
  <TouchableOpacity onPress={onPress}>
    <FontAwesomeIcon icon="fa-regular fa-calendar-days" size={20} />
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
  const [todayHealthData, setTodayHealthData] = useState({
    bloodPressure: { systolic: 0, diastolic: 0 },
    bloodSugar: 0,
    steps: 0,
  });
  const [tasks, setTasks] = useState({ todo: [], done: [] });
  const [remainingTasks, setRemainingTasks] = useState(0);
  const [doneCount, setDoneCount] = useState(0);
  const [pastHealthData, setPastHealthData] = useState([]); // 存储过去的健康数据
  const [currentView, setCurrentView] = useState('pressure'); // 管理当前显示的视图
  const [chartsLoaded, setChartsLoaded] = useState(false); // 控制图表加载顺序

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

    const healthDataRef = doc(firestore, 'healthData', `${uid}_${timestamp}`);
    const healthDataDoc = await getDoc(healthDataRef);

    if (healthDataDoc.exists()) {
      const data = healthDataDoc.data().HealthData;
      setTodayHealthData({
        bloodPressure: data.BloodPressure,
        bloodSugar: data.BloodSugar,
        steps: data.Steps,
      });
    } else {
      setTodayHealthData({
        bloodPressure: { systolic: 0, diastolic: 0 },
        bloodSugar: 0,
        steps: 0,
      });
    }

    const pastDaysHealthData = await fetchPastDaysHealthData(uid, today);
    setPastHealthData(pastDaysHealthData);

    setChartsLoaded(true); // 设置图表加载完成
  };

  const fetchPastDaysHealthData = async (uid, currentDate) => {
    const dates = [];
    const data = [];
    for (let i = -5; i <= 0; i++) {
      const date = new Date(currentDate);
      date.setDate(currentDate.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }

    for (const date of dates) {
      const ref = doc(firestore, 'healthData', `${uid}_${date}`);
      const docSnap = await getDoc(ref);
      if (docSnap.exists()) {
        data.push({
          date,
          bloodPressure: docSnap.data().HealthData.BloodPressure,
          bloodSugar: docSnap.data().HealthData.BloodSugar,
          steps: docSnap.data().HealthData.Steps,
        });
      } else {
        data.push({
          date,
          bloodPressure: { systolic: 0, diastolic: 0 },
          bloodSugar: 0,
          steps: 0,
        });
      }
    }

    return data;
  };


  const handleSaveValues = async () => {
    if (user) {
      const uid = user.uid;
      const today = new Date();
      const timestamp = today.toISOString().split('T')[0]; // 仅保留 YYYY-MM-DD 部分
  
      // 获取当前用户的健康数据集合的引用
      const healthDataCollection = collection(firestore, 'healthData');
  
      // 创建查询以查找当前用户和当天的文档
      const q = query(healthDataCollection, where("uid", "==", uid), where("timestamp", "==", timestamp));
      const querySnapshot = await getDocs(q);
  
      let healthDataDocRef;
      let existingData = {
        bloodPressure: { systolic: 0, diastolic: 0 },
        bloodSugar: 0,
        steps: 0,
        goal: 0,
      };
  
      if (!querySnapshot.empty) {
        // 获取现有文档的引用
        const existingDoc = querySnapshot.docs[0];
        healthDataDocRef = existingDoc.ref;
        existingData = existingDoc.data().HealthData;
      } else {
        // 如果没有找到文档，创建新文档
        healthDataDocRef = doc(healthDataCollection);
      }
  
      // 初始化 currentData 并保留现有数据
      const currentData = {
        bloodPressure: existingData.bloodPressure,
        bloodSugar: existingData.bloodSugar,
        steps: existingData.steps,
        goal: existingData.goal,
      };
  
      // 根据更新类型更新数据
      if (updateType === 'blood pressure') {
        currentData.bloodPressure = {
          systolic: systolicPressure !== undefined ? systolicPressure : currentData.bloodPressure.systolic,
          diastolic: diastolicPressure !== undefined ? diastolicPressure : currentData.bloodPressure.diastolic,
        };
      } else if (updateType === 'blood sugar') {
        currentData.bloodSugar = bloodSugar !== undefined ? bloodSugar : currentData.bloodSugar;
      } else if (updateType === 'steps') {
        currentData.steps = steps !== undefined ? steps : currentData.steps;
        currentData.goal = goal !== undefined ? goal : currentData.goal;
      }
  
      // 更新或创建文档
      await setDoc(healthDataDocRef, {
        uid,
        HealthData: currentData,
        timestamp: timestamp, // 仅保留 YYYY-MM-DD
      }, { merge: true });
  
      setModalVisible(false);
      setUpdateType(null); // 重置更新类型
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
          style: "cancel",
        },
        {
          text: "Yes",
          onPress: async () => {
            if (user) {
              const steps = await getMockSteps();  // 获取模拟步数数据
              const goal = 5000;  // 设置默认目标值，例如5000步
              const uid = user.uid;
              const today = new Date();
              const timestamp = today.toISOString().split('T')[0]; // 仅保留 YYYY-MM-DD 部分
  
              // 获取当前用户的健康数据集合的引用
              const healthDataCollection = collection(firestore, 'healthData');
  
              // 创建查询以查找当前用户和当天的文档
              const q = query(healthDataCollection, where("uid", "==", uid), where("timestamp", "==", timestamp));
              const querySnapshot = await getDocs(q);
  
              let healthDataDocRef;
              let existingData = {
                bloodPressure: { systolic: 0, diastolic: 0 },
                bloodSugar: 0,
                steps: 0,
                goal: 0,
              };
  
              // 检查当天是否已经存在文档
              if (!querySnapshot.empty) {
                // 获取现有文档的引用
                const existingDoc = querySnapshot.docs[0];
                healthDataDocRef = existingDoc.ref; // 使用现有文档的引用
                existingData = existingDoc.data().HealthData;
              } else {
                // 如果不存在文档，则创建新文档
                healthDataDocRef = doc(healthDataCollection);
              }
  
              // 更新步数和目标，同时保留其他数据
              const currentData = {
                bloodPressure: existingData.bloodPressure,
                bloodSugar: existingData.bloodSugar,
                steps: steps,
                goal: existingData.goal !== undefined ? existingData.goal : goal, // 如果存在目标值则保留，否则设置为默认值
              };
  
              // 更新或创建文档
              await setDoc(healthDataDocRef, {
                uid,
                HealthData: currentData,
                timestamp: timestamp, // 仅保留 YYYY-MM-DD
              }, { merge: true });
  
              // 重新获取当天的数据
              fetchTodayValues(user);
            }
          },
        },
      ],
    );
  };
  
  
  
  

  const toggleView = () => {
    setCurrentView((prevView) => (prevView === 'pressure' ? 'sugar' : 'pressure'));
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>My Healthy Data</Text>
        <View style={styles.iconContainer}>
          <FontAwesomeIcon icon="fa-regular fa-calendar-days" size={20} />
          <Text style={styles.iconText}> {new Date().toISOString().split('T')[0]}</Text>
        </View>

        {role === 'child' && (
          <>
            <View style={styles.healthDataContainer}>
              <View style={styles.dataRow}>
                <View style={styles.titleWithIcon}>
                  <FontAwesomeIcon icon="fa-solid fa-file-medical" size={20} color="red" />
                  <Text style={styles.sectionTitle}>Health Data</Text>
                </View>
                <TouchableOpacity onPress={toggleView} style={styles.iconButton}>
                  <FontAwesomeIcon icon="fa-solid fa-left-right" size={20} color="black" />
                </TouchableOpacity>
              </View>
              {chartsLoaded && (
                <View style={styles.chartContainer}>
                  {currentView === 'pressure' ? (
                    <ChildViewPressure data={pastHealthData.map(data => ({
                      date: data.date,
                      systolic: data.bloodPressure.systolic,
                      diastolic: data.bloodPressure.diastolic,
                    }))} />
                  ) : (
                    <ChildViewSugar data={pastHealthData.map(data => ({
                      date: data.date,
                      bloodSugar: data.bloodSugar,
                    }))} />
                  )}
                </View>
              )}
            </View>
            <View style={styles.healthDataContainer}>
              <View style={styles.dataRow}>
                <View style={styles.titleWithIcon}>
                  <FontAwesomeIcon icon="fa-solid fa-shoe-prints" size={20} color="red" />
                  <Text style={styles.sectionTitle}>Today's Steps</Text>
                </View>
                <TouchableOpacity style={styles.iconButton}>
                  <FontAwesomeIcon icon="fa-solid fa-bullseye" size={20} color="red" />
                </TouchableOpacity>
              </View>
              {chartsLoaded && (
                <View style={styles.chartContainer}>
                  <ChildViewStep data={pastHealthData.map(data => ({
                    date: data.date,
                    steps: data.steps,
                  }))} />
                </View>
              )}
            </View>
          </>
        )}

        {role === 'parent' && (
          <>
            <View style={styles.scoreContainer}>
              <Text style={styles.scoreText}>{remainingTasks}</Text>
              <Text style={styles.scoreLabel}>ToDo</Text>
            </View>
            <View style={styles.healthDataContainer}>
              <View style={styles.dataRow}>
                <View style={styles.titleWithIcon}>
                  <FontAwesomeIcon icon="fa-solid fa-file-medical" size={20} color="red" />
                  <Text style={styles.sectionTitle}>Today's Health</Text>
                </View>
                <Button title="Update" onPress={() => handleUpdateClick('select')} color="#f4a261" />
              </View>
              <View style={styles.dataBoxContainer}>
                <View style={styles.dataBox}>
                  <Text style={styles.dataBoxTitle2}>Blood Pressure</Text>
                  <LineP systolic={todayHealthData?.bloodPressure?.systolic || 0} diastolic={todayHealthData?.bloodPressure?.diastolic || 0} />
                  <View style={styles.dataBoxValueContainer}>
                    <Text style={styles.dataBoxValue}>
                      {todayHealthData?.bloodPressure?.systolic === 0 && todayHealthData?.bloodPressure?.diastolic === 0 
                        ? '0/0'
                        : `${todayHealthData?.bloodPressure?.systolic || 0}/${todayHealthData?.bloodPressure?.diastolic || 0}`}
                    </Text>
                    <Text style={styles.dataBoxUnit}> mmHg</Text>
                  </View>
                  <Text style={styles.referenceText}>Normal Systolic(90-140)</Text>
                  <Text style={styles.referenceText}>Normal Diastolic(60-90)</Text>
                </View>
                <View style={styles.dataBox}>
                  <Text style={styles.dataBoxTitle1}>Blood Sugar</Text>
                  <SugarChart bloodSugar={parseFloat(todayHealthData.bloodSugar)} />
                  <View style={styles.dataBoxValueContainer}>
                    <Text style={styles.dataBoxValue}>
                      {parseFloat(todayHealthData.bloodSugar) === 0 ? '0.0' : parseFloat(todayHealthData.bloodSugar)}
                    </Text>
                    <Text style={styles.dataBoxUnit}> mmol/L</Text>
                  </View>
                  <Text style={styles.referenceText}>Normal(4.4-7.0)</Text>
                </View>
              </View>
            </View>
          </>
        )}

        {role === 'parent' && (
          <View style={styles.stepsContainer}>
            <View style={styles.stepsHeader}>
              <View style={styles.titleWithIcon}>
                <FontAwesomeIcon icon="fa-solid fa-shoe-prints" size={20} color="red" />
                <Text style={styles.sectionTitle}>Today's Steps</Text>
              </View>
              <Button title="Device" onPress={handleDeviceClick} color="#f4a261" />
            </View>
            {chartsLoaded && (
              <View style={styles.stepsContent}>
                <SimpleDonutChart steps={todayHealthData.steps} />
              </View>
            )}
          </View>
        )}
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
    color: '#f4a261',
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
    marginBottom: 8,
  },
  scoreText: {
    fontSize: 28,
    color: 'red',
  },
  scoreLabel: {
    fontSize: 14,
  },
  healthDataContainer: {
    width: '100%',
    backgroundColor: 'white',
    marginBottom: 10, // Add marginBottom to create space below the chart
    borderWidth: 1, // Add border width
    borderColor: '#d3d3d3', // Add border color
    borderRadius: 8, // Add border radius if needed
    padding: 10, // Add padding to create space inside the border
  },
  dataBoxContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dataBox: {
    width: '45%',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  dataBoxTitle1: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  dataBoxTitle2: {
    fontSize: 16,
    fontWeight: 'bold',
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
  referenceText: {
    fontSize: 12,
    color: 'gray',
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stepsContainer: {
    marginBottom: 20, // Add marginBottom to create space below the chart
    borderWidth: 1, // Add border width
    borderColor: '#d3d3d3', // Add border color
    borderRadius: 8, // Add border radius if needed
    padding: 10, // Add padding to create space inside the border
    width: '100%',
    backgroundColor: 'white',
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
  chartContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10, // 这里可以调整间距
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 14,
    marginLeft: 8, // 添加左边距以在图标和文本之间创建空间
  },
  iconButton: {
    position: 'absolute',
    top: 5,
    right: 10,
  },
});

export default DataScreen;