import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import {
  Activity,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  Wind,
  Thermometer,
  MapPin,
  Clock,
  ChevronLeft,
} from 'lucide-react-native';
import { useSims } from '@/contexts/SimsContext';
import { BridgeStatus } from '@/types/bridge';
import * as Haptics from 'expo-haptics';

export default function BridgeDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { bridges, getBridgeAlerts, acknowledgeAlert } = useSims();

  const bridge = useMemo(
    () => bridges.find((b) => b.id === id),
    [bridges, id]
  );

  const bridgeAlerts = useMemo(
    () => (bridge ? getBridgeAlerts(bridge.id) : []),
    [bridge, getBridgeAlerts]
  );

  const recentAlerts = useMemo(
    () => bridgeAlerts.slice(0, 3),
    [bridgeAlerts]
  );

  if (!bridge) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Bridge Not Found' }} />
        <Text>Bridge not found</Text>
      </View>
    );
  }

  const getStatusConfig = (status: BridgeStatus) => {
    switch (status) {
      case 'critical':
        return {
          color: '#dc2626',
          bgColor: '#fee2e2',
          icon: AlertCircle,
          label: 'Critical',
        };
      case 'warning':
        return {
          color: '#f59e0b',
          bgColor: '#fef3c7',
          icon: AlertCircle,
          label: 'Warning',
        };
      case 'healthy':
        return {
          color: '#10b981',
          bgColor: '#d1fae5',
          icon: CheckCircle,
          label: 'Healthy',
        };
    }
  };

  const statusConfig = getStatusConfig(bridge.status);
  const StatusIcon = statusConfig.icon;

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const handleAcknowledge = (alertId: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    acknowledgeAlert(alertId);
  };

  const getMetricStatus = (value: number, metric: string): 'normal' | 'warning' | 'critical' => {
    switch (metric) {
      case 'vibration':
        if (value > 7) return 'critical';
        if (value > 5) return 'warning';
        return 'normal';
      case 'stress':
        if (value > 85) return 'critical';
        if (value > 65) return 'warning';
        return 'normal';
      case 'tilt':
        if (value > 1) return 'critical';
        if (value > 0.4) return 'warning';
        return 'normal';
      case 'temperature':
        if (value > 40 || value < -10) return 'critical';
        if (value > 35 || value < 0) return 'warning';
        return 'normal';
      default:
        return 'normal';
    }
  };

  const getMetricColor = (status: 'normal' | 'warning' | 'critical') => {
    switch (status) {
      case 'critical':
        return '#dc2626';
      case 'warning':
        return '#f59e0b';
      case 'normal':
        return '#10b981';
    }
  };

  const metrics = [
    {
      icon: Activity,
      label: 'Vibration',
      value: bridge.metrics.vibration,
      unit: 'Hz',
      key: 'vibration' as const,
    },
    {
      icon: TrendingUp,
      label: 'Stress',
      value: bridge.metrics.stress,
      unit: '%',
      key: 'stress' as const,
    },
    {
      icon: Wind,
      label: 'Tilt',
      value: bridge.metrics.tilt,
      unit: '°',
      key: 'tilt' as const,
    },
    {
      icon: Thermometer,
      label: 'Temperature',
      value: bridge.metrics.temperature,
      unit: '°C',
      key: 'temperature' as const,
    },
  ];

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: bridge.name,
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <ChevronLeft size={24} color="#0f172a" />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={[styles.statusCard, { backgroundColor: statusConfig.bgColor }]}>
          <View style={styles.statusHeader}>
            <StatusIcon size={32} color={statusConfig.color} />
            <View style={styles.statusContent}>
              <Text style={styles.statusLabel}>Current Status</Text>
              <Text style={[styles.statusValue, { color: statusConfig.color }]}>
                {statusConfig.label}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <MapPin size={18} color="#64748b" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Location</Text>
              <Text style={styles.infoValue}>{bridge.location}</Text>
            </View>
          </View>
          <View style={styles.infoDivider} />
          <View style={styles.infoRow}>
            <Clock size={18} color="#64748b" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Last Inspection</Text>
              <Text style={styles.infoValue}>{formatDate(bridge.lastInspection)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>IoT Metrics</Text>
          <View style={styles.metricsGrid}>
            {metrics.map((metric) => {
              const MetricIcon = metric.icon;
              const metricStatus = getMetricStatus(metric.value, metric.key);
              const metricColor = getMetricColor(metricStatus);

              return (
                <View key={metric.key} style={styles.metricCard}>
                  <View style={styles.metricHeader}>
                    <View style={styles.metricIconContainer}>
                      <MetricIcon size={20} color="#64748b" />
                    </View>
                    <Text style={styles.metricLabel}>{metric.label}</Text>
                  </View>
                  <View style={styles.metricValueContainer}>
                    <Text style={[styles.metricValue, { color: metricColor }]}>
                      {metric.value}
                    </Text>
                    <Text style={styles.metricUnit}>{metric.unit}</Text>
                  </View>
                  <View style={[styles.metricIndicator, { backgroundColor: metricColor }]} />
                </View>
              );
            })}
          </View>
        </View>

        {recentAlerts.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Alerts</Text>
            {recentAlerts.map((alert) => {
              const getSeverityColor = () => {
                switch (alert.severity) {
                  case 'critical':
                    return '#dc2626';
                  case 'high':
                    return '#ea580c';
                  case 'medium':
                    return '#f59e0b';
                  case 'low':
                    return '#3b82f6';
                }
              };

              return (
                <View key={alert.id} style={styles.alertCard}>
                  <View style={styles.alertHeader}>
                    <View style={styles.alertLeft}>
                      <View
                        style={[
                          styles.alertDot,
                          { backgroundColor: getSeverityColor() },
                        ]}
                      />
                      <View style={styles.alertInfo}>
                        <Text style={styles.alertTitle}>{alert.title}</Text>
                        <Text style={styles.alertMessage}>{alert.message}</Text>
                        <Text style={styles.alertTime}>
                          {formatDate(alert.timestamp)}
                        </Text>
                      </View>
                    </View>
                  </View>
                  {!alert.acknowledged && (
                    <TouchableOpacity
                      style={styles.acknowledgeButton}
                      onPress={() => handleAcknowledge(alert.id)}
                    >
                      <Text style={styles.acknowledgeText}>Acknowledge</Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  backButton: {
    paddingRight: 12,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  statusCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  statusContent: {
    flex: 1,
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: '#475569',
    marginBottom: 4,
  },
  statusValue: {
    fontSize: 28,
    fontWeight: '700' as const,
  },
  infoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#0f172a',
  },
  infoDivider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 12,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: '#0f172a',
    marginBottom: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    position: 'relative' as const,
    overflow: 'hidden',
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  metricIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricLabel: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: '#64748b',
  },
  metricValueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  metricValue: {
    fontSize: 28,
    fontWeight: '700' as const,
  },
  metricUnit: {
    fontSize: 14,
    color: '#94a3b8',
  },
  metricIndicator: {
    position: 'absolute' as const,
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
  },
  alertCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  alertLeft: {
    flexDirection: 'row',
    flex: 1,
    gap: 12,
  },
  alertDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
  },
  alertInfo: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#0f172a',
    marginBottom: 4,
  },
  alertMessage: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
    marginBottom: 6,
  },
  alertTime: {
    fontSize: 12,
    color: '#94a3b8',
  },
  acknowledgeButton: {
    backgroundColor: '#f0fdf4',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  acknowledgeText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#10b981',
  },
});
