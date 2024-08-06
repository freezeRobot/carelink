import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';

const ChildViewPressure = ({ data }) => {
  // 获取今天的日期
  const today = new Date().toISOString().split('T')[0];

  // 过滤最近4天的数据，从今天开始向前
  const recentData = data.slice(-5); // 保持数据顺序

  // 生成图表数据
  const barData = recentData.flatMap((item) => [
    {
      value: item.diastolic,
      label: item.date === today ? item.date.split('-').slice(1).join('/') : item.date.split('-').slice(1).join('/'),
      spacing: 1,
      labelWidth: 25,
      labelTextStyle: { color: item.date === today ? 'green' : 'gray', fontSize: 10 }, // 当天日期文字颜色变成绿色
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
        <Text style={styles.titleText}>Blood Pressure Chart</Text>
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
        yAxisThickness={1}
        yAxisTextStyle={{ color: 'gray' }}
        xAxisTextStyle={{ color: 'gray' }}
        noOfSections={4}
        maxValue={180}
        height={100}
        width={280}
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
    marginBottom:5,
    paddingHorizontal: 55, // 添加左右内边距以减少文本之间的间隔
  },
});

export default ChildViewPressure;
