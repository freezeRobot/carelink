import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';

const ChildViewStep = ({ data }) => {
  // 获取今天的日期
  const today = new Date().toISOString().split('T')[0];

  // 生成图表数据，包括日期标签
  const lineData = data.map((item) => ({
    value: item.value,
    label: item.date === today ? item.date.split('-').slice(1).join('/') : item.date.split('-').slice(1).join('/'),
    labelTextStyle: { color: item.date === today ? 'green' : 'gray', fontSize: 10 }
  }));

  // 找到数据中的最大值
  const maxValue = Math.max(...lineData.map(item => item.value));
  // 设置 Y 轴的最大值，近期最大值加 1000
  const yAxisMaxValue = Math.ceil((maxValue + 1000) / 1000) * 1000;

  // 生成Y轴标签，分成3段，共显示4个值
  const numberOfSegments = 3;
  const segmentInterval = yAxisMaxValue / numberOfSegments;
  const yAxisLabelTexts = Array.from({ length: numberOfSegments + 1 }, (_, i) => (i * segmentInterval).toString());

  const renderTitle = () => {
    return (
      <View style={styles.titleContainer}>
        <Text style={styles.titleText}>Step Count Chart</Text>
        <View style={styles.legendContainer}>
          <View style={styles.legendItem}>
            <View style={styles.legendColor} />
            <Text style={styles.legendText}>Steps</Text>
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
        data={lineData}
        spacing={48} // 设置点和点之间的距离
        hideDataPoints
        thickness={2}
        hideRules
        yAxisColor="#177AD5"
        showVerticalLines
        verticalLinesColor="rgba(23,122,213,0.5)"
        xAxisColor="#177AD5"
        color="#177AD5"
        height={100} // 设置图表的最大高度
        width={280}  // 设置图表的最大宽度
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
    marginVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  titleText: {
    color: 'black',
    fontSize: 16,
    fontWeight: 'bold',
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    backgroundColor: 'transparent',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  legendColor: {
    height: 6,
    width: 6,
    borderRadius: 6,
    backgroundColor: '#0BA5A4',
    marginRight: 8,
  },
  legendText: {
    color: 'grey',
    fontSize: 12,
  },
});

export default ChildViewStep;
