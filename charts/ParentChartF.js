import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';

const DonutChart = ({ steps = 0, goal = 0 }) => {
  const stepLength = 0.72; // Average step length in meters


  const adjustedGoal = goal > 0 && goal >= steps ? goal : steps;
  const distance = (steps * stepLength) / 1000; // Convert to kilometers

  const pieData = [
    { value: steps, color: '#FFA500' },
    { value: adjustedGoal - steps, color: 'lightgray' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.chartContainer}>
        <PieChart
          donut
          innerRadius={50}
          radius={60}
          data={pieData}
          centerLabelComponent={() => {
            return (
              <View style={styles.centerLabel}>
                <Text style={styles.stepsText}>{steps}</Text>
                <Text style={styles.targetText}>steps</Text>
              </View>
            );
          }}
        />
      </View>
      <View style={styles.textContainer}>
        <View style={styles.textItem}>
          <FontAwesomeIcon icon="fa-solid fa-bullseye" style={styles.iconGoal} />
          <Text style={styles.goalText}>goal ：{goal}</Text>
        </View>
        <View style={styles.textItem}>
          <FontAwesomeIcon icon="fa-solid fa-ruler-horizontal" style={styles.iconDistance} />
          <Text style={styles.distanceText}>distance：{distance.toFixed(2)} km</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20, 
  },
  chartContainer: {
    alignItems: 'center',
  },
  centerLabel: {
    alignItems: 'center',
  },
  stepsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
  },
  targetText: {
    fontSize: 18,
    color: 'black',
  },
  textContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
    marginLeft: 40,
  },
  textItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconGoal: {
    color: 'red',
    marginRight: 8,
  },
  iconDistance: {
    color: 'gray',
    marginRight: 8,
  },
  goalText: {
    fontSize: 18,
    color: 'black',
  },
  distanceText: {
    fontSize: 18,
    color: 'black',
  },
});

export default DonutChart;
