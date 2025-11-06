"use client";

import React from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Calculator, ArrowRight } from 'lucide-react';

const NavRealityCheck: React.FC = () => {
  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-green-400" />
          <span className="font-medium text-white">Node Reality Check</span>
        </div>
        <Badge variant="outline" className="border-yellow-500 text-yellow-400">
          Eye Opening
        </Badge>
      </div>
      
      <p className="text-sm text-gray-400">
        See why hobby nodes lose money and how business nodes actually profit
      </p>
      
      <div className="flex items-center gap-3">
        <div className="text-xs text-gray-500">
          • Real data analysis<br />
          • Interactive calculator<br />
          • Business examples
        </div>
        
        <Link 
          href="/reality-check"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors ml-auto"
        >
          <Calculator className="h-4 w-4" />
          Check Now
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
};

export default NavRealityCheck; 