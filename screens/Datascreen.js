import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, ScrollView, Modal, TextInput, Alert, TouchableOpacity,SafeAreaView } from 'react-native';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import BottomNavigation from './BottomNavigation';
import { getFirestore, doc, setDoc,collection,query,where,getDocs,orderBy} from 'firebase/firestore';
import { useAuth } from '../AuthContext';
import { getMockSteps } from '../apis/stepApi'; 
import DonutChart from '../charts/ParentChartF';
import SugarChart from '../charts/ParentChartS';
import ChildViewPressure from '../charts/ChildChartP';
import ChildViewSugar from '../charts/ChildChartS';
import ChildViewStep from '../charts/ChildChartF'; 
import LineP from '../charts/ParentChartP';
import { fetchTasks } from './TaskListScreen'; 
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { onSnapshot } from 'firebase/firestore';

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
    goal:0,
  });
  const [tasks, setTasks] = useState({ todo: [], done: [] });
  const [remainingTasks, setRemainingTasks] = useState(0);
  const [pastHealthData, setPastHealthData] = useState([]); // Store past health data
  const [currentView, setCurrentView] = useState('pressure'); //Manage the currently displayed view
  const [chartsLoaded, setChartsLoaded] = useState(false);//Control chart loading order
  const [pressureChartLoaded, setPressureChartLoaded] = useState(false);
  const [sugarChartLoaded, setSugarChartLoaded] = useState(false);
  const [stepsChartLoaded, setStepsChartLoaded] = useState(false);
  const [doneCount, setDoneCount] = useState(0);
  const [goalInput, setGoalInput] = useState(''); 
  const [goalModalVisible, setGoalModalVisible] = useState(false); 
  

  const auth = getAuth();
  const firestore = getFirestore();
  const { role } = useAuth(); // Get user role

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (user) {
        //Add a real-time listener to monitor data changes
        const today = new Date().toISOString().split('T')[0];
        const healthDataRef = query(collection(firestore, 'healthData'), where("uid", "==", user.uid), where("timestamp", "==", today));
        // Set up a real-time listener to obtain health data    
        const unsubscribeSnapshot = onSnapshot(healthDataRef, (snapshot) => {
          if (!snapshot.empty) {
            const healthDataDoc = snapshot.docs[0].data().HealthData;
            setTodayHealthData({
              bloodPressure: healthDataDoc.bloodPressure || { systolic: 0, diastolic: 0 },
              bloodSugar: healthDataDoc.bloodSugar || 0,
              steps: healthDataDoc.steps || 0,
              goal: healthDataDoc.goal || 0,
            });

            
            fetchPastDaysHealthData(user.uid, new Date()).then(data => {
              setPastHealthData(data); 
              // Delay setting of chart loading status
              setTimeout(() => {
                setPressureChartLoaded(true);  
              }, 500); 

              setTimeout(() => {
                setSugarChartLoaded(true);    
              }, 500);

              setTimeout(() => {
                setStepsChartLoaded(true);     
              }, 500); 
            });
          }
        });

        fetchTasks(firestore, user.uid, setTasks, setRemainingTasks, setDoneCount);

        return () => {
          unsubscribeSnapshot(); // Clean up the real-time listener
        };
      }
    });

    return () => unsubscribe();
  }, [auth, firestore]);
    // Get todaydata from Firestore
  const fetchTodayValues = async (user) => {
    const uid = user.uid;
    const today = new Date();
    const timestamp = today.toISOString().split('T')[0];
    
    const healthDataRef = collection(firestore, 'healthData');
    const q = query(healthDataRef, where("uid", "==", uid), where("timestamp", "==", timestamp));
    const querySnapshot = await getDocs(q);
  
    if (!querySnapshot.empty) {
      const healthDataDoc = querySnapshot.docs[0];
      const data = healthDataDoc.data().HealthData;
      setTodayHealthData({
        bloodPressure: data.bloodPressure || { systolic: 0, diastolic: 0 },
        bloodSugar: data.bloodSugar || 0,
        steps: data.steps || 0,
        goal: data.goal || 0,
      });
    } else {
      setTodayHealthData({
        bloodPressure: { systolic: 0, diastolic: 0 },
        bloodSugar: 0,
        steps: 0,
        goal: 0,
      });
    }
  
    setChartsLoaded(true); 
  };
   // Get pastdata from Firestore
  const fetchPastDaysHealthData = async (uid, currentDate) => {
    const healthDataCollection = collection(firestore, 'healthData');
    const data = [];

    
    const startDate = new Date(currentDate);
    startDate.setDate(currentDate.getDate() - 5);
    const endDate = new Date(currentDate);

   //Convert date to string format YYYY-MM-DD
    const startDateString = startDate.toISOString().split('T')[0];
    const endDateString = endDate.toISOString().split('T')[0];
   //Query data within the specified date range
    const q = query(
        healthDataCollection,
        where("uid", "==", uid),
        where("timestamp", ">=", startDateString),
        where("timestamp", "<=", endDateString),
        orderBy("timestamp", "asc")
    );
      // Get query
    const querySnapshot = await getDocs(q);
    // Iterate through the next 6 days starting from startDate
    for (let i = 0; i <= 5; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        const dateString = date.toISOString().split('T')[0];

        const docSnap = querySnapshot.docs.find(doc => doc.data().timestamp === dateString);
        if (docSnap) {
            data.push({
                date: dateString,
                bloodPressure: docSnap.data().HealthData.bloodPressure || { systolic: 0, diastolic: 0 },
                bloodSugar: docSnap.data().HealthData.bloodSugar || 0,
                steps: docSnap.data().HealthData.steps || 0,
                goal: docSnap.data().HealthData.goal || 0,
            });
        } else {
            data.push({
                date: dateString,
                bloodPressure: { systolic: 0, diastolic: 0 },
                bloodSugar: 0,
                steps: 0,
                goal: 0,
            });
        }
    }
    return data;
};

//Save data function
const handleSaveValues = async () => {
  if (user) {
    const uid = user.uid;
    const today = new Date();
    const timestamp = today.toISOString().split('T')[0];
    const healthDataCollection = collection(firestore, 'healthData');// Get a reference to the 'healthData' collection
    const q = query(healthDataCollection, where("uid", "==", uid), where("timestamp", "==", timestamp));// Build a query to find matching documents
    const querySnapshot = await getDocs(q);
    let healthDataDocRef;
    let existingData = {
      bloodPressure: { systolic: 0, diastolic: 0 },
      bloodSugar: 0,
      steps: 0,
      goal: 0,
    };
    if (!querySnapshot.empty) {
      const existingDoc = querySnapshot.docs[0];
      healthDataDocRef = existingDoc.ref;
      existingData = existingDoc.data().HealthData;
    } else {
      healthDataDocRef = doc(healthDataCollection);
    }
    // Get query currentdata from Firestore
    const currentData = {
      bloodPressure: updateType === 'blood pressure' ? {
        systolic: parseInt(systolicPressure, 10),
        diastolic: parseInt(diastolicPressure, 10)
      } : existingData.bloodPressure,
      bloodSugar: updateType === 'blood sugar' ? parseFloat(bloodSugar) : existingData.bloodSugar,
      steps: existingData.steps,
      goal: existingData.goal,
    };
    await setDoc(healthDataDocRef, {
      uid,
      HealthData: currentData,
      timestamp: timestamp,
    }, { merge: true });
// Update todayHealthData status immediately
    setTodayHealthData(currentData);
//Update the data of the child perspective chart
    await fetchTodayValues(user);
    const updatedPastData = await fetchPastDaysHealthData(uid, today);
    setPastHealthData(updatedPastData); // Update pastHealthData
    setModalVisible(false);
    setUpdateType(null);
    setGoalInput('');
  }
};
  //Get type of update data
  const handleUpdateClick = (type) => {
    setUpdateType(type);
    setModalVisible(true);
  };
  //connect to device
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
              const steps = await getMockSteps();  // Get simulation step data
              const goal = 0;  
              const uid = user.uid;
              const today = new Date();
              const timestamp = today.toISOString().split('T')[0]; 
  
              //update healthydata
              const healthDataCollection = collection(firestore, 'healthData');
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
                const existingDoc = querySnapshot.docs[0];
                healthDataDocRef = existingDoc.ref; 
                existingData = existingDoc.data().HealthData;
              } else {
                healthDataDocRef = doc(healthDataCollection);
              }
              const currentData = {
                bloodPressure: existingData.bloodPressure,
                bloodSugar: existingData.bloodSugar,
                steps: steps,
                goal: existingData.goal !== undefined ? existingData.goal : goal, 
              };
  
             //Update or create document
              await setDoc(healthDataDocRef, {
                uid,
                HealthData: currentData,
                timestamp: timestamp, 
              }, { merge: true });

              fetchTodayValues(user);
            }
          },
        },
      ],
    );
  };
  //update goal
  const handleUpdateGoal = async () => {
    if (user && goalInput !== '') {
      const uid = user.uid;
      const today = new Date();
      const timestamp = today.toISOString().split('T')[0];
  
      const healthDataCollection = collection(firestore, 'healthData');
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
        const existingDoc = querySnapshot.docs[0];
        healthDataDocRef = existingDoc.ref;
        existingData = existingDoc.data().HealthData;
      } else {
        healthDataDocRef = doc(healthDataCollection);
      }
  
      const currentData = {
        bloodPressure: existingData.bloodPressure,
        bloodSugar: existingData.bloodSugar,
        steps: existingData.steps,
        goal: parseInt(goalInput, 10),
      };
  
      await setDoc(healthDataDocRef, {
        uid,
        HealthData: currentData,
        timestamp: timestamp,
      }, { merge: true });
  
      //Update chart data
      const updatedPastData = await fetchPastDaysHealthData(uid, today);
      setPastHealthData(updatedPastData);
      setTodayHealthData(currentData);

      setGoalModalVisible(false);
      setGoalInput('');
    }
  };
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
  
  const toggleView = () => {
    setCurrentView((prevView) => (prevView === 'pressure' ? 'sugar' : 'pressure'));
  };

 return (
  <SafeAreaView style={styles.safeArea}>
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
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ marginRight: 38, marginTop: 4,color: 'black', fontSize: 16 }}>Switch</Text> 
                <TouchableOpacity onPress={toggleView} style={styles.iconButton}>
                  <FontAwesomeIcon icon="fa-solid fa-left-right" size={20} color="black" />
                </TouchableOpacity>
                </View>
              </View>
              {pressureChartLoaded && (
                <View style={styles.chartContainer}>
                  {currentView === 'pressure' ? (
                    <ChildViewPressure data={pastHealthData.map(data => ({
                      date: data.date,
                      systolic: data.bloodPressure?.systolic || 0,  
                      diastolic: data.bloodPressure?.diastolic || 0
                    }))} />
                  ) : (
                    <ChildViewSugar data={pastHealthData.map(data => ({
                      date: data.date,
                      bloodSugar: data.bloodSugar || 0,
                    }))} />
                  )}
                </View>
              )}
            </View>
            <View style={styles.healthDataContainer}>
              <View style={styles.dataRow}>
                <View style={styles.titleWithIcon}>
                  <FontAwesomeIcon icon="fa-solid fa-shoe-prints" size={20} color="red" />
                  <Text style={styles.sectionTitle}>Recent Steps</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ marginRight: 38, marginTop: 4,color: 'black', fontSize: 16 }}>Goal</Text> 
                <TouchableOpacity style={styles.iconButton} onPress={() => setGoalModalVisible(true)}>
                  <FontAwesomeIcon icon="fa-solid fa-bullseye" size={20} color="red" />
                </TouchableOpacity>
                </View>
              </View>
              {pressureChartLoaded && sugarChartLoaded && (
                <View style={styles.chartContainer}>
                <ChildViewStep 
                  data={pastHealthData.map(data => ({
                  date: data.date,
                  steps: data.steps || 0,             
                  }))} 
                   todayGoal={todayHealthData.goal} // Pass today's goal
                />
                </View>
              )}
            </View>
          </>
        )}

        {role === 'parent' && (
          <>
            <View style={styles.TodoContainer}>
              <Text style={styles.TodoText}>{remainingTasks}</Text>
              <Text>ToDo</Text>
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
                  <Text style={styles.referenceText}> Systolic(90-140)</Text>
                  <Text style={styles.referenceText}> Diastolic(60-90)</Text>
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
              <View style={styles.stepsContent}>
              <DonutChart steps={todayHealthData.steps} goal={todayHealthData.goal} />
              </View>
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
              <CustomButton title="Cancel" onPress={() => setModalVisible(false)}  />
            </View>
          ) : (
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Update {updateType === 'blood pressure' ? 'Blood Pressure' : 'Blood Sugar'}</Text>
              {updateType === 'blood pressure' ? (
                <>
                  <Text>Systolic Pressure</Text>
                  <UnitInput
                    value={systolicPressure}
                    onChangeText={setSystolicPressure}
                    placeholder="0"
                    unit="mmHg"
                  />
                  <Text>Diastolic Pressure</Text>
                  <UnitInput
                    value={diastolicPressure}
                    onChangeText={setDiastolicPressure}
                    placeholder="0"
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
      <Modal
        animationType="slide"
        transparent={true}
        visible={goalModalVisible}
       onRequestClose={() => setGoalModalVisible(false)}
        >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>Update Goal</Text>
        <UnitInput
        value={goalInput}
        onChangeText={setGoalInput}
        placeholder="Enter goal"
        unit="steps"
        />
        <CustomButton title="Save" onPress={handleUpdateGoal} />
        <CustomButton title="Cancel" onPress={() => setGoalModalVisible(false)} />
      </View>
      </View>
      </Modal>
    </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    paddingBottom: 60,
    paddingTop: 30, 
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
  TodoContainer: {
    alignItems: 'center',
    marginBottom: 8,
    marginTop:4,
  },
  TodoText: {
    fontSize: 28,
    color: 'red',
  },
  healthDataContainer: {
    width: '100%',
    backgroundColor: 'white',
    marginTop: 10,
    marginBottom: 5, 
    borderWidth: 1, 
    borderColor: '#d3d3d3', 
    borderRadius: 8, 
    padding: 10, 
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
    fontSize: 24, 
    fontWeight: 'bold',
  },
  dataBoxUnit: {
    fontSize: 16, 
    color: 'gray', 
  },
  referenceText: {
    fontSize: 16,
    color: 'gray',
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stepsContainer: {
    borderWidth: 1, 
    borderColor: '#d3d3d3', 
    borderRadius: 8, 
    padding: 10, 
    width: '100%',
    backgroundColor: 'white',
    marginBottom: 16,
    marginTop:10,
  },
  stepsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
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
    marginLeft: 10, 
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 16,
    marginLeft: 8, 
  },
  iconButton: {
    position: 'absolute',
    top: 5,
    right: 10,
  },
  safeArea: {
    flex: 1,
  },
});

export default DataScreen;