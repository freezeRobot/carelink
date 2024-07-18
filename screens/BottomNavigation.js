import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { getAuth, signOut } from 'firebase/auth';

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

  const getButtonStyle = (label) => {
    return [
      styles.footerButton,
      route.name === label && styles.activeFooterButton,
    ];
  };

  return (
    <View style={styles.footer}>
      <TouchableOpacity
        style={getButtonStyle('DataScreen')}
        onPress={() => navigateTo('DataScreen')}
      >
        <Text style={styles.footerButtonText}>健康数据</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={getButtonStyle('TaskListScreen')}
        onPress={() => navigateTo('TaskListScreen')}
      >
        <Text style={styles.footerButtonText}>任务列表</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.footerButton} onPress={handleLogout}>
        <Text style={styles.footerButtonText}>登出</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    backgroundColor: '#d3d3d3',
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
  footerButton: {
    flex: 1,
    alignItems: 'center',
    padding: 8,
    marginHorizontal: 4,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  activeFooterButton: {
    backgroundColor: '#aaa', // 当前活动界面按钮的背景颜色
  },
  footerButtonText: {
    fontSize: 16,
  },
});

export default BottomNavigation;
