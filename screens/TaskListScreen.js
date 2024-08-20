import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Button, TouchableOpacity, ScrollView, Alert, Modal,SafeAreaView  } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { getFirestore, collection, query, where, getDocs, doc, updateDoc} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import BottomNavigation from './BottomNavigation';
import { useAuth } from '../AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';

export const fetchTasks = async (firestore, uid, setTasks, setTodoCount, setDoneCount) => {
  try {
    const today = new Date();
    const timestamp = today.toISOString().split('T')[0];
    const tasksRef = collection(firestore, 'tasks');
    const q = query(tasksRef, where('uid', '==', uid), where('date', '==', timestamp));
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
    setTodoCount(todoTasks.length); // 设置未完成任务数量
    setDoneCount(doneTasks.length); // 设置已完成任务数量
  } catch (error) {
    console.error('Error fetching tasks: ', error.message);
  }
};

const TaskListScreen = () => {
  const [tasks, setTasks] = useState({ todo: [], done: [] });
  const [todoCount, setTodoCount] = useState(0);
  const [doneCount, setDoneCount] = useState(0);
  const [selectedTask, setSelectedTask] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [isTodoExpanded, setIsTodoExpanded] = useState(true); // 状态管理 To Do 部分的展开和收缩
  const [isDoneExpanded, setIsDoneExpanded] = useState(false); // 状态管理 Done 部分的展开和收缩
  const navigation = useNavigation();
  const auth = getAuth();
  const { role } = useAuth(); // 获取用户和角色信息
  const firestore = getFirestore();

  useEffect(() => {
    fetchTasks(firestore, auth.currentUser.uid, setTasks, setTodoCount, setDoneCount);
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchTasks(firestore, auth.currentUser.uid, setTasks, setTodoCount, setDoneCount);
    }, [])
  );

  const handleManageTasks = () => {
    Alert.alert(
      'Task Management',
      'Do you want to create a new task?',
      [
        { text: 'No', onPress: () => console.log('Cancelled') },
        { text: 'Yes', onPress: () => navigation.navigate('CreateTaskScreen') },
      ]
    );
  };

  const handleTaskCompletion = (task) => {
    Alert.alert(
      'Task Completion',
      'Are you sure this task is completed?',
      [
        { text: 'Cancel', onPress: () => console.log('Task not completed') },
        { text: 'Confirm', onPress: () => updateTaskCompletion(task) },
      ]
    );
  };

  const updateTaskCompletion = async (task) => {
    try {
      const taskRef = doc(firestore, 'tasks', task.id); // 使用正确的文档 ID
      await updateDoc(taskRef, { isCompleted: true });
      fetchTasks(firestore, auth.currentUser.uid, setTasks, setTodoCount, setDoneCount); // 更新任务列表
    } catch (error) {
      console.error('Error updating task: ', error.message);
    }
  };

  const getTaskIcon = (taskType) => {
    let icon, backgroundColor;
    switch (taskType) {
      case 'Medical':
        icon = "fa-solid fa-pills";
        backgroundColor = '#177AD5'; 
        break;
      case 'Diet':
        icon = "fa-solid fa-bowl-food";
        backgroundColor = '#ff69b4'; 
        break;
      case 'Exercise':
        icon = "fa-solid fa-person-running";
        backgroundColor = '#ffa500'; 
        break;
      default:
        return null;
    }
    return (
      <View style={[styles.iconBackground, { backgroundColor }]}>
        <FontAwesomeIcon icon={icon} size={24} color="#fff" />
      </View>
    );
  };

  const openModal = (task) => {
    setSelectedTask(task);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedTask(null);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>My To Do’s</Text>
        <View style={styles.iconContainer}>
          <FontAwesomeIcon icon="fa-regular fa-calendar-days" size={20} />
          <Text style={styles.iconText}> {new Date().toISOString().split('T')[0]}</Text>
        </View>
        {role === 'child' && (
            <View style={styles.addButtonContainer}>
            <TouchableOpacity style={styles.addButton} onPress={handleManageTasks}>
             <FontAwesomeIcon icon="fa-solid fa-plus"size={16} color="black" />
            <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.section}>
          <TouchableOpacity style={styles.header} onPress={() => setIsTodoExpanded(!isTodoExpanded)}>
            <Text style={styles.headerText}>To Do</Text>
            <View style={styles.headerCountContainer}>
              <Text style={styles.headerText}>{todoCount}</Text>
              <FontAwesomeIcon icon={isTodoExpanded ? "fa-solid fa-caret-up" : "fa-solid fa-caret-down"} />
            </View>
          </TouchableOpacity>
          {isTodoExpanded && tasks.todo.map((task, index) => (
            <View style={styles.task} key={index}>
              <View style={styles.taskIconTextContainer}>
                {getTaskIcon(task.taskType)}
                <View style={styles.taskTextContainer}>
                  <Text style={styles.taskTitle}>{task.taskName}</Text>
                  <Text style={styles.taskPeriod}>{task.taskPeriod}</Text>
                </View>
              </View>
              <Button title="detail" onPress={() => openModal(task)}color="#f4a261" />
              <View style={styles.taskTimeContainer}>
                <Text style={styles.taskText}>{task.targetTime}</Text>
                <TouchableOpacity onPress={() => handleTaskCompletion(task)}>
                <FontAwesomeIcon
                  icon="fa-regular fa-square-check"
                   size={18}
                    style={{ color: task.isCompleted ? "orange" : "gray" }}
                    />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <TouchableOpacity style={styles.header} onPress={() => setIsDoneExpanded(!isDoneExpanded)}>
            <Text style={styles.headerText}>Done</Text>
            <View style={styles.headerCountContainer}>
              <Text style={styles.headerText}>{doneCount}</Text>
              <FontAwesomeIcon icon={isDoneExpanded ? "fa-solid fa-caret-up" : "fa-solid fa-caret-down"} />
            </View>
          </TouchableOpacity>
          {isDoneExpanded && tasks.done.map((task, index) => (
            <View style={styles.task} key={index}>
              <View style={styles.taskIconTextContainer}>
                {getTaskIcon(task.taskType)}
                <View style={styles.taskTextContainer}>
                  <Text style={styles.taskTitle}>{task.taskName}</Text>
                  <Text style={styles.taskPeriod}>{task.taskPeriod}</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.detailButton} onPress={() => openModal(task)}>
              <Button title="detail" onPress={() => openModal(task)}color="#f4a261" />
              </TouchableOpacity>
              <View style={styles.taskTimeContainer}>
                <Text style={styles.taskText}>{task.targetTime}</Text>
                <TouchableOpacity>
                <FontAwesomeIcon
                  icon="fa-regular fa-square-check"
                   size={18}
                    style={{ color: task.isCompleted ? "orange" : "gray" }}
                    />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {selectedTask && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={closeModal}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{selectedTask.taskName}</Text>
                <Text style={styles.modalTime}>{selectedTask.taskPeriod} {selectedTask.targetTime}</Text>
              </View>
              <View style={styles.modalBody}>
                <View style={styles.descriptionContainer}>
                  <Text style={styles.descriptionText}>{selectedTask.taskDescription}</Text>
                </View>
                <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
                  <Text style={styles.closeButtonText}>back</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      <BottomNavigation />
    </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 60,
    paddingTop: 30, 
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    color: '#f4a261',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  section: {
    width: '100%',
    marginBottom: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    padding: 10,
  },
  headerText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  headerCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  task: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: '#cccccc',
    marginVertical: 5,
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    position: 'relative', 
  },
  taskIconTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  taskTextContainer: {
    marginLeft: 8,
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    color: '#000',
  },
  taskPeriod: {
    fontSize: 12,
    color: '#808080',
  },
  taskTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
  },
  taskText: {
    marginRight: 4,
  },
  iconBackground: {
    width: 48,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalTime: {
    fontSize: 16,
    textAlign: 'right',
  },
  modalBody: {
    width: '100%',
    alignItems: 'center',
  },
  descriptionContainer: {
    width: '100%',
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    marginBottom: 20,
  },
  descriptionText: {
    color: '#000',
    fontSize: 16,
    textAlign: 'center',
  },
  closeButton: {
    width: '100%',
    padding: 10,
    backgroundColor: '#ffa500',
    borderRadius: 5,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#000',
    fontSize: 16,
  },
  addButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 10,
    width: '100%',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addButtonText: {
    marginLeft: 2,
  },
  safeArea: {
    flex: 1,
  },
});

export default TaskListScreen;