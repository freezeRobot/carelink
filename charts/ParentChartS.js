import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';

const SugarChart = ({ bloodSugar }) => {
  const size = 80; // 图表的大小
  const strokeWidth = 10; // 环的宽度
  const radius = (size - strokeWidth) / 2; // 环的半径
  const center = size / 2; // 圆心
  const startAngle = -Math.PI; // 起始角度（左端）
  const endAngleNormal = 0; // 正常状态结束角度（右端）
  const endAngleLow = -Math.PI * (2 / 3); // 偏低状态结束角度
  const endAngleHigh = -Math.PI / 8; // 偏高状态结束角度

  let endAngle = endAngleNormal;
  let text = 'Normal';
  let color = 'green';

  if (bloodSugar === 0) {
    endAngle = endAngleNormal;
    text = 'Pending';
    color = 'gray';
  } else if (bloodSugar < 4.4) {
    endAngle = endAngleLow;
    text = 'Low';
    color = 'yellow';
  } else if (bloodSugar > 7.0) {
    endAngle = endAngleHigh;
    text = 'High';
  }

  const createArcPath = (startAngle, endAngle, radius, center) => {
    const startX = center + radius * Math.cos(startAngle);
    const startY = center + radius * Math.sin(startAngle);
    const endX = center + radius * Math.cos(endAngle);
    const endY = center + radius * Math.sin(endAngle);

    return `
      M ${startX} ${startY}
      A ${radius} ${radius} 0 0 1 ${endX} ${endY}
    `;
  };

  return (
    <View style={styles.container}>
      <Svg width={size} height={size / 2}>
        <Defs>
          <LinearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor="#00FF00" />
            <Stop offset="33%" stopColor="#FFFF00" />
            <Stop offset="66%" stopColor="#FFA500" />
            <Stop offset="100%" stopColor="#FF0000" />
          </LinearGradient>
        </Defs>
        <Path
          d={createArcPath(startAngle, endAngle, radius, center)}
          stroke={color === 'yellow' ? 'yellow' : color === 'gray' ? 'gray' : 'url(#grad)'}
          strokeWidth={strokeWidth}
          fill="none"
        />
      </Svg>
      <Text style={styles.text}>{text}</Text>
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
    fontSize: 14,
    color: 'black',
    marginTop: 10,
  },
  valueText: {
    fontSize: 24,
    color: 'black',
    marginTop: 5,
  },
});

export default SugarChart;