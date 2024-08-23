import React from 'react';
import { View, Text, StyleSheet,Dimensions } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';

const ChildViewPressure = ({ data }) => {
  const today = new Date().toISOString().split('T')[0];
  const recentData = data.slice(-4); //Keep data order
  const screenWidth = Dimensions.get('window').width;//Set width based on screen size

 // Generate chart data
  const barData = recentData.flatMap((item) => [
    {
      value: item.diastolic,
      label: item.date === today ? item.date.split('-').slice(1).join('/') : item.date.split('-').slice(1).join('/'),
      spacing: 1,
      labelWidth: 25,
      labelTextStyle: { color: item.date === today ? 'green' : 'gray', fontSize: 10 },// Today's date text color turns green
      frontColor: '#177AD5',
    },
    {
      value: item.systolic,
      frontColor: '#ED6665',
    }
  ]);

  const renderTitle = () => {
    return (
      <View style={{ marginVertical: 10, flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={styles.titleText}>Blood Pressure </Text>
        <View style={styles.referenceContainer}>
          <View style={styles.diastolicColor} />
          <Text style={styles.referenceText}>Diastolic</Text>
          <View style={styles.systolicColor} />
          <Text style={styles.referenceText}>Systolic</Text>
        </View>
      </View>
    );
  };

  const renderReferenceText = () => {
    return (
      <View style={styles.referenceRow}>
        <Text style={styles.referenceText}>Normal Diastolic(60-90）</Text>
        <Text style={styles.referenceText}>Normal Systolic(90-140）</Text>
      </View>
    );
  };

  return (
    <View style={styles.chartContainer}>
      {renderTitle()}
      {renderReferenceText()}
      <BarChart
        data={barData}
        barWidth={8}
        initialSpacing={20}
        spacing={40}
        roundedTop
        roundedBottom
        hideRules={false}
        xAxisThickness={1}
        yAxisThickness={0.5}
        yAxisTextStyle={{ color: 'gray' }}
        xAxisTextStyle={{ color: 'gray' }}
        noOfSections={4}
        maxValue={180}
        height={100}
        width={screenWidth * 0.55} 
        //Danger blood pressure reference line
        showReferenceLine1
        referenceLine1Position={180}  
        referenceLine1Config={{
          color: 'rgba(255, 0, 0, 0.5)',  
          thickness: 2,  
          dashWidth: 4,  
          dashGap: 2,    
        }}
        //High blood pressure reference line
        showReferenceLine2
        referenceLine2Position={140}  
        referenceLine2Config={{
          color: 'rgba(255, 165, 0, 0.5)',  
          thickness: 2,  
          dashWidth: 4,  
          dashGap: 2,   
        }}
        //hypotension reference line
        showReferenceLine3
        referenceLine3Position={60}  
        referenceLine3Config={{
          color: 'rgba(0, 0, 255, 0.5)',  
          thickness: 2,  
          dashWidth: 4,  
          dashGap: 2,    
        }}
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
  titleText: {
    color: 'black',
    fontSize: 16,
    fontWeight: 'bold',
  },
  referenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  diastolicColor: {
    height: 6,
    width: 6,
    borderRadius: 6,
    backgroundColor: '#177AD5',
    marginRight: 8,
  },
  systolicColor: {
    height: 6,
    width: 6,
    borderRadius: 6,
    backgroundColor: '#ED6665',
    marginRight: 8,
    marginLeft: 10,
  },
  referenceText: {
    fontSize: 12,
    color: 'gray',
  },
  referenceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
    paddingHorizontal: 55,
  },
});

export default ChildViewPressure;
