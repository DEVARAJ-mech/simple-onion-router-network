import bodyParser from "body-parser";
import express from "express";
import {BASE_ONION_ROUTER_PORT, BASE_USER_PORT, REGISTRY_PORT} from "../config";
import crypto from "crypto";
// @ts-ignore
import axios from "axios";

export async function simpleOnionRouter(nodeId: number) {
  const onionRouter = express();
  onionRouter.use(express.json());
  onionRouter.use(bodyParser.json());

  // Properties to store the last received messages
  let lastReceivedEncryptedMessage: string | null = null;
  let lastReceivedDecryptedMessage: string | null = null;
  let lastMessageDestination: number | null = null;

  // Generate RSA key pair for the node
  const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
    modulusLength: 2048,
    publicKeyEncoding: { type: "spki", format: "pem" },
    privateKeyEncoding: { type: "pkcs8", format: "pem" },
  });

  async function sendToUser(destinationUserId: number, message: string) {
    try {
      const userPort = BASE_USER_PORT + destinationUserId; // Calculate the user's port
      await axios.post(`http://localhost:${userPort}/receiveMessage`, {
        message: message,
      });
      console.log(`Message sent to user ${destinationUserId}: "${message}"`);
    } catch (error) {
      console.error(`Failed to send message to user ${destinationUserId}:`, error);
    }
  }
  // Register node with the registry
  async function registerNode() {
    try {
      await axios.post(`http://localhost:${REGISTRY_PORT}/registerNode`, {
        nodeId,
        pubKey: Buffer.from(publicKey).toString("base64"),
      });
      console.log(`Node ${nodeId} registered successfully.`);
    } catch (error) {
      console.error("Failed to register node:", error);
    }
  }
  registerNode();

  // Implement the /status route
  onionRouter.get("/status", (req, res) => {
    res.send("live");
  });

  // Implement the /message route to receive messages
  // @ts-ignore
  onionRouter.post("/message", (req, res) => {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // Decrypt the outer layer of the message
    const decryptedMessage = decrypt(message);
    lastReceivedEncryptedMessage = message;
    lastReceivedDecryptedMessage = decryptedMessage;

    // Logic to determine the next node
    const nextNode = getNextNode(decryptedMessage.destinationNodeId); // Extract destination node ID from decryptedMessage
    if (nextNode) {
      // Forward the decrypted message to the next node
      // @ts-ignore
      nextNode.receiveMessage(message); // Assuming receiveMessage method exists
    } else {
      // Final destination logic (send to user)
      sendToUser(decryptedMessage.destinationUserId, decryptedMessage.actualMessage); // Implement this function
    }

    res.json({ result: "Message received and processed" });
  });

  // Placeholder for decrypt function
  function decrypt(encryptedMessage: string): any {
    // Implement decryption logic here
    return { destinationNodeId: 0, actualMessage: "Decrypted Message" }; // Replace with actual decryption logic
  }

  // Placeholder function to get the next node based on destination
  function getNextNode(destination: number) {
    // Implement logic to retrieve the next node
    return null; // Replace with actual node retrieval logic
  }

  const server = onionRouter.listen(BASE_ONION_ROUTER_PORT + nodeId, () => {
    console.log(
        `Onion router ${nodeId} is listening on port ${BASE_ONION_ROUTER_PORT + nodeId}`
    );
  });

  return server;
}
