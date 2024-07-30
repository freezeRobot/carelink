// charts/PressureChart.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';

const PressChart = () => {
  const size = 80; // 图表的宽度
  const lineWidth = size * 0.8; // 线的宽度，占整个宽度的80%
  const lineHeight = 10; // 线的高度

  return (
    <View style={styles.container}>
      <Svg height={lineHeight} width={size}>
        <Defs>
          <LinearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor="#FFFF00" />  {/* 黄色 */}
            <Stop offset="33%" stopColor="#00FF00" />  {/* 绿色 */}
            <Stop offset="66%" stopColor="#FF0000" />  {/* 红色 */}
            <Stop offset="100%" stopColor="#FF00FF" /> {/* 粉色 */}
          </LinearGradient>
        </Defs>
        <Line
          x1="10"
          y1={lineHeight / 2}
          x2={lineWidth}
          y2={lineHeight / 2}
          stroke="url(#grad)"
          strokeWidth={lineHeight}
          strokeLinecap="round"
        />
      </Svg>
      <Text style={styles.text}>偏高</Text>
      <Text style={styles.valueText}>140/54 mmHg</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  text: {
    fontSize: 18,
    color: 'black',
    marginTop: 10,
  },
  valueText: {
    fontSize: 24,
    color: 'black',
    marginTop: 5,
  },
});

export default PressChart;
