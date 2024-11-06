'use client'
import { useTheme } from "next-themes";
import React from "react";
import D3WordCloud from "react-d3-cloud";

type Props = {};

const data = [
  {
    text: "Hey",
    value: 100,
  },
  {
    text: "Computer",
    value: 100,
  },
  {
    text: "nextjs",
    value: 100,
  },
  {
    text: "live",
    value: 100,
  },
  {
    text: "React",
    value: 120,
  },
  {
    text: "Angular",
    value: 250,
  },
];

const fontSizeMapper = (word: { value: number }) => {
  return Math.log2(word.value) * 5 + 16;
};

const CustomWordCloud = (props: Props) => {
  const theme = useTheme();
  return (
    <D3WordCloud
      height={550}
      data={data}
      font="Times"
      fontSize={fontSizeMapper}
      rotate={0}
      padding={10}
      fill={theme.theme === 'dark' ? 'white' : 'black'}
    />
  );
};

export default CustomWordCloud;
