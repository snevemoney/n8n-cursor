import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';

export const Rise: React.FC<{
  children: React.ReactNode;
  delay?: number;
  from?: number;
  style?: React.CSSProperties;
}> = ({children, delay = 0, from = 22, style}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = spring({
    frame: frame - delay,
    fps,
    config: {damping: 18, stiffness: 140, mass: 0.7},
  });
  return (
    <div
      style={{
        opacity: t,
        transform: `translateY(${interpolate(t, [0, 1], [from, 0])}px)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export const Fade: React.FC<{
  children: React.ReactNode;
  delay?: number;
  dur?: number;
  style?: React.CSSProperties;
}> = ({children, delay = 0, dur = 14, style}) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [delay, delay + dur], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return <div style={{opacity: o, ...style}}>{children}</div>;
};

export const Count: React.FC<{
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  delay?: number;
  signed?: boolean;
  style?: React.CSSProperties;
}> = ({value, decimals = 1, prefix = '', suffix = '', delay = 0, signed = false, style}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = spring({
    frame: frame - delay,
    fps,
    config: {damping: 16, stiffness: 80, mass: 0.8},
  });
  const n = value * t;
  const abs = Math.abs(n).toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  const sign = n < 0 || (t > 0.02 && value < 0) ? '−' : signed && value > 0 && t > 0.15 ? '+' : '';
  return (
    <span style={style}>
      {prefix}
      {sign}
      {abs}
      {suffix}
    </span>
  );
};
