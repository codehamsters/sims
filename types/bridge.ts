export type BridgeStatus = 'healthy' | 'warning' | 'critical';

export interface Bridge {
  id: string;
  name: string;
  location: string;
  status: BridgeStatus;
  lastInspection: Date;
  metrics: {
    vibration: number;
    stress: number;
    tilt: number;
    temperature: number;
  };
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface Alert {
  id: string;
  bridgeId: string;
  bridgeName: string;
  title: string;
  message: string;
  severity: AlertSeverity;
  timestamp: Date;
  acknowledged: boolean;
  metric?: string;
  value?: number;
  threshold?: number;
}
