import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { getAuth, signOut } from 'firebase/auth';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';

const BottomNavigation = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const auth = getAuth();

  const navigateTo = (screen) => {
    if (route.name !== screen) {
      navigation.navigate(screen);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigation.navigate('LogScreen');
    } catch (error) {
      console.error('Error signing out: ', error);
    }
  };

  const getIconColor = (label) => {
    return route.name === label ? 'white' : 'rgba(255, 255, 255, 0.6)';
  };

  return (
    <View style={styles.footer}>
      <TouchableOpacity
        style={styles.footerButton}
        onPress={() => navigateTo('DataScreen')}
      >
        <FontAwesomeIcon 
          icon="fa-solid fa-chart-column"
          size={30}
          color={getIconColor('DataScreen')}
        />
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.footerButton}
        onPress={() => navigateTo('TaskListScreen')}
      >
        <FontAwesomeIcon 
          icon="fa-solid fa-list"
          size={30}
          color={getIconColor('TaskListScreen')}
        />
      </TouchableOpacity>
      <TouchableOpacity 
        style={styles.footerButton}
        onPress={handleLogout}
      >
        <FontAwesomeIcon 
          icon="fa-solid fa-house" 
          size={30}
          color={'rgba(255, 255, 255, 0.6)'}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    backgroundColor: '#f4a261', // 浅橙色背景
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
  footerButton: {
    flex: 1,
    alignItems: 'center',
    padding: 8,
    marginHorizontal: 4,
  },
});

export default BottomNavigation;