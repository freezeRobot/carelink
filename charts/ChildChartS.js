import React from 'react';
import { View, Text } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';

const ChildViewSugar = ({ data }) => {
  // 获取今天的日期
  const today = new Date().toISOString().split('T')[0];
  // 过滤最近4天的数据，从今天开始向前
  const recentData = data.slice(-5); // 保持数据顺序

  // 生成图表数据
  const barData = recentData.map((item) => ({
    value: item.bloodSugar,
    label: item.date === today ? item.date.split('-').slice(1).join('/') : item.date.split('-').slice(1).join('/'),
    spacing: 10,
    labelWidth: 40,
    labelTextStyle: { color: item.date === today ? 'green' : 'gray', fontSize: 10 }, // 当天日期文字颜色变成绿色
    frontColor: '#FFA500', // 使用橙色来表示血糖
  }));

  const renderTitle = () => {
    return (
      <View style={{ marginVertical: 10, flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text
          style={{
            color: 'black',
            fontSize: 16,
            fontWeight: 'bold',
          }}>
          Blood Sugar Chart
        </Text>
      </View>
    );
  };

  return (
    <View
      style={{
        backgroundColor: '#fff',
        padding: 10,
        borderRadius: 10,
        marginVertical: 10,
        width: '90%',
        alignSelf: 'center',
      }}>
      {renderTitle()}
      <BarChart
        data={barData}
        barWidth={20}
        initialSpacing={10}
        spacing={30}
        roundedTop
        roundedBottom
        hideRules={false}
        xAxisThickness={1}
        yAxisThickness={1}
        yAxisTextStyle={{ color: 'gray' }}
        xAxisTextStyle={{ color: 'gray' }}
        noOfSections={4}
        maxValue={200}
        height={150}
        width={300}
      />
    </View>
  );
};

export default ChildViewSugar;
