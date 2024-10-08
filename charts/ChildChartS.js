import React from 'react';
import { View, Text, StyleSheet ,Dimensions} from 'react-native';
import { BarChart } from 'react-native-gifted-charts';

const ChildViewSugar = ({ data }) => {
  const today = new Date().toISOString().split('T')[0];
  const recentData = data.slice(-4); //Keep data order
  const screenWidth = Dimensions.get('window').width;//Set width based on screen size
 // Generate chart data
  const barData = recentData.map((item) => ({
    value: item.bloodSugar,
    label: item.date === today ? item.date.split('-').slice(1).join('/') : item.date.split('-').slice(1).join('/'),
    spacing: 46,
    labelWidth: 15,
    labelTextStyle: { color: item.date === today ? 'green' : 'gray', fontSize: 10 }, // Today's date text color turns green
    frontColor: '#FFA500', 
  }));

  const renderTitle = () => {
    return (
      <View style={{ marginVertical: 10, flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={styles.titleText}>Blood Sugar </Text>
        <View style={styles.referenceContainer}>
          <View style={styles.legendColor} />
          <Text style={styles.referenceText}>Normal(4.4-7.0)</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.chartContainer}>
      {renderTitle()}
      <BarChart
        data={barData}
        barWidth={10}
        initialSpacing={20}
        spacing={40}
        roundedTop
        roundedBottom
        hideRules={false}
        xAxisThickness={1}
        yAxisThickness={1}
        yAxisTextStyle={{ color: 'gray' }}
        xAxisTextStyle={{ color: 'gray' }}
        noOfSections={4}
        maxValue={12}
        height={100}
        width={screenWidth * 0.53} 
        //High blood sugar reference line
        showReferenceLine1
        referenceLine1Position={7.0}  
        referenceLine1Config={{
          color: 'rgba(255, 165, 0, 0.5)',  
          thickness: 2,  
          dashWidth: 4,  
          dashGap: 2,    
        }}
        //Dangerous blood sugar reference line
        showReferenceLine2
        referenceLine2Position={11.1}  
        referenceLine2Config={{
          color: 'rgba(255, 0, 0, 0.5)',  
          thickness: 2,  
          dashWidth: 4,  
          dashGap: 2,    
        }}
        //hypoglycemia reference line
        showReferenceLine3
        referenceLine3Position={4.4}  
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
  legendColor: {
    height: 6,
    width: 6,
    borderRadius: 6,
    backgroundColor: '#FFA500',
    marginRight: 8,
  },
  referenceText: {
    fontSize: 12,
    color: 'gray',
  },
});

export default ChildViewSugar;
