import React from 'react';
import {layout} from '../engine/theme';

export const Stage: React.FC<{children: React.ReactNode}> = ({children}) => (
  <div
    style={{
      position: 'absolute',
      zIndex: 1,
      top: 78,
      left: layout.padX,
      right: layout.padX,
      bottom: layout.tickerH + 28,
    }}
  >
    {children}
  </div>
);
