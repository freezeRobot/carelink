import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Button, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { getFirestore, collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import BottomNavigation from './BottomNavigation';

const TaskListScreen = () => {
  const [tasks, setTasks] = useState({ todo: [], done: [] });
  const navigation = useNavigation();
  const auth = getAuth();
  const firestore = getFirestore();

  useEffect(() => {
    fetchTasks();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchTasks();
    }, [])
  );

  const fetchTasks = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const today = new Date();
        const timestamp = today.toISOString().split('T')[0];
        const tasksRef = collection(firestore, 'tasks');
        const q = query(tasksRef, where('uid', '==', user.uid), where('date', '==', timestamp));
        const querySnapshot = await getDocs(q);
        const todoTasks = [];
        const doneTasks = [];

        querySnapshot.forEach((doc) => {
          const task = doc.data();
          task.id = doc.id; // 保存文档 ID
          if (task.isCompleted) {
            doneTasks.push(task);
          } else {
            todoTasks.push(task);
          }
        });

        setTasks({ todo: todoTasks, done: doneTasks });
      }
    } catch (error) {
      console.error('Error fetching tasks: ', error.message);
    }
  };

  const handleManageTasks = () => {
    Alert.alert(
      '任务管理',
      '是否创建新的任务',
      [
        { text: '否', onPress: () => console.log('取消') },
        { text: '是', onPress: () => navigation.navigate('CreateTaskScreen') },
      ]
    );
  };

  const handleTaskCompletion = (task) => {
    Alert.alert(
      '任务完成',
      '确定该任务已完成吗？',
      [
        { text: '取消', onPress: () => console.log('任务未完成') },
        { text: '确定', onPress: () => updateTaskCompletion(task) },
      ]
    );
  };

  const updateTaskCompletion = async (task) => {
    try {
      const taskRef = doc(firestore, 'tasks', task.id); // 使用正确的文档 ID
      await updateDoc(taskRef, { isCompleted: true });
      fetchTasks(); // 更新任务列表
    } catch (error) {
      console.error('Error updating task: ', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>My To Do’s</Text>
        <Text style={styles.dateText}>Today {new Date().toISOString().split('T')[0]}</Text>
        <Button title="任务管理" onPress={handleManageTasks} style={styles.manageButton} />

        <View style={styles.section}>
          <View style={styles.header}>
            <Text style={styles.headerText}>To Do</Text>
            <Text style={styles.headerText}>数量</Text>
          </View>
          {tasks.todo.map((task, index) => (
            <View style={styles.task} key={index}>
              <Text>{task.taskName}</Text>
              <Text>{task.taskType}</Text>
              <Text>{task.targetTime}</Text>
              <TouchableOpacity style={styles.checkbox} onPress={() => handleTaskCompletion(task)}>
                <View style={styles.uncheckedBox} />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <View style={styles.header}>
            <Text style={styles.headerText}>Done</Text>
            <Text style={styles.headerText}>数量</Text>
          </View>
          {tasks.done.map((task, index) => (
            <View style={styles.task} key={index}>
              <Text>{task.taskName}</Text>
              <Text>{task.taskType}</Text>
              <Text>{task.targetTime}</Text>
              <TouchableOpacity style={styles.checkbox}>
                <View style={styles.checkedBox} />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>

      <BottomNavigation />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 60, // 预留空间给底部导航栏
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  dateText: {
    fontSize: 16,
    marginBottom: 16,
  },
  manageButton: {
    marginBottom: 20,
  },
  section: {
    width: '100%',
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f4a261',
    padding: 10,
  },
  headerText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  task: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#e0e0e0',
    borderBottomWidth: 1,
    borderColor: '#cccccc',
  },
  checkbox: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uncheckedBox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#000',
  },
  checkedBox: {
    width: 20,
    height: 20,
    backgroundColor: '#000',
  },
});

export default TaskListScreen;
