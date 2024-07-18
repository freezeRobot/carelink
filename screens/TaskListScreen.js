import React, { useState } from 'react';
import { View, Text, StyleSheet, Button, TouchableOpacity, ScrollView } from 'react-native';
import BottomNavigation from './BottomNavigation';

const TaskListScreen = () => {
  const [tasks, setTasks] = useState({
    todo: ['task1', 'task2', 'taskx'],
    done: ['task1', 'task2', 'task3'],
  });

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>My To Do’s</Text>
        <View style={styles.section}>
          <View style={styles.header}>
            <Text style={styles.headerText}>To Do</Text>
            <Text style={styles.headerText}>数量</Text>
          </View>
          {tasks.todo.map((task, index) => (
            <View style={styles.task} key={index}>
              <Text>{task}</Text>
              <Button title="Label" onPress={() => {}} />
              <TouchableOpacity style={styles.checkbox}>
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
              <Text>{task}</Text>
              <Button title="Label" onPress={() => {}} />
              <TouchableOpacity style={styles.checkbox}>
                <View style={styles.checkedBox} />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* 底部导航按钮 */}
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
