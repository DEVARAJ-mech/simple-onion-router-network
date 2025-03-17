import bodyParser from "body-parser";
import express from "express";
import { BASE_USER_PORT } from "../config";
import crypto from "crypto";
// @ts-ignore
import axios from "axios";
// @ts-ignore
import { nodeRegistry } from "./nodeRegistry";

export type SendMessageBody = {
  message: string;
  destinationUserId: number;
};

export async function user(userId: number) {
  const _user = express();
  _user.use(express.json());
  _user.use(bodyParser.json());

  // Properties to store the last received and sent messages
  let lastReceivedMessage: string | null = null;
  let lastSentMessage: string | null = null;

  // Implement the /status route
  _user.get("/status", (req, res) => {
    res.send("live");
  });

  async function fetchNodeRegistry(): Promise<any[]> {
    // Simulate an asynchronous fetch operation (e.g., from a database or external API)
    return new Promise((resolve) => {
      // Simulate a delay (e.g., network delay)
      setTimeout(() => {
        resolve(nodeRegistry); // Resolve with the in-memory node registry
      }, 100); // 100 milliseconds delay
    });
  }
  async function getRandomNodes(number: number): Promise<http.Server<typeof IncomingMessage, typeof ServerResponse>> {
    const nodeRegistry = await fetchNodeRegistry(); // Fetch the nodes asynchronously

    if (number > nodeRegistry.length) {
      throw new Error("Not enough nodes available to select the requested number.");
    }

  // Implement the /sendMessage route
  // @ts-ignore
    _user.post("/sendMessage", async (req, res) => {
    const { message, destinationUserId } = req.body;

    if (!message || !destinationUserId) {
      return res.status(400).json({ error: "Invalid message or destination" });
    }

    // Create a random circuit of nodes
    const circuitNodes = await getRandomNodes(3); // Implement this function to get 3 distinct nodes

    // Encrypt the message for each node
    let previousValue = message;

    for (const node of circuitNodes) {
      const symmetricKey = generateSymmetricKey(); // Implement key generation
      const destinationId = String(node.id).padStart(10, '0'); // Encode as 10-character string

      const encryptedMessage = encryptMessage(previousValue, symmetricKey); // Encrypt message
      const encryptedKey = encryptSymmetricKey(symmetricKey, node.publicKey); // Encrypt the key

      // Concatenate encrypted key and encrypted message
      previousValue = encryptedKey + encryptedMessage;
    }

    // Send to the entry node
    await sendToNode(circuitNodes[0], previousValue); // Implement this function to send to the node

    // Respond back to acknowledge sending
    res.status(200).json({ message: "Message sent" });
  });

  // Define the sendMessage function (to send to the first node)
  async function sendToNode(node: any, encryptedMessage: string) {
    // Logic to send the message to the specified node
    await axios.post(`http://localhost:${node.port}/message`, { message: encryptedMessage });
  }

  // Placeholder functions for encryption
  function generateSymmetricKey(): string {
    // Generate and return a symmetric key
    return crypto.randomBytes(32).toString("hex"); // Example implementation
  }

  function encryptMessage(message: string, symmetricKey: string): string {
    // Implement encryption logic here
    return "encryptedMessage"; // Replace with actual encryption logic
  }

  function encryptSymmetricKey(symmetricKey: string, publicKey: string): string {
    // Implement RSA encryption logic for the symmetric key
    return "encryptedSymmetricKey"; // Replace with actual encryption logic
  }

  const server = _user.listen(BASE_USER_PORT + userId, () => {
    console.log(
        `User ${userId} is listening on port ${BASE_USER_PORT + userId}`
    );
  });

  return server;
}
