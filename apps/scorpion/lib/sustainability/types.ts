// Sustainability & Carbon Tracking Types

export interface CarbonEmission {
  resourceId: string;
  resourceType: string;
  provider: string;
  region: string;
  emissionsKgCO2: number;
  period: {
    start: Date;
    end: Date;
  };
  breakdown: {
    compute?: number; // kg CO2 from compute
    storage?: number; // kg CO2 from storage
    network?: number; // kg CO2 from network
    ml?: number; // kg CO2 from ML inference
  };
}

export interface ResourceEfficiency {
  resourceId: string;
  cpuUtilization: number; // 0-100
  memoryUtilization: number; // 0-100
  storageUtilization: number; // 0-100
  networkUtilization: number; // 0-100
  efficiencyScore: number; // 0-100, higher is better
  recommendations: string[];
}

export interface SustainabilityGoal {
  id: string;
  name: string;
  type: 'carbon_reduction' | 'energy_efficiency' | 'resource_optimization';
  target: number;
  current: number;
  unit: string;
  deadline: Date;
  status: 'on_track' | 'at_risk' | 'behind';
}

export interface EnergyConsumption {
  resourceId: string;
  resourceType: string;
  provider: string;
  region: string;
  energyKWh: number;
  period: {
    start: Date;
    end: Date;
  };
  source: 'renewable' | 'mixed' | 'fossil';
  renewablePercentage: number; // 0-100
}

