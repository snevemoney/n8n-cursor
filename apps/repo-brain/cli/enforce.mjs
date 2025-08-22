#!/usr/bin/env node
import { execSync } from "node:child_process";
import fs from "fs";
import path from "path";
import yaml from "js-yaml";

// Load policy configuration
function loadPolicy() {
  try {
    const policyPath = path.join(process.cwd(), "apps/repo-brain/policy/repo_brain.yaml");
    const policyContent = fs.readFileSync(policyPath, "utf8");
    return yaml.load(policyContent);
  } catch (error) {
    console.error("Failed to load policy:", error.message);
    process.exit(1);
  }
}

// Check if path is forbidden
function isForbidden(path, policy) {
  for (const pattern of policy.forbid) {
    const regex = new RegExp(pattern);
    if (regex.test(path)) {
      return true;
    }
  }
  return false;
}

// Apply routing rules
function applyRoutingRules(filePath, content, policy) {
  const fileName = path.basename(filePath).toLowerCase();
  const fileContent = content.toLowerCase();
  
  for (const rule of policy.routing) {
    const regex = new RegExp(rule.match, "i");
    if (regex.test(fileName) || regex.test(fileContent)) {
      return {
        target: rule.to,
        reason: rule.reason,
        priority: rule.priority,
        confidence: 0.9
      };
    }
  }
  return null;
}

// Validate file structure
function validateStructure(filePath, policy) {
  const segments = filePath.split("/");
  const rootDir = segments[0];
  
  if (!policy.roots.includes(rootDir + "/")) {
    return {
      valid: false,
      issue: "File not in allowed root directory",
      suggestion: `Move to one of: ${policy.roots.join(", ")}`
    };
  }
  
  return { valid: true };
}

// Main enforcement logic
function enforceStructure() {
  const policy = loadPolicy();
  const staged = execSync("git diff --name-only --cached", { encoding: "utf8" })
    .trim()
    .split("\n")
    .filter(Boolean);
  
  let issues = [];
  let suggestions = [];
  
  for (const filePath of staged) {
    // Skip if file doesn't exist (deleted)
    if (!fs.existsSync(filePath)) continue;
    
    // Check if forbidden
    if (isForbidden(filePath, policy)) {
      issues.push({
        file: filePath,
        severity: "error",
        message: "File path is forbidden by policy",
        suggestion: "Remove or move to allowed location"
      });
      continue;
    }
    
    // Validate structure
    const structureCheck = validateStructure(filePath, policy);
    if (!structureCheck.valid) {
      issues.push({
        file: filePath,
        severity: "error",
        message: structureCheck.issue,
        suggestion: structureCheck.suggestion
      });
      continue;
    }
    
    // Check for top-level files
    if (!filePath.includes("/")) {
      const ext = path.extname(filePath);
      if ([".sh", ".json", ".yml", ".yaml", ".js", ".ts"].includes(ext)) {
        issues.push({
          file: filePath,
          severity: "error",
          message: "Top-level files are forbidden",
          suggestion: "Move to appropriate subdirectory"
        });
        continue;
      }
    }
    
    // Apply routing rules for suggestions
    try {
      const content = fs.readFileSync(filePath, "utf8").slice(0, 2000);
      const routing = applyRoutingRules(filePath, content, policy);
      
      if (routing) {
        const currentDir = path.dirname(filePath);
        if (currentDir !== routing.target) {
          suggestions.push({
            file: filePath,
            suggested_path: path.join(routing.target, path.basename(filePath)),
            reason: routing.reason,
            confidence: routing.confidence
          });
        }
      }
    } catch (error) {
      // Skip binary files or unreadable files
      continue;
    }
  }
  
  // Report issues
  if (issues.length > 0) {
    console.error("❌ Structure violations found:");
    for (const issue of issues) {
      console.error(`  ${issue.severity.toUpperCase()}: ${issue.file}`);
      console.error(`    ${issue.message}`);
      console.error(`    Suggestion: ${issue.suggestion}`);
    }
  }
  
  // Report suggestions
  if (suggestions.length > 0) {
    console.log("💡 Structure suggestions:");
    for (const suggestion of suggestions) {
      console.log(`  ${suggestion.file} → ${suggestion.suggested_path}`);
      console.log(`    Reason: ${suggestion.reason} (confidence: ${suggestion.confidence})`);
    }
  }
  
  // Check for secrets
  const secretIssues = checkForSecrets(staged, policy);
  if (secretIssues.length > 0) {
    console.error("🔒 Potential secrets found:");
    for (const issue of secretIssues) {
      console.error(`  ${issue.file}:${issue.line} - ${issue.message}`);
    }
  }
  
  // Exit with error if there are blocking issues
  const blockingIssues = issues.filter(i => i.severity === "error");
  if (blockingIssues.length > 0) {
    console.error(`\n❌ ${blockingIssues.length} blocking issues found. Fix before committing.`);
    process.exit(1);
  }
  
  if (issues.length === 0 && suggestions.length === 0) {
    console.log("✅ All staged files pass structure validation");
  }
}

// Check for potential secrets
function checkForSecrets(files, policy) {
  const issues = [];
  
  for (const filePath of files) {
    if (!fs.existsSync(filePath)) continue;
    
    try {
      const content = fs.readFileSync(filePath, "utf8");
      const lines = content.split("\n");
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // Check for forbidden secret patterns
        for (const secret of policy.security.secrets.forbidden_in_code) {
          if (line.includes(secret)) {
            issues.push({
              file: filePath,
              line: i + 1,
              message: `Contains forbidden secret pattern: ${secret}`
            });
          }
        }
        
        // Check for potential secret values
        const secretPatterns = [
          /password\s*[:=]\s*["']?[^"'\s]{8,}["']?/i,
          /secret\s*[:=]\s*["']?[^"'\s]{8,}["']?/i,
          /key\s*[:=]\s*["']?[^"'\s]{8,}["']?/i,
          /token\s*[:=]\s*["']?[^"'\s]{8,}["']?/i
        ];
        
        for (const pattern of secretPatterns) {
          if (pattern.test(line)) {
            // Skip if it's an allowed pattern
            const isAllowed = policy.security.secrets.allowed_patterns.some(
              allowed => line.toLowerCase().includes(allowed.toLowerCase())
            );
            
            if (!isAllowed) {
              issues.push({
                file: filePath,
                line: i + 1,
                message: "Potential secret value detected"
              });
            }
          }
        }
      }
    } catch (error) {
      // Skip binary files
      continue;
    }
  }
  
  return issues;
}

// CLI argument handling
const args = process.argv.slice(2);
const command = args[0];

switch (command) {
  case "--staged":
    enforceStructure();
    break;
  
  case "--help":
    console.log("Usage: enforce.mjs [--staged|--help]");
    console.log("  --staged  Validate all staged files");
    console.log("  --help    Show this help");
    break;
  
  default:
    console.error("Unknown command. Use --help for usage.");
    process.exit(1);
}
