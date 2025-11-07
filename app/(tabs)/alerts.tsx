import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from "react-native";
import { Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { AlertTriangle, CheckCircle, Info, XCircle } from "lucide-react-native";
import { useSims } from "@/contexts/SimsContext";
import { Alert, AlertSeverity } from "@/types/bridge";
import * as Haptics from "expo-haptics";

export default function AlertsScreen() {
  const { alerts, acknowledgeAlert } = useSims();

  const sortedAlerts = [...alerts].sort(
    (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
  );

  const handleAcknowledge = (alertId: string) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    acknowledgeAlert(alertId);
  };

  const getSeverityConfig = (severity: AlertSeverity) => {
    switch (severity) {
      case "critical":
        return {
          color: "#dc2626",
          bgColor: "#fee2e2",
          icon: XCircle,
          label: "CRITICAL",
        };
      case "high":
        return {
          color: "#ea580c",
          bgColor: "#ffedd5",
          icon: AlertTriangle,
          label: "HIGH",
        };
      case "medium":
        return {
          color: "#f59e0b",
          bgColor: "#fef3c7",
          icon: AlertTriangle,
          label: "MEDIUM",
        };
      case "low":
        return {
          color: "#3b82f6",
          bgColor: "#dbeafe",
          icon: Info,
          label: "LOW",
        };
    }
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    return `${diffDays}d ago`;
  };

  const renderAlert = (alert: Alert) => {
    const config = getSeverityConfig(alert.severity);
    const IconComponent = config.icon;

    return (
      <View
        key={alert.id}
        style={[
          styles.alertCard,
          alert.acknowledged && styles.acknowledgedCard,
        ]}
      >
        <View style={styles.alertHeader}>
          <View
            style={[styles.severityBadge, { backgroundColor: config.bgColor }]}
          >
            <IconComponent size={14} color={config.color} />
            <Text style={[styles.severityText, { color: config.color }]}>
              {config.label}
            </Text>
          </View>
          <Text style={styles.timestampText}>
            {formatTimestamp(alert.timestamp)}
          </Text>
        </View>

        <View style={styles.alertContent}>
          <Text style={styles.alertBridge}>{alert.bridgeName}</Text>
          <Text style={styles.alertTitle}>{alert.title}</Text>
          <Text style={styles.alertMessage}>{alert.message}</Text>

          {alert.metric && (
            <View style={styles.metricContainer}>
              <Text style={styles.metricLabel}>{alert.metric}:</Text>
              <Text style={[styles.metricValue, { color: config.color }]}>
                {alert.value}{" "}
                {alert.threshold && `(Threshold: ${alert.threshold})`}
              </Text>
            </View>
          )}
        </View>

        {!alert.acknowledged ? (
          <TouchableOpacity
            style={styles.acknowledgeButton}
            onPress={() => handleAcknowledge(alert.id)}
          >
            <CheckCircle size={18} color="#10b981" />
            <Text style={styles.acknowledgeText}>Acknowledge</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.acknowledgedBadge}>
            <CheckCircle size={16} color="#10b981" />
            <Text style={styles.acknowledgedText}>Acknowledged</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Stack.Screen options={{ title: "Alerts", headerShown: false }} />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Alerts</Text>
        <Text style={styles.headerSubtitle}>
          {alerts.filter((a) => !a.acknowledged).length} unacknowledged
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {sortedAlerts.length === 0 ? (
          <View style={styles.emptyState}>
            <CheckCircle size={64} color="#cbd5e1" />
            <Text style={styles.emptyTitle}>No Alerts</Text>
            <Text style={styles.emptySubtitle}>
              All systems are operating normally
            </Text>
          </View>
        ) : (
          sortedAlerts.map(renderAlert)
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "700" as const,
    color: "#0f172a",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 15,
    color: "#64748b",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  alertCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  acknowledgedCard: {
    opacity: 0.6,
  },
  alertHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  severityBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  severityText: {
    fontSize: 11,
    fontWeight: "700" as const,
    letterSpacing: 0.5,
  },
  timestampText: {
    fontSize: 13,
    color: "#94a3b8",
  },
  alertContent: {
    gap: 8,
  },
  alertBridge: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#2563eb",
  },
  alertTitle: {
    fontSize: 17,
    fontWeight: "600" as const,
    color: "#0f172a",
  },
  alertMessage: {
    fontSize: 15,
    color: "#475569",
    lineHeight: 22,
  },
  metricContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  metricLabel: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: "#64748b",
  },
  metricValue: {
    fontSize: 14,
    fontWeight: "600" as const,
  },
  acknowledgeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#f0fdf4",
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#bbf7d0",
  },
  acknowledgeText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: "#10b981",
  },
  acknowledgedBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    marginTop: 12,
  },
  acknowledgedText: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: "#10b981",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600" as const,
    color: "#0f172a",
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 15,
    color: "#64748b",
    marginTop: 8,
  },
});
