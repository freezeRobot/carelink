import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';

const ChildViewStep = ({ data, todayGoal }) => {
  // 获取今天的日期
  const today = new Date().toISOString().split('T')[0];
  const recentData = data.slice(-5); // 保持数据顺序

  // 生成图表数据，包括日期标签
  const stepsData = recentData.map((item) => ({
    value: item.steps,
    label: item.date === today ? item.date.split('-').slice(1).join('/') : item.date.split('-').slice(1).join('/'),
    labelTextStyle: { color: item.date === today ? 'green' : 'gray', fontSize: 10 }
  }));

  const screenWidth = Dimensions.get('window').width;
  const maxValue = Math.max(...stepsData.map(item => item.value));
  
  // 设置 Y 轴的最大值，近期最大值加 1000 然后取整
  const yAxisMaxValue = Math.ceil((maxValue + 1000) / 1000) * 1000;
  
  // 生成Y轴标签，分成3段，共显示4个值
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
        spacing={48} // 设置点和点之间的距离
        hideDataPoints
        thickness={2}
        hideRules
        yAxisColor="gray"
        showVerticalLines
        xAxisColor="gray"
        color="#FFA500" // 主线颜色（步数）
        height={100} // 设置图表的最大高度
        width={screenWidth * 0.58} // 使用屏幕宽度的58%
        yAxisLabelTexts={yAxisLabelTexts} // 添加Y轴标签
        yAxisMaxValue={yAxisMaxValue} // 设置Y轴最大值
        noOfSections={numberOfSegments} // 分段数
      />
    </View>
  );
};

const styles = StyleSheet.create({
  chartContainer: {
    backgroundColor: '#fff', // 设置背景色为白色
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
