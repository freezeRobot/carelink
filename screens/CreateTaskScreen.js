import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { Picker } from '@react-native-picker/picker';

const CreateTaskScreen = () => {
  const [taskName, setTaskName] = useState('');
  const [taskType, setTaskType] = useState('Diet'); 
  const [taskDescription, setTaskDescription] = useState('');
  const [targetTime, setTargetTime] = useState('');
  const [taskPeriod, setTaskPeriod] = useState('Morning'); 
  const navigation = useNavigation();
  const firestore = getFirestore();
  const auth = getAuth();

  const handleCreateTask = async () => {
    if (!taskName || !taskDescription || !targetTime) {
      Alert.alert('Incomplete', 'Please fill out all fields.');
      return;
    }
  
    // 检测目标时间格式是否正确 (格式：HH:MM)
    const timeFormat = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeFormat.test(targetTime)) {
      Alert.alert('Invalid Time', 'Please enter a valid target time in HH:MM format.');
      return;
    }
  
    try {
      const user = auth.currentUser;
      if (user) {
        const today = new Date();
        const timestamp = today.toISOString().split('T')[0];
        const uid = user.uid;
  
        const tasksRef = collection(firestore, 'tasks');
        await addDoc(tasksRef, {
          uid,
          date: timestamp,
          taskName,
          taskType,
          taskDescription,
          targetTime,
          taskPeriod, // 新增的时间段属性
          isCompleted: false,
          createdAt: new Date(),
        });
  
        navigation.navigate('TaskListScreen');
      }
    } catch (error) {
      console.error('Error creating task: ', error.message);
    }
  };
  

  const handleCancel = () => {
    navigation.navigate('TaskListScreen');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>New Task</Text>
      <TextInput
        style={styles.input}
        placeholder="Title"
        value={taskName}
        onChangeText={setTaskName}
        maxLength={20}
      />
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={taskType}
          style={styles.picker}
          onValueChange={(itemValue) => setTaskType(itemValue)}
        >
          <Picker.Item label="Diet" value="Diet" />
          <Picker.Item label="Exercise" value="Exercise" />
          <Picker.Item label="Medical" value="Medical" />
        </Picker>
      </View>
      <View style={styles.row}>
        <View style={styles.halfPickerContainer}>
          <Picker
            selectedValue={taskPeriod}
            style={styles.picker}
            onValueChange={(itemValue) => setTaskPeriod(itemValue)}
          >
            <Picker.Item label="Morning" value="Morning" />
            <Picker.Item label="Afternoon" value="Afternoon" />
            <Picker.Item label="Evening" value="Evening" />
          </Picker>
        </View>
        <TextInput
          style={styles.halfInput}
          placeholder="00:00"
          value={targetTime}
          onChangeText={setTargetTime}
          keyboardType="numeric"
        />
      </View>
      <TextInput
        style={styles.textArea}
        placeholder="Description"
        value={taskDescription}
        onChangeText={setTaskDescription}
        multiline={true}
        maxLength={200}
      />
      <View style={styles.buttonContainer}>
      <View style={styles.button}>
        <Button title="Create" onPress={handleCreateTask} color='#f4a261' />
        </View>
        <Button title="Cancel" onPress={handleCancel} color='gray' />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8f8f8',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    marginBottom: 16,
    padding: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  halfInput: {
    flex: 1,
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    marginBottom: 16,
    padding: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
    marginLeft: 8, 
  },
  textArea: {
    height: 100,
    borderColor: '#ddd',
    borderWidth: 1,
    marginBottom: 16,
    padding: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  pickerContainer: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 4,
    marginBottom: 16,
    justifyContent: 'center',
  },
  halfPickerContainer: {
    flex: 1,
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 4,
    marginBottom: 16,
    justifyContent: 'center',
  },
  picker: {
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonContainer: {
    marginTop: 16,
  },
  button: {
    marginBottom: 16,
  },
});

export default CreateTaskScreen;
