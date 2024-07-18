import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase/firebaseConfig';
import LogScreen from './screens/Logscreen'; // 登录界面
import DataScreen from './screens/Datascreen'; // 健康数据界面
import TaskListScreen from './screens/TaskListScreen'; // 任务列表界面
import LogoutScreen from './screens/LogoutScreen'; // 登出界面

const Stack = createStackNavigator();

const App = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {user ? (
          <>
            <Stack.Screen
              name="DataScreen"
              component={DataScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="TaskListScreen"
              component={TaskListScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="LogoutScreen"
              component={LogoutScreen}
              options={{ headerShown: false }}
            />
          </>
        ) : (
          <Stack.Screen
            name="LogScreen"
            component={LogScreen}
            options={{ headerShown: false }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
