import React from 'react';
import {DailyShow, type DailyShowProps} from './DailyShow';

export const Morning60: React.FC<DailyShowProps> = (props) => <DailyShow {...props} cut="morning60" />;
