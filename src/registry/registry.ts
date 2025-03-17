import express from "express";
import bodyParser from "body-parser";
import { registerNode, getNodeRegistry } from "./nodeRegistry";

const app = express();
app.use(bodyParser.json());

let nodeIdCounter = 0; // To assign unique node IDs

// POST route to allow nodes to register
// @ts-ignore
app.post("/registerNode", (req, res) => {
  const { pubKey } = req.body;

  if (!pubKey) {
    return res.status(400).json({ error: "Public key is required." });
  }

  nodeIdCounter += 1; // Increment node ID counter
  registerNode(nodeIdCounter, pubKey);
  res.status(201).json({ message: "Node registered successfully.", nodeId: nodeIdCounter });
});

// Start the registry server
const REGISTRY_PORT = 8080;
app.listen(REGISTRY_PORT, () => {
  console.log(`Node registry is running on port ${REGISTRY_PORT}`);
});
