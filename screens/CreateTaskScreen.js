import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getFirestore, collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { Picker } from '@react-native-picker/picker';

const CreateTaskScreen = () => {
  const [taskName, setTaskName] = useState('');
  const [taskType, setTaskType] = useState('饮食');
  const [taskDescription, setTaskDescription] = useState('');
  const [targetTime, setTargetTime] = useState('');
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
        const q = query(tasksRef, where('uid', '==', uid), where('date', '==', timestamp));
        const querySnapshot = await getDocs(q);
        const taskId = querySnapshot.size + 1;

        await addDoc(tasksRef, {
          uid,
          date: timestamp,
          taskId,
          taskName,
          taskType,
          taskDescription,
          targetTime,
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
      <TextInput
        style={styles.textArea}
        placeholder="描述"
        value={taskDescription}
        onChangeText={setTaskDescription}
        multiline={true}
      />
      <TextInput
        style={styles.input}
        placeholder="目标时间"
        value={targetTime}
        onChangeText={setTargetTime}
      />
      <Button title="创建" onPress={handleCreateTask} />
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
  picker: {
    width: '100%',
  },
});

export default CreateTaskScreen;
