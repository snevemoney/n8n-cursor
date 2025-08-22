#!/usr/bin/env python3
"""
Dynamic GitHub Projects Board Sync with MCP Integration
This script keeps your GitHub Projects board updated with real-time data
"""

import os
import sys
import yaml
import json
import time
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Any
import requests
from pathlib import Path

# Add the project root to the path
project_root = Path(__file__).parent.parent.parent
sys.path.insert(0, str(project_root))

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('logs/project-board-sync.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class ProjectBoardSync:
    """Dynamic GitHub Projects Board Synchronization"""
    
    def __init__(self, config_path: str = "config/project-board.yml"):
        self.config_path = config_path
        self.config = self.load_config()
        self.github_token = os.getenv('GITHUB_TOKEN')
        self.github_api_base = "https://api.github.com"
        
        if not self.github_token:
            raise ValueError("GITHUB_TOKEN environment variable is required")
            
        self.headers = {
            'Authorization': f'token {self.github_token}',
            'Accept': 'application/vnd.github.v3+json'
        }
        
    def load_config(self) -> Dict[str, Any]:
        """Load the project board configuration"""
        try:
            with open(self.config_path, 'r') as f:
                return yaml.safe_load(f)
        except FileNotFoundError:
            logger.error(f"Configuration file not found: {self.config_path}")
            sys.exit(1)
            
    def get_project_id(self) -> str:
        """Get the GitHub Projects project ID"""
        # This would need to be configured or discovered
        # For now, we'll use a placeholder
        return os.getenv('GITHUB_PROJECT_ID', 'your-project-id-here')
        
    def create_project_item(self, title: str, body: str, column: str, labels: List[str] = None) -> bool:
        """Create a new item in the specified project column"""
        try:
            # First create an issue
            issue_data = {
                'title': title,
                'body': body,
                'labels': labels or []
            }
            
            response = requests.post(
                f"{self.github_api_base}/repos/snevemoney/n8n-cursor/issues",
                headers=self.headers,
                json=issue_data
            )
            
            if response.status_code == 201:
                issue = response.json()
                logger.info(f"Created issue: {issue['title']}")
                
                # Now add it to the project board
                return self.add_issue_to_project(issue['id'], column)
            else:
                logger.error(f"Failed to create issue: {response.status_code}")
                return False
                
        except Exception as e:
            logger.error(f"Error creating project item: {e}")
            return False
            
    def add_issue_to_project(self, issue_id: int, column: str) -> bool:
        """Add an issue to the specified project column"""
        try:
            project_id = self.get_project_id()
            
            # Get the column ID for the specified column name
            column_id = self.get_column_id(column)
            if not column_id:
                logger.error(f"Column not found: {column}")
                return False
                
            # Add the issue to the project
            response = requests.post(
                f"{self.github_api_base}/projects/columns/{column_id}/cards",
                headers=self.headers,
                json={'content_id': issue_id, 'content_type': 'Issue'}
            )
            
            if response.status_code == 201:
                logger.info(f"Added issue {issue_id} to column {column}")
                return True
            else:
                logger.error(f"Failed to add issue to project: {response.status_code}")
                return False
                
        except Exception as e:
            logger.error(f"Error adding issue to project: {e}")
            return False
            
    def get_column_id(self, column_name: str) -> str:
        """Get the column ID for a given column name"""
        try:
            project_id = self.get_project_id()
            
            response = requests.get(
                f"{self.github_api_base}/projects/{project_id}/columns",
                headers=self.headers
            )
            
            if response.status_code == 200:
                columns = response.json()
                for column in columns:
                    if column['name'] == column_name:
                        return str(column['id'])
                        
            logger.error(f"Column '{column_name}' not found")
            return None
            
        except Exception as e:
            logger.error(f"Error getting column ID: {e}")
            return None
            
    def sync_github_actions(self) -> None:
        """Sync GitHub Actions status to the project board"""
        try:
            # Get recent workflow runs
            response = requests.get(
                f"{self.github_api_base}/repos/snevemoney/n8n-cursor/actions/runs",
                headers=self.headers,
                params={'per_page': 10}
            )
            
            if response.status_code == 200:
                runs = response.json()['workflow_runs']
                
                for run in runs:
                    workflow_name = run['workflow']['name']
                    status = run['conclusion'] or run['status']
                    environment = run.get('environment', 'unknown')
                    branch = run['head_branch']
                    sha = run['head_sha'][:8]
                    
                    # Check if we should create an item based on config
                    self.process_workflow_run(workflow_name, status, environment, branch, sha)
                    
        except Exception as e:
            logger.error(f"Error syncing GitHub Actions: {e}")
            
    def process_workflow_run(self, workflow_name: str, status: str, environment: str, branch: str, sha: str) -> None:
        """Process a workflow run and create project items if needed"""
        try:
            mcp_rules = self.config.get('mcp_integration', {}).get('github_actions', [])
            
            for rule in mcp_rules:
                if rule['workflow'] == workflow_name:
                    if rule['trigger'] == 'on_success' and status == 'success':
                        self.create_project_item(
                            title=rule['title'].replace('{{ env }}', environment)
                                   .replace('{{ branch }}', branch)
                                   .replace('{{ sha }}', sha),
                            body=rule['body'].replace('{{ env }}', environment)
                                   .replace('{{ branch }}', branch)
                                   .replace('{{ sha }}', sha),
                            column=rule['column'],
                            labels=['deployment', 'success', 'automation']
                        )
                    elif rule['trigger'] == 'on_failure' and status == 'failure':
                        self.create_project_item(
                            title=rule['title'].replace('{{ env }}', environment)
                                   .replace('{{ branch }}', branch)
                                   .replace('{{ sha }}', sha),
                            body=rule['body'].replace('{{ env }}', environment)
                                   .replace('{{ branch }}', branch)
                                   .replace('{{ sha }}', sha),
                            column=rule['column'],
                            labels=['deployment', 'failure', 'urgent', 'automation']
                        )
                        
        except Exception as e:
            logger.error(f"Error processing workflow run: {e}")
            
    def sync_n8n_status(self) -> None:
        """Sync n8n workflow status to the project board"""
        try:
            # This would integrate with n8n MCP tools
            # For now, we'll create a placeholder
            logger.info("n8n status sync would happen here with MCP integration")
            
        except Exception as e:
            logger.error(f"Error syncing n8n status: {e}")
            
    def run_sync(self) -> None:
        """Run the complete synchronization process"""
        logger.info("Starting project board synchronization...")
        
        try:
            # Sync GitHub Actions
            self.sync_github_actions()
            
            # Sync n8n status
            self.sync_n8n_status()
            
            logger.info("Project board synchronization completed successfully")
            
        except Exception as e:
            logger.error(f"Error during synchronization: {e}")
            
    def run_continuous(self, interval_minutes: int = 1) -> None:
        """Run continuous synchronization at specified intervals"""
        logger.info(f"Starting continuous sync every {interval_minutes} minute(s)")
        
        try:
            while True:
                self.run_sync()
                time.sleep(interval_minutes * 60)
                
        except KeyboardInterrupt:
            logger.info("Continuous sync stopped by user")
        except Exception as e:
            logger.error(f"Error in continuous sync: {e}")

def main():
    """Main entry point"""
    try:
        # Create logs directory if it doesn't exist
        Path('logs').mkdir(exist_ok=True)
        
        # Initialize the sync
        sync = ProjectBoardSync()
        
        # Check command line arguments
        if len(sys.argv) > 1 and sys.argv[1] == '--continuous':
            interval = int(sys.argv[2]) if len(sys.argv) > 2 else 1
            sync.run_continuous(interval)
        else:
            # Run once
            sync.run_sync()
            
    except Exception as e:
        logger.error(f"Fatal error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
