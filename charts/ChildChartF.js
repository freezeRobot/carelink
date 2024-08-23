import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';

const ChildViewStep = ({ data, todayGoal }) => {
  const today = new Date().toISOString().split('T')[0];
  const recentData = data.slice(-5); //Keep data order

  const stepsData = recentData.map((item) => ({
    value: item.steps,
    label: item.date === today ? item.date.split('-').slice(1).join('/') : item.date.split('-').slice(1).join('/'),
    labelTextStyle: { color: item.date === today ? 'green' : 'gray', fontSize: 10 }// Today's date text color turns green
  }));

  const screenWidth = Dimensions.get('window').width;
  const maxValue = Math.max(...stepsData.map(item => item.value));
  
  //Set the maximum value of the Y-axis, add 1000 to the recent maximum value and then round
  const yAxisMaxValue = Math.ceil((maxValue + 1000) / 1000) * 1000;
  
// Generate Y-axis labels, divided into 3 segments, displaying a total of 4 values
  const numberOfSegments = 3;
  const segmentInterval = yAxisMaxValue / numberOfSegments;
  const yAxisLabelTexts = Array.from({ length: numberOfSegments + 1 }, (_, i) => (i * segmentInterval).toString());

  const renderTitle = () => {
    return (
      <View style={styles.titleContainer}>
        <View style={styles.legendContainer}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#FFA500' }]} />
            <Text style={styles.legendText}>Today'Goal: {todayGoal}</Text> 
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.chartContainer}>
      {renderTitle()}
      <LineChart
        initialSpacing={20}
        data={stepsData}
        spacing={48} 
        hideDataPoints
        thickness={2}
        hideRules
        yAxisColor="gray"
        showVerticalLines
        xAxisColor="gray"
        color="#FFA500"
        height={100} 
        width={screenWidth * 0.58} 
        yAxisLabelTexts={yAxisLabelTexts} 
        yAxisMaxValue={yAxisMaxValue} 
        noOfSections={numberOfSegments} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  chartContainer: {
    backgroundColor: '#fff', 
    padding: 10,
    borderRadius: 10,
    marginVertical: 10,
    width: '90%',
    alignSelf: 'center',
  },
  titleContainer: {
    flexDirection: 'row',
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    backgroundColor: 'transparent',
    marginBottom: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendColor: {
    height: 6,
    width: 6,
    borderRadius: 6,
    backgroundColor: '#FFA500',
    marginRight: 8,
  },
  legendText: {
    color: 'grey',
    fontSize: 12,
  },
});

export default ChildViewStep;
