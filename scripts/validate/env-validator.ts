#!/usr/bin/env tsx
/**
 * Environment Validator - Prevents env mixing and missing variables
 * Usage: tsx scripts/validate/env-validator.ts [project] [env]
 * Example: tsx scripts/validate/env-validator.ts lightningflow integration
 */

import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

interface ProjectConfig {
  name: string;
  required_env: string[];
  allow_globs: string[];
  non_goals: string[];
}

interface EnvConfig {
  description: string;
  public_urls: string[];
  internal_urls: string[];
  allowed_ports: number[];
  env_files: string[];
  features: Record<string, boolean>;
}

interface ProjectsConfig {
  projects: Record<string, ProjectConfig>;
}

interface EnvMatrixConfig {
  environments: Record<string, EnvConfig>;
  validation: {
    required_vars: Record<string, string[]>;
    forbidden_patterns: string[];
    allowed_hosts: Record<string, string[]>;
  };
}

function loadConfig<T>(filePath: string): T {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return yaml.load(content) as T;
  } catch (error) {
    console.error(`❌ Failed to load config: ${filePath}`);
    console.error(error);
    process.exit(1);
  }
}

function validateProject(project: string, projectsConfig: ProjectsConfig): ProjectConfig {
  const projectConfig = projectsConfig.projects[project];
  if (!projectConfig) {
    console.error(`❌ Unknown project: ${project}`);
    console.error(`Available projects: ${Object.keys(projectsConfig.projects).join(', ')}`);
    process.exit(1);
  }
  return projectConfig;
}

function validateEnvironment(env: string, envMatrixConfig: EnvMatrixConfig): EnvConfig {
  const envConfig = envMatrixConfig.environments[env];
  if (!envConfig) {
    console.error(`❌ Unknown environment: ${env}`);
    console.error(`Available environments: ${Object.keys(envMatrixConfig.environments).join(', ')}`);
    process.exit(1);
  }
  return envConfig;
}

function validateEnvFile(project: string, env: string, projectConfig: ProjectConfig, envMatrixConfig: EnvMatrixConfig): boolean {
  const envConfig = validateEnvironment(env, envMatrixConfig);
  const requiredVars = envMatrixConfig.validation.required_vars[project] || [];
  
  console.log(`🔍 Validating ${project} environment: ${env}`);
  
  // Check if env file exists
  const envFile = `apps/${project}/.env.${env}`;
  if (!fs.existsSync(envFile)) {
    console.error(`❌ Environment file not found: ${envFile}`);
    return false;
  }
  
  // Load env file
  const envContent = fs.readFileSync(envFile, 'utf8');
  const envVars = Object.fromEntries(
    envContent
      .split('\n')
      .filter(line => line.trim() && !line.startsWith('#'))
      .map(line => line.split('=', 2))
      .filter(([key]) => key)
  );
  
  // Check required variables
  const missing = requiredVars.filter(key => !envVars[key] || envVars[key].trim() === '');
  if (missing.length > 0) {
    console.error(`❌ Missing required environment variables: ${missing.join(', ')}`);
    return false;
  }
  
  // Check forbidden patterns
  const forbiddenPatterns = envMatrixConfig.validation.forbidden_patterns;
  const violations = Object.entries(envVars).filter(([key, value]) => 
    forbiddenPatterns.some(pattern => value.includes(pattern))
  );
  
  if (violations.length > 0) {
    console.error(`❌ Forbidden patterns detected:`);
    violations.forEach(([key, value]) => {
      console.error(`  ${key}: ${value}`);
    });
    return false;
  }
  
  // Check allowed hosts
  const allowedHosts = envMatrixConfig.validation.allowed_hosts[env] || [];
  const hostViolations = Object.entries(envVars).filter(([key, value]) => {
    if (key.includes('URL') || key.includes('HOST')) {
      try {
        const url = new URL(value);
        return !allowedHosts.some(host => url.hostname.endsWith(host));
      } catch {
        return false;
      }
    }
    return false;
  });
  
  if (hostViolations.length > 0) {
    console.error(`❌ Invalid hosts for environment ${env}:`);
    hostViolations.forEach(([key, value]) => {
      console.error(`  ${key}: ${value}`);
    });
    return false;
  }
  
  console.log(`✅ Environment validation passed for ${project}:${env}`);
  console.log(`  Required vars: ${requiredVars.length}`);
  console.log(`  Environment file: ${envFile}`);
  console.log(`  Public URLs: ${envConfig.public_urls.join(', ')}`);
  
  return true;
}

function main() {
  const [project, env] = process.argv.slice(2);
  
  if (!project || !env) {
    console.error('Usage: tsx scripts/validate/env-validator.ts [project] [env]');
    console.error('Example: tsx scripts/validate/env-validator.ts lightningflow integration');
    process.exit(1);
  }
  
  console.log('🔒 Environment Validator');
  console.log(`Project: ${project}`);
  console.log(`Environment: ${env}`);
  console.log('');
  
  // Load configurations
  const projectsConfig = loadConfig<ProjectsConfig>('docs/PROJECTS.yaml');
  const envMatrixConfig = loadConfig<EnvMatrixConfig>('docs/ENV_MATRIX.yaml');
  
  // Validate project and environment
  const projectConfig = validateProject(project, projectsConfig);
  const envConfig = validateEnvironment(env, envMatrixConfig);
  
  // Validate environment file
  const isValid = validateEnvFile(project, env, projectConfig, envMatrixConfig);
  
  if (!isValid) {
    console.error('');
    console.error('❌ Environment validation failed');
    process.exit(1);
  }
  
  console.log('');
  console.log('✅ All validations passed');
}

if (require.main === module) {
  main();
}
