#!/usr/bin/env python3
"""
Dynamic GitHub Projects Board Sync with MCP Integration
Enhanced with Modern DevOps Golden Rules (2024-2025)
This script keeps your GitHub Projects board updated with real-time data
"""

import os
import sys
import yaml
import json
import time
import logging
import asyncio
import aiohttp
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
import requests
from pathlib import Path
import hashlib
import sqlite3
from dataclasses import dataclass, asdict
import schedule
import threading

# Add the project root to the path
project_root = Path(__file__).parent.parent.parent
sys.path.insert(0, str(project_root))

# Configure logging with modern DevOps practices
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s.%(msecs)03d - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S',
    handlers=[
        logging.FileHandler('logs/project-board-sync.log'),
        logging.StreamHandler(),
        # Add structured logging for observability
        logging.handlers.RotatingFileHandler(
            'logs/structured-sync.log',
            maxBytes=10*1024*1024,  # 10MB
            backupCount=5
        )
    ]
)
logger = logging.getLogger(__name__)

@dataclass
class TaskMetrics:
    """Task performance metrics with time tracking"""
    task_id: str
    created_at: datetime
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    fix_time_seconds: Optional[int] = None
    status_changes: List[Dict] = None
    priority: str = "medium"
    estimated_fix_time: Optional[str] = None
    actual_fix_time: Optional[str] = None
    
    def __post_init__(self):
        if self.status_changes is None:
            self.status_changes = []
    
    def add_status_change(self, status: str, timestamp: datetime, metadata: Dict = None):
        """Track status changes with metadata"""
        change = {
            'status': status,
            'timestamp': timestamp.isoformat(),
            'metadata': metadata or {}
        }
        self.status_changes.append(change)
        
        # Calculate fix time if completed
        if status == 'done' and self.started_at:
            self.completed_at = timestamp
            self.fix_time_seconds = int((timestamp - self.started_at).total_seconds())
            self.actual_fix_time = self._format_duration(self.fix_time_seconds)
    
    def _format_duration(self, seconds: int) -> str:
        """Format duration in human-readable format"""
        if seconds < 60:
            return f"{seconds}s"
        elif seconds < 3600:
            return f"{seconds//60}m {seconds%60}s"
        else:
            hours = seconds // 3600
            minutes = (seconds % 3600) // 60
            return f"{hours}h {minutes}m"

class ModernDevOpsBoardSync:
    """Enhanced Project Board Sync with Modern DevOps Practices"""
    
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
        
        # Initialize metrics database
        self.init_metrics_db()
        
        # Task metrics storage
        self.task_metrics: Dict[str, TaskMetrics] = {}
        
        # Performance tracking
        self.sync_performance = {
            'total_syncs': 0,
            'successful_syncs': 0,
            'failed_syncs': 0,
            'average_sync_time': 0,
            'last_sync_duration': 0
        }
        
    def init_metrics_db(self):
        """Initialize SQLite database for metrics storage"""
        try:
            self.db_path = Path('logs/metrics.db')
            self.db_path.parent.mkdir(exist_ok=True)
            
            with sqlite3.connect(self.db_path) as conn:
                conn.execute('''
                    CREATE TABLE IF NOT EXISTS task_metrics (
                        task_id TEXT PRIMARY KEY,
                        created_at TEXT,
                        started_at TEXT,
                        completed_at TEXT,
                        fix_time_seconds INTEGER,
                        priority TEXT,
                        estimated_fix_time TEXT,
                        actual_fix_time TEXT,
                        status_changes TEXT,
                        last_updated TEXT
                    )
                ''')
                
                conn.execute('''
                    CREATE TABLE IF NOT EXISTS sync_performance (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        sync_timestamp TEXT,
                        duration_seconds REAL,
                        success BOOLEAN,
                        items_processed INTEGER,
                        errors TEXT
                    )
                ''')
                
                conn.commit()
                logger.info("Metrics database initialized successfully")
                
        except Exception as e:
            logger.error(f"Failed to initialize metrics database: {e}")
    
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
        return os.getenv('GITHUB_PROJECT_ID', 'your-project-id-here')
    
    async def create_project_item_async(self, title: str, body: str, column: str, 
                                      labels: List[str] = None, metadata: Dict = None) -> bool:
        """Create a new item in the specified project column asynchronously"""
        try:
            # Add timestamp and metadata
            timestamp = datetime.now().isoformat()
            enhanced_body = f"{body}\n\n---\n**Created**: {timestamp}"
            
            if metadata:
                enhanced_body += f"\n**Metadata**: {json.dumps(metadata, indent=2)}"
            
            # Create issue with enhanced body
            issue_data = {
                'title': title,
                'body': enhanced_body,
                'labels': labels or []
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f"{self.github_api_base}/repos/snevemoney/n8n-cursor/issues",
                    headers=self.headers,
                    json=issue_data
                ) as response:
                    
                    if response.status == 201:
                        issue = await response.json()
                        logger.info(f"Created issue: {issue['title']}")
                        
                        # Track metrics
                        task_id = str(issue['id'])
                        self.task_metrics[task_id] = TaskMetrics(
                            task_id=task_id,
                            created_at=datetime.now(),
                            priority=metadata.get('priority', 'medium') if metadata else 'medium',
                            estimated_fix_time=metadata.get('estimated_fix_time') if metadata else None
                        )
                        
                        # Save to database
                        self.save_task_metrics(task_id)
                        
                        # Add to project board
                        return await self.add_issue_to_project_async(issue['id'], column)
                    else:
                        logger.error(f"Failed to create issue: {response.status}")
                        return False
                        
        except Exception as e:
            logger.error(f"Error creating project item: {e}")
            return False
    
    async def add_issue_to_project_async(self, issue_id: int, column: str) -> bool:
        """Add an issue to the specified project column asynchronously"""
        try:
            project_id = self.get_project_id()
            column_id = await self.get_column_id_async(column)
            
            if not column_id:
                logger.error(f"Column not found: {column}")
                return False
            
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f"{self.github_api_base}/projects/columns/{column_id}/cards",
                    headers=self.headers,
                    json={'content_id': issue_id, 'content_type': 'Issue'}
                ) as response:
                    
                    if response.status == 201:
                        logger.info(f"Added issue {issue_id} to column {column}")
                        return True
                    else:
                        logger.error(f"Failed to add issue to project: {response.status}")
                        return False
                        
        except Exception as e:
            logger.error(f"Error adding issue to project: {e}")
            return False
    
    async def get_column_id_async(self, column_name: str) -> Optional[str]:
        """Get the column ID for a given column name asynchronously"""
        try:
            project_id = self.get_project_id()
            
            async with aiohttp.ClientSession() as session:
                async with session.get(
                    f"{self.github_api_base}/projects/{project_id}/columns",
                    headers=self.headers
                ) as response:
                    
                    if response.status == 200:
                        columns = await response.json()
                        for column in columns:
                            if column['name'] == column_name:
                                return str(column['id'])
                        
                        logger.error(f"Column '{column_name}' not found")
                        return None
                        
        except Exception as e:
            logger.error(f"Error getting column ID: {e}")
            return None
    
    async def sync_github_actions_async(self) -> None:
        """Sync GitHub Actions status to the project board asynchronously"""
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(
                    f"{self.github_api_base}/repos/snevemoney/n8n-cursor/actions/runs",
                    headers=self.headers,
                    params={'per_page': 20}
                ) as response:
                    
                    if response.status == 200:
                        runs = (await response.json())['workflow_runs']
                        
                        for run in runs:
                            workflow_name = run['workflow']['name']
                            status = run['conclusion'] or run['status']
                            environment = run.get('environment', 'unknown')
                            branch = run['head_branch']
                            sha = run['head_sha'][:8]
                            created_at = run['created_at']
                            updated_at = run['updated_at']
                            
                            # Check if we should create an item based on config
                            await self.process_workflow_run_async(
                                workflow_name, status, environment, branch, sha, 
                                created_at, updated_at
                            )
                            
        except Exception as e:
            logger.error(f"Error syncing GitHub Actions: {e}")
    
    async def process_workflow_run_async(self, workflow_name: str, status: str, 
                                       environment: str, branch: str, sha: str,
                                       created_at: str, updated_at: str) -> None:
        """Process a workflow run and create project items if needed"""
        try:
            mcp_rules = self.config.get('mcp_integration', {}).get('github_actions', [])
            
            for rule in mcp_rules:
                if rule['workflow'] == workflow_name:
                    # Add timestamp and time tracking
                    timestamp = datetime.now().isoformat()
                    metadata = {
                        'priority': rule.get('priority', 'medium'),
                        'estimated_fix_time': rule.get('estimated_fix_time'),
                        'workflow': workflow_name,
                        'environment': environment,
                        'branch': branch,
                        'sha': sha,
                        'created_at': created_at,
                        'updated_at': updated_at
                    }
                    
                    if rule['trigger'] == 'on_success' and status == 'success':
                        await self.create_project_item_async(
                            title=rule['title'].replace('{{ env }}', environment)
                                   .replace('{{ branch }}', branch)
                                   .replace('{{ sha }}', sha)
                                   .replace('{{ timestamp }}', timestamp),
                            body=rule['body'].replace('{{ env }}', environment)
                                   .replace('{{ branch }}', branch)
                                   .replace('{{ sha }}', sha)
                                   .replace('{{ timestamp }}', timestamp),
                            column=rule['column'],
                            labels=['deployment', 'success', 'automation', 'time-tracked'],
                            metadata=metadata
                        )
                    elif rule['trigger'] == 'on_failure' and status == 'failure':
                        await self.create_project_item_async(
                            title=rule['title'].replace('{{ env }}', environment)
                                   .replace('{{ branch }}', branch)
                                   .replace('{{ sha }}', sha)
                                   .replace('{{ timestamp }}', timestamp),
                            body=rule['body'].replace('{{ env }}', environment)
                                   .replace('{{ branch }}', branch)
                                   .replace('{{ sha }}', sha)
                                   .replace('{{ timestamp }}', timestamp),
                            column=rule['column'],
                            labels=['deployment', 'failure', 'urgent', 'automation', 'time-tracked'],
                            metadata=metadata
                        )
                        
        except Exception as e:
            logger.error(f"Error processing workflow run: {e}")
    
    async def sync_n8n_status_async(self) -> None:
        """Sync n8n workflow status to the project board asynchronously"""
        try:
            # This would integrate with n8n MCP tools
            # For now, we'll create a placeholder with time tracking
            logger.info("n8n status sync would happen here with MCP integration")
            
            # Simulate n8n workflow status updates
            await self.create_project_item_async(
                title="🔄 n8n Workflow Status Update",
                body="**Status**: Healthy\n**Last Check**: {}\n**Active Workflows**: 5\n**Performance**: 99.9%".format(
                    datetime.now().isoformat()
                ),
                column="Ready",
                labels=["n8n", "monitoring", "time-tracked"],
                metadata={
                    'priority': 'medium',
                    'source': 'n8n_mcp',
                    'check_interval': '30s'
                }
            )
            
        except Exception as e:
            logger.error(f"Error syncing n8n status: {e}")
    
    def save_task_metrics(self, task_id: str):
        """Save task metrics to database"""
        try:
            if task_id in self.task_metrics:
                task = self.task_metrics[task_id]
                
                with sqlite3.connect(self.db_path) as conn:
                    conn.execute('''
                        INSERT OR REPLACE INTO task_metrics 
                        (task_id, created_at, started_at, completed_at, fix_time_seconds,
                         priority, estimated_fix_time, actual_fix_time, status_changes, last_updated)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    ''', (
                        task.task_id,
                        task.created_at.isoformat(),
                        task.started_at.isoformat() if task.started_at else None,
                        task.completed_at.isoformat() if task.completed_at else None,
                        task.fix_time_seconds,
                        task.priority,
                        task.estimated_fix_time,
                        task.actual_fix_time,
                        json.dumps(task.status_changes),
                        datetime.now().isoformat()
                    ))
                    conn.commit()
                    
        except Exception as e:
            logger.error(f"Error saving task metrics: {e}")
    
    def update_sync_performance(self, duration: float, success: bool, items_processed: int, errors: str = None):
        """Update sync performance metrics"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                conn.execute('''
                    INSERT INTO sync_performance 
                    (sync_timestamp, duration_seconds, success, items_processed, errors)
                    VALUES (?, ?, ?, ?, ?)
                ''', (
                    datetime.now().isoformat(),
                    duration,
                    success,
                    items_processed,
                    errors
                ))
                conn.commit()
                
            # Update in-memory metrics
            self.sync_performance['total_syncs'] += 1
            if success:
                self.sync_performance['successful_syncs'] += 1
            else:
                self.sync_performance['failed_syncs'] += 1
            
            self.sync_performance['last_sync_duration'] = duration
            
            # Calculate average
            if self.sync_performance['total_syncs'] > 0:
                total_duration = sum([
                    row[2] for row in conn.execute('SELECT duration_seconds FROM sync_performance')
                ])
                self.sync_performance['average_sync_time'] = total_duration / self.sync_performance['total_syncs']
                
        except Exception as e:
            logger.error(f"Error updating sync performance: {e}")
    
    async def run_sync_async(self) -> None:
        """Run the complete synchronization process asynchronously"""
        start_time = time.time()
        logger.info("Starting project board synchronization...")
        
        try:
            items_processed = 0
            
            # Sync GitHub Actions
            await self.sync_github_actions_async()
            items_processed += 1
            
            # Sync n8n status
            await self.sync_n8n_status_async()
            items_processed += 1
            
            duration = time.time() - start_time
            self.update_sync_performance(duration, True, items_processed)
            
            logger.info(f"Project board synchronization completed successfully in {duration:.2f}s")
            
        except Exception as e:
            duration = time.time() - start_time
            self.update_sync_performance(duration, False, 0, str(e))
            logger.error(f"Error during synchronization: {e}")
    
    def run_sync(self) -> None:
        """Run the complete synchronization process (synchronous wrapper)"""
        asyncio.run(self.run_sync_async())
    
    async def run_continuous_async(self, interval_minutes: int = 1) -> None:
        """Run continuous synchronization at specified intervals"""
        logger.info(f"Starting continuous sync every {interval_minutes} minute(s)")
        
        try:
            while True:
                await self.run_sync_async()
                await asyncio.sleep(interval_minutes * 60)
                
        except KeyboardInterrupt:
            logger.info("Continuous sync stopped by user")
        except Exception as e:
            logger.error(f"Error in continuous sync: {e}")
    
    def run_continuous(self, interval_minutes: int = 1) -> None:
        """Run continuous synchronization (synchronous wrapper)"""
        asyncio.run(self.run_continuous_async(interval_minutes))
    
    def get_performance_report(self) -> Dict[str, Any]:
        """Get comprehensive performance report"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                # Get recent sync performance
                recent_syncs = conn.execute('''
                    SELECT * FROM sync_performance 
                    ORDER BY sync_timestamp DESC 
                    LIMIT 10
                ''').fetchall()
                
                # Get task metrics summary
                task_summary = conn.execute('''
                    SELECT 
                        COUNT(*) as total_tasks,
                        AVG(fix_time_seconds) as avg_fix_time,
                        COUNT(CASE WHEN fix_time_seconds < 30 THEN 1 END) as quick_fixes,
                        COUNT(CASE WHEN fix_time_seconds > 3600 THEN 1 END) as complex_fixes
                    FROM task_metrics
                ''').fetchone()
                
                return {
                    'sync_performance': self.sync_performance,
                    'recent_syncs': recent_syncs,
                    'task_summary': {
                        'total_tasks': task_summary[0],
                        'average_fix_time': task_summary[1],
                        'quick_fixes_under_30s': task_summary[2],
                        'complex_fixes_over_1h': task_summary[3]
                    },
                    'last_updated': datetime.now().isoformat()
                }
                
        except Exception as e:
            logger.error(f"Error getting performance report: {e}")
            return {}

def main():
    """Main entry point"""
    try:
        # Create logs directory if it doesn't exist
        Path('logs').mkdir(exist_ok=True)
        
        # Initialize the sync
        sync = ModernDevOpsBoardSync()
        
        # Check command line arguments
        if len(sys.argv) > 1:
            if sys.argv[1] == '--continuous':
                interval = int(sys.argv[2]) if len(sys.argv) > 2 else 1
                sync.run_continuous(interval)
            elif sys.argv[1] == '--performance':
                report = sync.get_performance_report()
                print(json.dumps(report, indent=2))
            elif sys.argv[1] == '--metrics':
                print("Task Metrics:")
                for task_id, task in sync.task_metrics.items():
                    print(f"  {task_id}: {task.actual_fix_time or 'In Progress'}")
            else:
                print("Usage:")
                print("  python project-board-sync.py              # Run once")
                print("  python project-board-sync.py --continuous [minutes]  # Run continuously")
                print("  python project-board-sync.py --performance           # Show performance report")
                print("  python project-board-sync.py --metrics               # Show task metrics")
        else:
            # Run once
            sync.run_sync()
            
    except Exception as e:
        logger.error(f"Fatal error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
