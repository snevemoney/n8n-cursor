// Export all orchestrator functionality
export * from "./phases";
export * from "./tool-registry";
export * from "./run-pipeline";
export { registerAllTools } from "./register-tools";

// Initialize tools on module load
import "./register-tools";

