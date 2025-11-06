import { readFileSync } from "node:fs";
import yaml from "yaml";

console.log("🔌 Linting port usage...");

try {
  // Read ports registry
  const portsFile = readFileSync('tooling/ports.yml', 'utf8');
  const registry = yaml.parse(portsFile);
  
  // Extract allowed ports
  const allowed = new Set(Object.values(registry).map(String));
  
  // Read docker-compose files
  const composeFiles = [
    'docker-compose.yml',
    'docker-compose.integration.yml',
    'docker-compose.staging.yml'
  ];
  
  let hasErrors = false;
  
  for (const file of composeFiles) {
    try {
      const compose = readFileSync(file, 'utf8');
      const used = [...compose.matchAll(/:(\d{2,5})\b/g)].map(m => m[1]);
      
      for (const port of used) {
        if (!allowed.has(port)) {
          console.error(`❌ Port ${port} in ${file} not registered in tooling/ports.yml`);
          hasErrors = true;
        }
      }
      
      console.log(`✅ ${file} - ports validated`);
    } catch (error) {
      if (error.code === 'ENOENT') {
        console.log(`⚠️  ${file} not found, skipping`);
      } else {
        throw error;
      }
    }
  }
  
  if (hasErrors) {
    console.error("❌ Port validation failed!");
    process.exit(1);
  }
  
  console.log("✅ All ports are properly registered!");
  
} catch (error) {
  console.error("❌ Error during port validation:", error.message);
  process.exit(1);
}
