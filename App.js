import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthProvider } from './AuthContext'; // 导入 AuthProvider
import LogScreen from './screens/Logscreen';
import DataScreen from './screens/Datascreen';
import TaskListScreen from './screens/TaskListScreen';
import LogoutScreen from './screens/LogoutScreen';
import CreateTaskScreen from './screens/CreateTaskScreen';
import { library } from '@fortawesome/fontawesome-svg-core';
import { fab } from '@fortawesome/free-brands-svg-icons';
import { faChartColumn } from '@fortawesome/free-solid-svg-icons/faChartColumn';
import { faList } from '@fortawesome/free-solid-svg-icons/faList';
import { faHouse } from '@fortawesome/free-solid-svg-icons/faHouse';
import { faShoePrints } from '@fortawesome/free-solid-svg-icons/faShoePrints';
import { faFileMedical } from '@fortawesome/free-solid-svg-icons/faFileMedical';
import { faCalendarDays } from '@fortawesome/free-regular-svg-icons/faCalendarDays';
import { faBullseye } from '@fortawesome/free-solid-svg-icons/faBullseye';
import { faRulerHorizontal } from '@fortawesome/free-solid-svg-icons/faRulerHorizontal';
import { faCalendarPlus } from '@fortawesome/free-solid-svg-icons/faCalendarPlus';
import { faBowlFood } from '@fortawesome/free-solid-svg-icons/faBowlFood';
import { faPersonRunning } from '@fortawesome/free-solid-svg-icons/faPersonRunning';
import { faPills } from '@fortawesome/free-solid-svg-icons/faPills';
import { faLeftRight } from '@fortawesome/free-solid-svg-icons/faLeftRight';
import { faCaretDown } from '@fortawesome/free-solid-svg-icons/faCaretDown';
import { faCaretUp } from '@fortawesome/free-solid-svg-icons/faCaretUp';
import { faCircle } from '@fortawesome/free-regular-svg-icons/faCircle';
import { faCircleCheck } from '@fortawesome/free-regular-svg-icons/faCircleCheck';
import { faPlus } from '@fortawesome/free-solid-svg-icons/faPlus';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';

library.add(fab, faChartColumn,faList, faHouse, faShoePrints,faFileMedical, faCalendarDays, faRulerHorizontal, faBullseye, faCalendarPlus
  , faBowlFood, faPersonRunning, faPills, faLeftRight, faCaretDown, faCircle, faCircleCheck, faCaretUp, faPlus
 );
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
