import React from 'react';
import { View, Text } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';

const ChildViewPressure = ({ data }) => {
  // 获取今天的日期
  const today = new Date().toISOString().split('T')[0];

  // 过滤最近4天的数据，从今天开始向前
  const recentData = data.slice(-5); // 保持数据顺序

  // 生成图表数据
  const barData = recentData.flatMap((item) => [
    {
      value: item.systolic,
      label: item.date === today ? item.date.split('-').slice(1).join('/') : item.date.split('-').slice(1).join('/'),
      spacing: 1,
      labelWidth: 25,
      labelTextStyle: { color: item.date === today ? 'green' : 'gray', fontSize: 10 }, // 当天日期文字颜色变成绿色
      frontColor: '#ED6665',
    },
    {
      value: item.diastolic,
      frontColor: '#177AD5',
    }
  ]);

  const renderTitle = () => {
    return (
      <View style={{ marginVertical: 10, flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text
          style={{
            color: 'black',
            fontSize: 16,
            fontWeight: 'bold',
          }}>
          Blood Pressure Chart
        </Text>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'flex-end',
            backgroundColor: 'transparent',
          }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginHorizontal: 10 }}>
            <View
              style={{
                height: 6,
                width: 6,
                borderRadius: 6,
                backgroundColor: '#177AD5',
                marginRight: 8,
              }}
            />
            <Text style={{ color: 'grey' ,fontSize: 12}}>Systolic</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginHorizontal: 10 }}>
            <View
              style={{
                height: 6,
                width: 6,
                borderRadius: 6,
                backgroundColor: '#ED6665',
                marginRight: 8,
              }}
            />
            <Text style={{ color: 'grey' ,fontSize: 12 }}>Diastolic</Text>
          </View>
        </View>
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

export default ChildViewPressure;
