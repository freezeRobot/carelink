import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { Picker } from '@react-native-picker/picker';

const CreateTaskScreen = () => {
  const [taskName, setTaskName] = useState('');
  const [taskType, setTaskType] = useState('饮食');
  const [taskDescription, setTaskDescription] = useState('');
  const [targetTime, setTargetTime] = useState('');
  const [taskPeriod, setTaskPeriod] = useState('早上'); // 新增状态
  const navigation = useNavigation();
  const firestore = getFirestore();
  const auth = getAuth();

  const handleCreateTask = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const today = new Date();
        const timestamp = today.toISOString().split('T')[0];
        const uid = user.uid;

        const tasksRef = collection(firestore, 'tasks');
        const docRef = await addDoc(tasksRef, {
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>新任务</Text>
      <TextInput
        style={styles.input}
        placeholder="名称"
        value={taskName}
        onChangeText={setTaskName}
      />
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={taskType}
          style={styles.picker}
          onValueChange={(itemValue) => setTaskType(itemValue)}
        >
          <Picker.Item label="饮食" value="饮食" />
          <Picker.Item label="运动" value="运动" />
          <Picker.Item label="医疗" value="医疗" />
        </Picker>
      </View>
      <View style={styles.row}>
        <View style={styles.halfPickerContainer}>
          <Picker
            selectedValue={taskPeriod}
            style={styles.picker}
            onValueChange={(itemValue) => setTaskPeriod(itemValue)}
          >
            <Picker.Item label="早上" value="早上" />
            <Picker.Item label="下午" value="下午" />
            <Picker.Item label="晚上" value="晚上" />
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
        placeholder="描述"
        value={taskDescription}
        onChangeText={setTaskDescription}
        multiline={true}
      />
      <Button title="创建" onPress={handleCreateTask} color='#f4a261' />
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
    marginLeft: 8, // Add some space between the picker and the input
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
});

export default CreateTaskScreen;

