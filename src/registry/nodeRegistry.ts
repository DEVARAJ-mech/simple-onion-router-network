// In-memory storage for registered nodes
type NodeEntry = {
    nodeId: number;
    pubKey: string;
};

const nodeRegistry: NodeEntry[] = [];

// Function to register a new node
export function registerNode(nodeId: number, pubKey: string) {
    nodeRegistry.push({ nodeId, pubKey });
}

// Function to retrieve all registered nodes
export function getNodeRegistry() {
    return nodeRegistry;
}
