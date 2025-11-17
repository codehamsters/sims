require("dotenv").config();
const mqtt = require("mqtt");
const brokerUrl = process.env.MQTT_BROKER_URL;
const username = process.env.MQTT_USERNAME;
const password = process.env.MQTT_PASSWORD;

const client = mqtt.connect(`mqtts://${brokerUrl}`, {
  username,
  password,
});

client.on("connect", () => {
  console.log("Connected to HiveMQ Cloud MQTT broker!");
});
client.on("error", (err) => {
  console.error("MQTT connection error:", err);
});
client.on("close", () => {
  console.log("MQTT connection closed.");
});
const Bridge = require("../models/Bridge");
const Alert = require("../models/Alert");
const PushToken = require("../models/PushToken");
const { Expo } = require("expo-server-sdk");
const expo = new Expo();
require("dotenv").config();

client.on("connect", () => {
  console.log("Connected to MQTT broker");
  client.subscribe("bridge/data", (err) => {
    if (err) {
      console.error("Failed to subscribe to bridge/data topic:", err);
    } else {
      console.log("Subscribed to bridge/data topic");
    }
  });
});

client.on("message", async (topic, message) => {
  if (topic === "bridge/data") {
    try {
      const data = JSON.parse(message.toString());
      console.log("Received MQTT data:", data);

      const { bridgeId, data: metrics, timestamp } = data;

      // Calculate status based on thresholds
      const status = calculateStatus(metrics);

      // Update or create bridge
      await Bridge.findOneAndUpdate(
        { id: bridgeId },
        {
          $set: {
            metrics,
            lastInspection: timestamp ? new Date(timestamp) : new Date(),
            status: status,
            name: data.name || `Bridge ${bridgeId}`,
            location: data.location || "Default Location",
          },
        },
        { upsert: true, runValidators: true }
      );

      const bridge = await Bridge.findOne({ id: bridgeId });

      // Generate alerts if necessary
      await generateAlerts(bridge, metrics);
    } catch (error) {
      console.error("Error processing MQTT message:", error);
    }
  }
});

function calculateStatus(metrics) {
  const { vibration, stress, tilt } = metrics;

  if (vibration > 8 || stress > 85 || tilt > 1.0) {
    return "critical";
  } else if (vibration > 5 || stress > 65 || tilt > 0.4) {
    return "warning";
  } else {
    return "healthy";
  }
}

async function sendPushNotifications(title, body) {
  const tokens = await PushToken.find({});
  const messages = [];
  for (const { token } of tokens) {
    if (!Expo.isExpoPushToken(token)) {
      console.error(`Push token ${token} is not a valid Expo push token`);
      continue;
    }
    messages.push({
      to: token,
      sound: "default",
      title,
      body,
    });
  }

  const chunks = expo.chunkPushNotifications(messages);
  for (const chunk of chunks) {
    try {
      await expo.sendPushNotificationsAsync(chunk);
    } catch (error) {
      console.error("Error sending push notifications:", error);
    }
  }
}

async function generateAlerts(bridge, metrics) {
  const alerts = [];
  const { vibration, stress, tilt } = metrics;

  if (vibration > 8) {
    alerts.push({
      id: `${bridge.id}-vibration-${Date.now()}`,
      bridgeId: bridge.id,
      bridgeName: bridge.name,
      title: "Critical Vibration Detected",
      message:
        "Bridge vibration exceeded critical threshold. Immediate inspection required.",
      severity: "critical",
      metric: "Vibration",
      value: vibration,
      threshold: 8,
    });
  } else if (vibration > 5) {
    alerts.push({
      id: `${bridge.id}-vibration-${Date.now()}`,
      bridgeId: bridge.id,
      bridgeName: bridge.name,
      title: "Elevated Vibration",
      message: "Vibration levels above normal range. Monitoring closely.",
      severity: "medium",
      metric: "Vibration",
      value: vibration,
      threshold: 5,
    });
  }

  if (stress > 85) {
    alerts.push({
      id: `${bridge.id}-stress-${Date.now()}`,
      bridgeId: bridge.id,
      bridgeName: bridge.name,
      title: "High Stress Levels",
      message: "Structural stress levels approaching maximum capacity.",
      severity: "critical",
      metric: "Stress",
      value: stress,
      threshold: 85,
    });
  } else if (stress > 65) {
    alerts.push({
      id: `${bridge.id}-stress-${Date.now()}`,
      bridgeId: bridge.id,
      bridgeName: bridge.name,
      title: "Stress Warning",
      message: "Stress levels increased.",
      severity: "medium",
      metric: "Stress",
      value: stress,
      threshold: 65,
    });
  }

  if (tilt > 1.0) {
    alerts.push({
      id: `${bridge.id}-tilt-${Date.now()}`,
      bridgeId: bridge.id,
      bridgeName: bridge.name,
      title: "Critical Tilt Detected",
      message:
        "Bridge tilt exceeded critical threshold. Immediate inspection required.",
      severity: "critical",
      metric: "Tilt",
      value: tilt,
      threshold: 1.0,
    });
  } else if (tilt > 0.4) {
    alerts.push({
      id: `${bridge.id}-tilt-${Date.now()}`,
      bridgeId: bridge.id,
      bridgeName: bridge.name,
      title: "Tilt Anomaly Detected",
      message: "Minor tilt anomaly detected.",
      severity: "low",
      metric: "Tilt",
      value: tilt,
      threshold: 0.4,
    });
  }

  for (const alertData of alerts) {
    const existingAlert = await Alert.findOne({
      bridgeId: alertData.bridgeId,
      metric: alertData.metric,
      acknowledged: false,
    }).sort({ timestamp: -1 });

    if (!existingAlert || new Date() - existingAlert.timestamp > 3600000) {
      // 1 hour
      await Alert.create(alertData);
      console.log("Alert generated:", alertData.title);
      await sendPushNotifications(alertData.title, alertData.message);
    }
  }
}

module.exports = client;
