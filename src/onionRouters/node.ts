import crypto from "crypto";

// Type for storing a node's keys
type NodeKeys = {
    publicKey: string;
    privateKey: string;
};

// In-memory storage for each node's key pair
const nodeKeys: { [nodeId: number]: NodeKeys } = {};

// Function to generate an RSA key pair
export function generateKeyPair(nodeId: number) {
    const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
        modulusLength: 2048,
        publicKeyEncoding: { type: "spki", format: "pem" },
        privateKeyEncoding: { type: "pkcs8", format: "pem" },
    });

    nodeKeys[nodeId] = { publicKey, privateKey };
}

// Function to get a node's private key
export function getPrivateKey(nodeId: number): string | null {
    return nodeKeys[nodeId]?.privateKey || null;
}

// Function to get a node's public key
export function getPublicKey(nodeId: number): string | null {
    return nodeKeys[nodeId]?.publicKey || null;
}
