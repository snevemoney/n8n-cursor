#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Web Scraping Agent Template

This template serves as a foundation for building agents that scrape data from websites.
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
from bs4 import BeautifulSoup
import urllib.parse
import re
from concurrent.futures import ThreadPoolExecutor

# ============================================================================
# Configuration (will be replaced by Agent Factory)
# ============================================================================

# Scraping configuration
BASE_URL = "{{base_url}}"
USER_AGENT = "{{user_agent}}"
TIMEOUT = {{timeout}}  # seconds
MAX_PAGES = {{max_pages}}
CONCURRENT_REQUESTS = {{concurrent_requests}}

# Agent configuration
AGENT_NAME = "{{agent_name}}"
AGENT_VERSION = "{{agent_version}}"
LOG_LEVEL = "{{log_level}}"  # DEBUG, INFO, WARNING, ERROR, CRITICAL

# Retry configuration
MAX_RETRIES = {{max_retries}}
RETRY_DELAY = {{retry_delay}}  # seconds

# Output configuration
OUTPUT_FORMAT = "{{output_format}}"  # json, csv, etc.
OUTPUT_FILE = "{{output_file}}"  # Path to output file

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
# Web Scraping Client
# ============================================================================

class WebScrapingClient:
    """Client for web scraping operations."""
    
    def __init__(self, base_url: str, user_agent: str, timeout: int):
        """Initialize the web scraping client."""
        self.base_url = base_url.rstrip('/')
        self.timeout = timeout
        self.session = requests.Session()
        self.session.headers.update({
            "User-Agent": user_agent,
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.5",
            "Accept-Encoding": "gzip, deflate, br",
            "Connection": "keep-alive",
            "Upgrade-Insecure-Requests": "1",
            "Cache-Control": "max-age=0"
        })
        logger.info(f"Initialized web scraping client for {self.base_url}")
    
    def _make_request(self, url: str, params: Dict = None, retries: int = 0) -> BeautifulSoup:
        """Make an HTTP request and return a BeautifulSoup object."""
        # Handle relative URLs
        if not url.startswith(('http://', 'https://')):
            url = urllib.parse.urljoin(self.base_url, url)
        
        try:
            logger.debug(f"Fetching URL: {url}")
            response = self.session.get(
                url,
                params=params,
                timeout=self.timeout
            )
            
            # Add a small delay to be respectful to servers
            time.sleep(1)
            
            # Log request details
            logger.debug(f"Response status: {response.status_code}")
            
            if response.status_code == 200:
                soup = BeautifulSoup(response.text, 'html.parser')
                return soup
            else:
                logger.error(f"HTTP error: {response.status_code} - {url}")
                
                # Retry logic for server errors
                if response.status_code >= 500 and retries < MAX_RETRIES:
                    logger.warning(f"Retrying in {RETRY_DELAY} seconds... (Attempt {retries + 1}/{MAX_RETRIES})")
                    time.sleep(RETRY_DELAY)
                    return self._make_request(url, params, retries + 1)
                
                response.raise_for_status()
                
        except requests.exceptions.RequestException as e:
            logger.error(f"Request failed: {str(e)}")
            
            # Retry for connection errors
            if retries < MAX_RETRIES:
                logger.warning(f"Retrying in {RETRY_DELAY} seconds... (Attempt {retries + 1}/{MAX_RETRIES})")
                time.sleep(RETRY_DELAY)
                return self._make_request(url, params, retries + 1)
            
            raise
    
    def fetch_page(self, url: str, params: Dict = None) -> BeautifulSoup:
        """Fetch a page and return a BeautifulSoup object."""
        return self._make_request(url, params)
    
    def fetch_multiple_pages(self, urls: List[str]) -> List[BeautifulSoup]:
        """Fetch multiple pages concurrently."""
        logger.info(f"Fetching {len(urls)} pages concurrently")
        
        results = []
        with ThreadPoolExecutor(max_workers=CONCURRENT_REQUESTS) as executor:
            futures = [executor.submit(self.fetch_page, url) for url in urls]
            for future in futures:
                try:
                    soup = future.result()
                    results.append(soup)
                except Exception as e:
                    logger.error(f"Error fetching page: {str(e)}")
        
        return results

# ============================================================================
# Parsing Functions
# ============================================================================

def extract_links(soup: BeautifulSoup, pattern: str = None) -> List[str]:
    """Extract links from a BeautifulSoup object, optionally filtered by a regex pattern."""
    links = []
    for a_tag in soup.find_all('a', href=True):
        href = a_tag['href']
        if pattern is None or re.search(pattern, href):
            links.append(href)
    return links

def clean_text(text: str) -> str:
    """Clean and normalize text."""
    if text is None:
        return ""
    
    # Replace multiple whitespace with a single space
    text = re.sub(r'\s+', ' ', text)
    # Strip leading/trailing whitespace
    text = text.strip()
    # Remove non-breaking spaces and other special whitespace
    text = text.replace('\xa0', ' ')
    
    return text

# ============================================================================
# Agent Core Functionality
# ============================================================================

class WebScrapingAgent:
    """Agent for web scraping operations."""
    
    def __init__(self):
        """Initialize the agent."""
        logger.info(f"Initializing {AGENT_NAME} v{AGENT_VERSION}")
        self.client = WebScrapingClient(BASE_URL, USER_AGENT, TIMEOUT)
        self.visited_urls = set()
        self.results = []
        self.custom_init()
    
    def custom_init(self):
        """Custom initialization logic (to be customized)."""
        # This method will be customized by the Agent Factory
        logger.info("Custom initialization complete")
    
    def should_visit_url(self, url: str) -> bool:
        """Determine if a URL should be visited (to be customized)."""
        # This method will be customized by the Agent Factory
        # Default implementation avoids revisiting URLs and respects MAX_PAGES
        if url in self.visited_urls:
            return False
        
        if len(self.visited_urls) >= MAX_PAGES:
            return False
        
        # Only visit URLs from the same domain by default
        parsed_base = urllib.parse.urlparse(BASE_URL)
        parsed_url = urllib.parse.urlparse(url)
        
        return parsed_url.netloc == parsed_base.netloc or not parsed_url.netloc
    
    def parse_page(self, soup: BeautifulSoup, url: str) -> Dict:
        """Parse page content from a BeautifulSoup object (to be customized)."""
        # This method will be customized by the Agent Factory
        # Default implementation extracts title and basic page information
        result = {
            "url": url,
            "title": clean_text(soup.title.text) if soup.title else "No title",
            "timestamp": datetime.now().isoformat()
        }
        return result
    
    def scrape_url(self, url: str) -> Dict:
        """Scrape a single URL."""
        logger.info(f"Scraping URL: {url}")
        
        if url in self.visited_urls:
            logger.debug(f"Skipping already visited URL: {url}")
            return None
        
        try:
            self.visited_urls.add(url)
            soup = self.client.fetch_page(url)
            
            # Extract data from the page
            result = self.parse_page(soup, url)
            self.results.append(result)
            
            # Extract and queue links for further scraping
            links = extract_links(soup)
            new_urls = []
            
            for link in links:
                if self.should_visit_url(link):
                    new_urls.append(link)
            
            return {
                "result": result,
                "new_urls": new_urls
            }
            
        except Exception as e:
            logger.error(f"Error scraping URL {url}: {str(e)}")
            return {
                "result": None,
                "new_urls": []
            }
    
    def execute_task(self, task_params: Dict) -> Dict:
        """Execute the main agent task with the given parameters."""
        logger.info(f"Executing task with parameters: {task_params}")
        
        try:
            start_url = task_params.get("start_url", BASE_URL)
            max_depth = task_params.get("max_depth", 3)
            
            # Breadth-first crawling
            current_urls = [start_url]
            depth = 0
            
            while current_urls and depth < max_depth and len(self.visited_urls) < MAX_PAGES:
                logger.info(f"Crawling depth {depth}: {len(current_urls)} URLs")
                next_urls = []
                
                for url in current_urls:
                    if len(self.visited_urls) >= MAX_PAGES:
                        logger.info(f"Reached maximum number of pages: {MAX_PAGES}")
                        break
                    
                    result = self.scrape_url(url)
                    if result:
                        next_urls.extend(result["new_urls"])
                
                # Move to the next depth level
                current_urls = next_urls
                depth += 1
            
            # Save results
            self.save_results()
            
            return {
                "status": "success",
                "pages_scraped": len(self.results),
                "output_file": OUTPUT_FILE,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error executing task: {str(e)}")
            return {
                "status": "error",
                "error": str(e),
                "timestamp": datetime.now().isoformat()
            }
    
    def save_results(self):
        """Save the scraped results to a file."""
        logger.info(f"Saving {len(self.results)} results to {OUTPUT_FILE}")
        
        os.makedirs(os.path.dirname(os.path.abspath(OUTPUT_FILE)), exist_ok=True)
        
        if OUTPUT_FORMAT.lower() == "json":
            with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
                json.dump(self.results, f, indent=2, ensure_ascii=False)
        elif OUTPUT_FORMAT.lower() == "csv":
            import csv
            
            if not self.results:
                logger.warning("No results to save")
                return
            
            # Get all possible keys
            fieldnames = set()
            for result in self.results:
                fieldnames.update(result.keys())
            
            with open(OUTPUT_FILE, 'w', newline='', encoding='utf-8') as f:
                writer = csv.DictWriter(f, fieldnames=list(fieldnames))
                writer.writeheader()
                writer.writerows(self.results)
        else:
            logger.error(f"Unsupported output format: {OUTPUT_FORMAT}")
    
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
        agent = WebScrapingAgent()
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