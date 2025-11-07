import createContextHook from "@nkzw/create-context-hook";
import { useState, useCallback, useMemo } from "react";
import { Bridge, Alert } from "@/types/bridge";
import { mockBridges, mockAlerts } from "@/mocks/bridges";

export const [SimsProvider, useSims] = createContextHook(() => {
  const [bridges, setBridges] = useState<Bridge[]>(mockBridges);
  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts);

  const updateBridgeStatus = useCallback(
    (bridgeId: string, metrics: Bridge["metrics"]) => {
      setBridges((prev) =>
        prev.map((bridge) =>
          bridge.id === bridgeId
            ? {
                ...bridge,
                metrics,
                lastInspection: new Date(),
              }
            : bridge
        )
      );
    },
    []
  );

  const acknowledgeAlert = useCallback((alertId: string) => {
    setAlerts((prev) =>
      prev.map((alert) =>
        alert.id === alertId ? { ...alert, acknowledged: true } : alert
      )
    );
  }, []);

  const unacknowledgedAlerts = useMemo(
    () => alerts.filter((alert) => !alert.acknowledged),
    [alerts]
  );

  const criticalAlerts = useMemo(
    () =>
      alerts.filter(
        (alert) => alert.severity === "critical" && !alert.acknowledged
      ),
    [alerts]
  );

  const getBridgeAlerts = useCallback(
    (bridgeId: string) => alerts.filter((alert) => alert.bridgeId === bridgeId),
    [alerts]
  );

  const criticalBridges = useMemo(
    () => bridges.filter((bridge) => bridge.status === "critical"),
    [bridges]
  );

  const warningBridges = useMemo(
    () => bridges.filter((bridge) => bridge.status === "warning"),
    [bridges]
  );

  const healthyBridges = useMemo(
    () => bridges.filter((bridge) => bridge.status === "healthy"),
    [bridges]
  );

  return useMemo(
    () => ({
      bridges,
      alerts,
      updateBridgeStatus,
      acknowledgeAlert,
      unacknowledgedAlerts,
      criticalAlerts,
      getBridgeAlerts,
      criticalBridges,
      warningBridges,
      healthyBridges,
    }),
    [
      bridges,
      alerts,
      updateBridgeStatus,
      acknowledgeAlert,
      unacknowledgedAlerts,
      criticalAlerts,
      getBridgeAlerts,
      criticalBridges,
      warningBridges,
      healthyBridges,
    ]
  );
});
