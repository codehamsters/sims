const mqtt = require("mqtt");
require("dotenv").config();

const brokerUrl = process.env.MQTT_BROKER_URL;
const username = process.env.MQTT_USERNAME;
const password = process.env.MQTT_PASSWORD;

const client = mqtt.connect(`mqtts://${brokerUrl}`, {
  username,
  password,
});

client.on("connect", () => {
  console.log("Connected to HiveMQ Cloud MQTT broker for publishing");

  const bridgeData = {
    bridgeId: "B789",
    name: "Golden Gate Bridge",
    location: "San Francisco, CA",
    data: {
      vibration: 6.2,
      stress: 75,
      tilt: 0.6,
      temperature: 28,
    },
    timestamp: new Date().toISOString(),
  };

  const topic = "bridge/data";
  const message = JSON.stringify(bridgeData);

  client.publish(topic, message, (err) => {
    if (err) {
      console.error("Failed to publish message:", err);
    } else {
      console.log(`Message published to topic ${topic}: ${message}`);
    }
    client.end();
  });
});

client.on("error", (err) => {
  console.error("MQTT client error:", err);
  client.end();
});
