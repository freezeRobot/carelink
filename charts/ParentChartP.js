import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';

const LineP = ({ systolic, diastolic }) => {
  const size = 100; // 图表的大小
  const strokeWidth = 15; // 线条的宽度
  const normalColor = 'url(#grad)'; // 正常范围的渐变颜色
  const highColor = 'red'; // 偏高的颜色
  const lowColor = 'yellow'; // 偏低的颜色
  const noupdateColor ='gray'//未更新的颜色
  let color = normalColor;
  let ratio = 1.0; // 默认全线条
  let text = 'Normal';

  if(systolic ===0 || diastolic ===0)
    {
      color = noupdateColor;
      text = 'Pending';
    }
  else if (systolic >= 140 || diastolic >= 90) {
    color = highColor;
    text = 'High';
  } else if (systolic <= 90 || diastolic <= 60) {
    color = lowColor;
    text = 'Low';
  }

  const createLinePath = (ratio, size) => {
    const startX = size * (1 - ratio) / 2; // 居中对齐
    const endX = size * (1 + ratio) / 2;
    return `M${startX},${size / 2} L${endX},${size / 2}`;
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
          d={createLinePath(ratio, size)}
          stroke={color}
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
    
  },
  text: {
    fontSize: 14,
    color: 'black',
    marginTop: 10,
    marginBottom:10,
  },
});

export default LineP;
