import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Activity,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  Thermometer,
  Wind,
  ChevronRight,
} from "lucide-react-native";
import { useSims } from "@/contexts/SimsContext";
import { Bridge, BridgeStatus } from "@/types/bridge";
import * as Haptics from "expo-haptics";

export default function DashboardScreen() {
  const router = useRouter();
  const {
    bridges,
    criticalBridges,
    warningBridges,
    healthyBridges,
    criticalAlerts,
  } = useSims();

  const handleBridgePress = (bridge: Bridge) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push(`/bridge/${bridge.id}` as any);
  };

  const getStatusConfig = (status: BridgeStatus) => {
    switch (status) {
      case "critical":
        return {
          color: "#dc2626",
          bgColor: "#fee2e2",
          icon: AlertCircle,
          label: "Critical",
        };
      case "warning":
        return {
          color: "#f59e0b",
          bgColor: "#fef3c7",
          icon: AlertCircle,
          label: "Warning",
        };
      case "healthy":
        return {
          color: "#10b981",
          bgColor: "#d1fae5",
          icon: CheckCircle,
          label: "Healthy",
        };
    }
  };

  const renderBridgeCard = (bridge: Bridge) => {
    const statusConfig = getStatusConfig(bridge.status);
    const StatusIcon = statusConfig.icon;

    return (
      <TouchableOpacity
        key={bridge.id}
        style={styles.bridgeCard}
        onPress={() => handleBridgePress(bridge)}
      >
        <View style={styles.bridgeHeader}>
          <View style={styles.bridgeInfo}>
            <Text style={styles.bridgeName}>{bridge.name}</Text>
            <Text style={styles.bridgeLocation}>{bridge.location}</Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: statusConfig.bgColor },
            ]}
          >
            <StatusIcon size={16} color={statusConfig.color} />
            <Text style={[styles.statusText, { color: statusConfig.color }]}>
              {statusConfig.label}
            </Text>
          </View>
        </View>

        <View style={styles.metricsRow}>
          <View style={styles.metricItem}>
            <Activity size={16} color="#64748b" />
            <Text style={styles.metricLabel}>Vibration</Text>
            <Text style={styles.metricValue}>
              {bridge.metrics.vibration} Hz
            </Text>
          </View>
          <View style={styles.metricDivider} />
          <View style={styles.metricItem}>
            <TrendingUp size={16} color="#64748b" />
            <Text style={styles.metricLabel}>Stress</Text>
            <Text style={styles.metricValue}>{bridge.metrics.stress}%</Text>
          </View>
          <View style={styles.metricDivider} />
          <View style={styles.metricItem}>
            <Wind size={16} color="#64748b" />
            <Text style={styles.metricLabel}>Tilt</Text>
            <Text style={styles.metricValue}>{bridge.metrics.tilt}°</Text>
          </View>
        </View>

        <View style={styles.bridgeFooter}>
          <View style={styles.lastInspection}>
            <Thermometer size={14} color="#94a3b8" />
            <Text style={styles.lastInspectionText}>
              {bridge.metrics.temperature}°C
            </Text>
          </View>
          <ChevronRight size={20} color="#cbd5e1" />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Stack.Screen options={{ title: "Dashboard", headerShown: false }} />

      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>SIMS Dashboard</Text>
          <Text style={styles.headerSubtitle}>
            Monitoring {bridges.length} bridge{bridges.length !== 1 ? "s" : ""}
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, styles.criticalCard]}>
            <View style={styles.statIcon}>
              <AlertCircle size={24} color="#dc2626" />
            </View>
            <View style={styles.statContent}>
              <Text style={styles.statValue}>{criticalBridges.length}</Text>
              <Text style={styles.statLabel}>Critical</Text>
            </View>
          </View>

          <View style={[styles.statCard, styles.warningCard]}>
            <View style={styles.statIcon}>
              <AlertCircle size={24} color="#f59e0b" />
            </View>
            <View style={styles.statContent}>
              <Text style={styles.statValue}>{warningBridges.length}</Text>
              <Text style={styles.statLabel}>Warning</Text>
            </View>
          </View>

          <View style={[styles.statCard, styles.healthyCard]}>
            <View style={styles.statIcon}>
              <CheckCircle size={24} color="#10b981" />
            </View>
            <View style={styles.statContent}>
              <Text style={styles.statValue}>{healthyBridges.length}</Text>
              <Text style={styles.statLabel}>Healthy</Text>
            </View>
          </View>
        </View>

        {criticalAlerts.length > 0 && (
          <View style={styles.alertBanner}>
            <AlertCircle size={20} color="#dc2626" />
            <View style={styles.alertBannerContent}>
              <Text style={styles.alertBannerTitle}>
                {criticalAlerts.length} Critical Alert
                {criticalAlerts.length !== 1 ? "s" : ""}
              </Text>
              <Text style={styles.alertBannerText}>
                Immediate attention required
              </Text>
            </View>
          </View>
        )}

        {criticalBridges.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Critical Bridges</Text>
            {criticalBridges.map(renderBridgeCard)}
          </View>
        )}

        {warningBridges.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Warning Status</Text>
            {warningBridges.map(renderBridgeCard)}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Healthy Bridges</Text>
          {healthyBridges.map(renderBridgeCard)}
        </View>
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
  statsContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
  },
  criticalCard: {
    backgroundColor: "#fee2e2",
    borderColor: "#fecaca",
  },
  warningCard: {
    backgroundColor: "#fef3c7",
    borderColor: "#fde68a",
  },
  healthyCard: {
    backgroundColor: "#d1fae5",
    borderColor: "#a7f3d0",
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: "#0f172a",
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "500" as const,
    color: "#64748b",
    marginTop: 2,
  },
  alertBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fee2e2",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    gap: 12,
    borderWidth: 1,
    borderColor: "#fecaca",
  },
  alertBannerContent: {
    flex: 1,
  },
  alertBannerTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#dc2626",
    marginBottom: 2,
  },
  alertBannerText: {
    fontSize: 14,
    color: "#991b1b",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: "#0f172a",
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  bridgeCard: {
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
  bridgeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  bridgeInfo: {
    flex: 1,
  },
  bridgeName: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: "#0f172a",
    marginBottom: 4,
  },
  bridgeLocation: {
    fontSize: 14,
    color: "#64748b",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  statusText: {
    fontSize: 13,
    fontWeight: "600" as const,
  },
  metricsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  metricItem: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 2,
  },
  metricValue: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: "#0f172a",
  },
  metricDivider: {
    width: 1,
    height: 40,
    backgroundColor: "#e2e8f0",
  },
  bridgeFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  lastInspection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  lastInspectionText: {
    fontSize: 13,
    color: "#64748b",
  },
});
