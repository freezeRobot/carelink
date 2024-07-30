import React, { useEffect } from 'react';
import { Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthProvider } from './AuthContext'; // 导入 AuthProvider
import LogScreen from './screens/Logscreen';
import DataScreen from './screens/Datascreen';
import TaskListScreen from './screens/TaskListScreen';
import LogoutScreen from './screens/LogoutScreen';
import CreateTaskScreen from './screens/CreateTaskScreen';

const Stack = createStackNavigator();

const App = () => {
  return (
    <AuthProvider>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="LogScreen" component={LogScreen} />
          <Stack.Screen name="DataScreen" component={DataScreen} />
          <Stack.Screen name="TaskListScreen" component={TaskListScreen} />
          <Stack.Screen name="LogoutScreen" component={LogoutScreen} />
          <Stack.Screen name="CreateTaskScreen" component={CreateTaskScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
};

export default App;
