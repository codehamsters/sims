import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Info, Radio, Shield, Bell, ChevronRight } from "lucide-react-native";

export default function SettingsScreen() {
  const settingsGroups = [
    {
      title: "Notifications",
      items: [
        {
          icon: Bell,
          label: "Push Notifications",
          value: "Enabled",
        },
        {
          icon: Radio,
          label: "Alert Frequency",
          value: "Real-time",
        },
      ],
    },
    {
      title: "Security",
      items: [
        {
          icon: Shield,
          label: "Data Encryption",
          value: "Enabled",
        },
      ],
    },
    {
      title: "About",
      items: [
        {
          icon: Info,
          label: "App Version",
          value: "1.0.0",
        },
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Stack.Screen options={{ title: "Settings", headerShown: false }} />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
        <Text style={styles.headerSubtitle}>Configure your SIMS app</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <View style={styles.iconContainer}>
              <Shield size={32} color="#2563eb" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>SIMS</Text>
              <Text style={styles.infoSubtitle}>
                Structure Integrity Monitoring System
              </Text>
            </View>
          </View>
          <Text style={styles.infoDescription}>
            Real-time bridge monitoring using IoT sensors to detect structural
            anomalies and ensure infrastructure safety.
          </Text>
        </View>

        {settingsGroups.map((group, groupIndex) => (
          <View key={groupIndex} style={styles.settingsGroup}>
            <Text style={styles.groupTitle}>{group.title}</Text>
            <View style={styles.groupCard}>
              {group.items.map((item, itemIndex) => {
                const IconComponent = item.icon;
                return (
                  <TouchableOpacity
                    key={itemIndex}
                    style={[
                      styles.settingItem,
                      itemIndex < group.items.length - 1 &&
                        styles.settingItemBorder,
                    ]}
                  >
                    <View style={styles.settingLeft}>
                      <View style={styles.settingIconContainer}>
                        <IconComponent size={20} color="#64748b" />
                      </View>
                      <Text style={styles.settingLabel}>{item.label}</Text>
                    </View>
                    <View style={styles.settingRight}>
                      <Text style={styles.settingValue}>{item.value}</Text>
                      <ChevronRight size={20} color="#cbd5e1" />
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Developed for critical infrastructure monitoring
          </Text>
          <Text style={styles.footerCopyright}>
            © 2025 SIMS. All rights reserved.
          </Text>
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
  infoCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: "#eff6ff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: "#0f172a",
    marginBottom: 2,
  },
  infoSubtitle: {
    fontSize: 13,
    color: "#64748b",
    fontWeight: "500" as const,
  },
  infoDescription: {
    fontSize: 15,
    color: "#475569",
    lineHeight: 22,
  },
  settingsGroup: {
    marginBottom: 24,
  },
  groupTitle: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: "#64748b",
    textTransform: "uppercase" as const,
    letterSpacing: 0.5,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  groupCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  settingItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  settingIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#f8fafc",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: "500" as const,
    color: "#0f172a",
  },
  settingRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  settingValue: {
    fontSize: 15,
    color: "#64748b",
  },
  footer: {
    alignItems: "center",
    paddingVertical: 32,
  },
  footerText: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 4,
  },
  footerCopyright: {
    fontSize: 12,
    color: "#94a3b8",
  },
});
