import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { onAuthStateChanged } from '@firebase/auth';
import { auth } from './firebase/firebaseConfig';
import Logscreen from './screens/Logscreen'; // 登录和注册界面
import Datascreen from './screens/Datascreen'; // 健康数据界面

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
          <Stack.Screen name="Datascreen" component={Datascreen} />
        ) : (
          <Stack.Screen name="Logscreen" component={Logscreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
