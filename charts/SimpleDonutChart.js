import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';

const SimpleDonutChart = ({ steps, weight }) => {
  const stepLength = 0.72; // Average step length in meters
  const goal = 3000; // Goal steps

  const distance = (steps * stepLength) / 1000; // Convert to kilometers
  

  const pieData = [
    { value: steps, color: '#177AD5' },
    { value: goal - steps, color: 'lightgray' },
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
                <Text style={styles.targetText}>步数</Text>
              </View>
            );
          }}
        />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.textItem}>目标 ：{goal}</Text>
        <Text style={styles.textItem}>距离：{distance.toFixed(2)} 公里</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20, // Add marginBottom to create space below the chart
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
    fontSize: 10,
    color: 'black',
  },
  textContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
    marginLeft: 40,
  },
  textItem: {
    fontSize: 14,
    color: 'black',
    marginBottom: 16,//留白
  },
});

export default SimpleDonutChart;
