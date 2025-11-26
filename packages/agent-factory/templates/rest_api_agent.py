#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
REST API Agent Template

This template serves as a foundation for building agents that interact with REST APIs.
The Agent Factory will customize this template with specific configurations.

Placeholders marked with {{double_curly_braces}} will be replaced during agent generation.
"""

import os
import sys
import json
import time
import logging
import requests
from typing import Dict, List, Any, Union, Optional
from datetime import datetime

# ============================================================================
# Configuration (will be replaced by Agent Factory)
# ============================================================================

# API connection details
API_BASE_URL = "{{api_base_url}}"
API_KEY = "{{api_key}}"
API_VERSION = "{{api_version}}"
TIMEOUT = {{timeout}}  # seconds

# Agent configuration
AGENT_NAME = "{{agent_name}}"
AGENT_VERSION = "{{agent_version}}"
LOG_LEVEL = "{{log_level}}"  # DEBUG, INFO, WARNING, ERROR, CRITICAL

# Retry configuration
MAX_RETRIES = {{max_retries}}
RETRY_DELAY = {{retry_delay}}  # seconds

# ============================================================================
# Logging Setup
# ============================================================================

def setup_logging():
    """Configure logging for the agent."""
    log_format = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    logging.basicConfig(
        level=getattr(logging, LOG_LEVEL),
        format=log_format,
        handlers=[
            logging.StreamHandler(sys.stdout),
            logging.FileHandler(f"{AGENT_NAME}.log")
        ]
    )
    return logging.getLogger(AGENT_NAME)

logger = setup_logging()

# ============================================================================
# API Client
# ============================================================================

class RESTApiClient:
    """Client for interacting with the REST API."""
    
    def __init__(self, base_url: str, api_key: str, version: str, timeout: int):
        """Initialize the API client."""
        self.base_url = base_url.rstrip('/')
        self.api_key = api_key
        self.version = version
        self.timeout = timeout
        self.session = requests.Session()
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "Accept": "application/json",
            "User-Agent": f"{AGENT_NAME}/{AGENT_VERSION}"
        }
        logger.info(f"Initialized REST API client for {self.base_url}")
    
    def _make_request(self, method: str, endpoint: str, params: Dict = None, 
                     data: Dict = None, retries: int = 0) -> Dict:
        """Make an HTTP request to the API with retry logic."""
        url = f"{self.base_url}/{self.version}/{endpoint.lstrip('/')}"
        
        try:
            response = self.session.request(
                method=method,
                url=url,
                headers=self.headers,
                params=params,
                json=data,
                timeout=self.timeout
            )
            
            # Log request details
            logger.debug(f"Request: {method} {url}")
            if params:
                logger.debug(f"Params: {params}")
            if data:
                logger.debug(f"Data: {json.dumps(data)[:1000]}...")
            
            # Handle response
            logger.debug(f"Response status: {response.status_code}")
            
            if response.status_code >= 200 and response.status_code < 300:
                return response.json()
            else:
                logger.error(f"API error: {response.status_code} - {response.text}")
                
                # Retry logic for server errors or rate limits
                if (response.status_code >= 500 or response.status_code == 429) and retries < MAX_RETRIES:
                    retry_after = int(response.headers.get('Retry-After', RETRY_DELAY))
                    logger.warning(f"Retrying in {retry_after} seconds... (Attempt {retries + 1}/{MAX_RETRIES})")
                    time.sleep(retry_after)
                    return self._make_request(method, endpoint, params, data, retries + 1)
                
                response.raise_for_status()
                
        except requests.exceptions.RequestException as e:
            logger.error(f"Request failed: {str(e)}")
            
            # Retry for connection errors
            if retries < MAX_RETRIES:
                logger.warning(f"Retrying in {RETRY_DELAY} seconds... (Attempt {retries + 1}/{MAX_RETRIES})")
                time.sleep(RETRY_DELAY)
                return self._make_request(method, endpoint, params, data, retries + 1)
            
            raise
    
    def get(self, endpoint: str, params: Dict = None) -> Dict:
        """Perform a GET request."""
        return self._make_request("GET", endpoint, params=params)
    
    def post(self, endpoint: str, data: Dict) -> Dict:
        """Perform a POST request."""
        return self._make_request("POST", endpoint, data=data)
    
    def put(self, endpoint: str, data: Dict) -> Dict:
        """Perform a PUT request."""
        return self._make_request("PUT", endpoint, data=data)
    
    def delete(self, endpoint: str, params: Dict = None) -> Dict:
        """Perform a DELETE request."""
        return self._make_request("DELETE", endpoint, params=params)
    
    def patch(self, endpoint: str, data: Dict) -> Dict:
        """Perform a PATCH request."""
        return self._make_request("PATCH", endpoint, data=data)

# ============================================================================
# Agent Core Functionality
# ============================================================================

class RESTApiAgent:
    """Agent for interacting with a REST API."""
    
    def __init__(self):
        """Initialize the agent."""
        logger.info(f"Initializing {AGENT_NAME} v{AGENT_VERSION}")
        self.client = RESTApiClient(API_BASE_URL, API_KEY, API_VERSION, TIMEOUT)
        self.custom_init()
    
    def custom_init(self):
        """Custom initialization logic (to be customized)."""
        # This method will be customized by the Agent Factory
        logger.info("Custom initialization complete")
    
    def execute_task(self, task_params: Dict) -> Dict:
        """Execute the main agent task with the given parameters."""
        logger.info(f"Executing task with parameters: {task_params}")
        
        try:
            # This is where the main agent logic will be implemented
            # Below is just an example that will be replaced by the Agent Factory
            result = self.client.get("example/endpoint", params=task_params)
            return {
                "status": "success",
                "data": result,
                "timestamp": datetime.now().isoformat()
            }
        except Exception as e:
            logger.error(f"Error executing task: {str(e)}")
            return {
                "status": "error",
                "error": str(e),
                "timestamp": datetime.now().isoformat()
            }
    
    def run(self, task_params: Dict = None) -> Dict:
        """Run the agent with optional task parameters."""
        logger.info(f"Running {AGENT_NAME}")
        
        if task_params is None:
            task_params = {}
        
        start_time = time.time()
        result = self.execute_task(task_params)
        execution_time = time.time() - start_time
        
        logger.info(f"Task completed in {execution_time:.2f} seconds")
        return result

# ============================================================================
# Main Execution
# ============================================================================

def main():
    """Main function to run the agent."""
    logger.info(f"Starting {AGENT_NAME} v{AGENT_VERSION}")
    
    try:
        # Parse command line arguments if provided
        task_params = {}
        if len(sys.argv) > 1:
            try:
                task_params = json.loads(sys.argv[1])
            except json.JSONDecodeError:
                logger.error("Invalid JSON in command line argument")
                return 1
        
        # Run the agent
        agent = RESTApiAgent()
        result = agent.run(task_params)
        
        # Print the result
        print(json.dumps(result, indent=2))
        
        if result["status"] == "success":
            return 0
        else:
            return 1
    
    except Exception as e:
        logger.critical(f"Unhandled exception: {str(e)}", exc_info=True)
        return 1

if __name__ == "__main__":
    sys.exit(main()) 