import React from 'react';
import { View, Text, Button, StyleSheet, ScrollView } from 'react-native';
import HealthInput from '../firebase/HealthInput';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import BottomNavigation from './BottomNavigation';

const DataScreen = () => {
  const [user, setUser] = React.useState(null);
  const auth = getAuth();

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, [auth]);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.healthDataContainer}>
          <Text style={styles.title}>我的健康数据</Text>
          <View style={styles.dataBox}>
            <View style={styles.dataRow}>
              <Text style={styles.dataText}>Today 24/6</Text>
              <Button title="更新" onPress={() => {}} />
            </View>
            <View style={styles.dataContentRow}>
              <View style={styles.scoreContainer}>
                <View style={styles.scoreCircle}>
                  <Text style={styles.scoreText}>92</Text>
                </View>
                <Text style={styles.scoreLabel}>Score</Text>
              </View>
              <View style={styles.dataContent}>
                {user && <HealthInput user={user} dataType="blood pressure" />}
                {user && <HealthInput user={user} dataType="blood sugar" />}
              </View>
            </View>
          </View>
        </View>

        <View style={styles.stepsContainer}>
          <View style={styles.stepsHeader}>
            <Text style={styles.title}>近期步数</Text>
            <Button title="设备" onPress={() => {}} />
          </View>
          <View style={styles.chartPlaceholder}>
            <Text style={styles.chartText}>CHART</Text>
          </View>
        </View>

        <View style={styles.reportButtonContainer}>
          <Button title="生成健康报告" onPress={() => {}} />
        </View>
      </ScrollView>

      <BottomNavigation />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    paddingBottom: 60, // 预留空间给底部导航栏
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  healthDataContainer: {
    width: '100%',
    marginBottom: 16,
  },
  dataBox: {
    backgroundColor: '#d3d3d3',
    padding: 16,
    borderRadius: 8,
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  dataText: {
    fontSize: 16,
  },
  dataContentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scoreContainer: {
    alignItems: 'center',
    marginRight: 16,
  },
  scoreCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  scoreText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  scoreLabel: {
    fontSize: 16,
  },
  dataContent: {
    flex: 1,
  },
  dataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  circle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  dataLabel: {
    flex: 1,
    fontSize: 16,
  },
  dataValue: {
    fontSize: 16,
  },
  stepsContainer: {
    width: '100%',
    marginBottom: 16,
  },
  stepsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  chartPlaceholder: {
    backgroundColor: '#d3d3d3',
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  chartText: {
    fontSize: 24,
  },
  reportButtonContainer: {
    width: '100%',
    marginBottom: 16,
  },
});

export default DataScreen;
