#!/usr/bin/env python3
"""
Master Roadmap Generator with MCP Integration
Analyzes chat history, vector embeddings, and GitHub data to create comprehensive project roadmaps
Based on Modern DevOps Golden Rules (2024-2025)
"""

import os
import sys
import yaml
import json
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
from pathlib import Path
import sqlite3
import re
from dataclasses import dataclass, asdict
import requests
from collections import defaultdict
import hashlib

# Add the project root to the path
project_root = Path(__file__).parent.parent.parent
sys.path.insert(0, str(project_root))

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@dataclass
class RoadmapItem:
    """Individual roadmap item with metadata"""
    id: str
    title: str
    description: str
    category: str
    priority: str
    timeline: str
    estimated_effort: str
    dependencies: List[str]
    status: str
    created_from: str
    created_at: datetime
    updated_at: datetime
    metadata: Dict[str, Any]
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization"""
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'category': self.category,
            'priority': self.priority,
            'timeline': self.timeline,
            'estimated_effort': self.estimated_effort,
            'dependencies': self.dependencies,
            'status': self.status,
            'created_from': self.created_from,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'metadata': self.metadata
        }

class MasterRoadmapGenerator:
    """Generates comprehensive project roadmaps from multiple data sources"""
    
    def __init__(self, config_path: str = "config/project-board.yml"):
        self.config_path = config_path
        self.config = self.load_config()
        self.github_token = os.getenv('GITHUB_TOKEN')
        self.roadmap_items: Dict[str, RoadmapItem] = {}
        
        # Initialize roadmap database
        self.init_roadmap_db()
        
        # Load existing roadmap items
        self.load_existing_roadmap()
        
    def load_config(self) -> Dict[str, Any]:
        """Load the project board configuration"""
        try:
            with open(self.config_path, 'r') as f:
                return yaml.safe_load(f)
        except FileNotFoundError:
            logger.error(f"Configuration file not found: {self.config_path}")
            sys.exit(1)
    
    def init_roadmap_db(self):
        """Initialize SQLite database for roadmap storage"""
        try:
            self.db_path = Path('logs/roadmap.db')
            self.db_path.parent.mkdir(exist_ok=True)
            
            with sqlite3.connect(self.db_path) as conn:
                conn.execute('''
                    CREATE TABLE IF NOT EXISTS roadmap_items (
                        id TEXT PRIMARY KEY,
                        title TEXT,
                        description TEXT,
                        category TEXT,
                        priority TEXT,
                        timeline TEXT,
                        estimated_effort TEXT,
                        dependencies TEXT,
                        status TEXT,
                        created_from TEXT,
                        created_at TEXT,
                        updated_at TEXT,
                        metadata TEXT
                    )
                ''')
                
                conn.execute('''
                    CREATE TABLE IF NOT EXISTS roadmap_analysis (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        analysis_timestamp TEXT,
                        total_items INTEGER,
                        categories TEXT,
                        priorities TEXT,
                        timelines TEXT,
                        insights TEXT
                    )
                ''')
                
                conn.commit()
                logger.info("Roadmap database initialized successfully")
                
        except Exception as e:
            logger.error(f"Failed to initialize roadmap database: {e}")
    
    def load_existing_roadmap(self):
        """Load existing roadmap items from database"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.execute('SELECT * FROM roadmap_items')
                for row in cursor.fetchall():
                    item = RoadmapItem(
                        id=row[0],
                        title=row[1],
                        description=row[2],
                        category=row[3],
                        priority=row[4],
                        timeline=row[5],
                        estimated_effort=row[6],
                        dependencies=json.loads(row[7]) if row[7] else [],
                        status=row[8],
                        created_from=row[9],
                        created_at=datetime.fromisoformat(row[10]),
                        updated_at=datetime.fromisoformat(row[11]),
                        metadata=json.loads(row[12]) if row[12] else {}
                    )
                    self.roadmap_items[item.id] = item
                    
            logger.info(f"Loaded {len(self.roadmap_items)} existing roadmap items")
            
        except Exception as e:
            logger.error(f"Error loading existing roadmap: {e}")
    
    def save_roadmap_item(self, item: RoadmapItem):
        """Save roadmap item to database"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                conn.execute('''
                    INSERT OR REPLACE INTO roadmap_items 
                    (id, title, description, category, priority, timeline, estimated_effort,
                     dependencies, status, created_from, created_at, updated_at, metadata)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    item.id,
                    item.title,
                    item.description,
                    item.category,
                    item.priority,
                    item.timeline,
                    item.estimated_effort,
                    json.dumps(item.dependencies),
                    item.status,
                    item.created_from,
                    item.created_at.isoformat(),
                    item.updated_at.isoformat(),
                    json.dumps(item.metadata)
                ))
                conn.commit()
                
        except Exception as e:
            logger.error(f"Error saving roadmap item: {e}")
    
    def analyze_chat_history(self) -> List[RoadmapItem]:
        """Analyze chat history to extract roadmap items"""
        items = []
        
        try:
            # This would integrate with actual chat history
            # For now, we'll create sample items based on our conversation
            
            chat_based_items = [
                {
                    'title': '🚀 Production-Ready Deployment Pipeline',
                    'description': 'Complete self-healing deployment pipeline with rollback, health checks, and Slack notifications',
                    'category': 'Infrastructure & DevOps',
                    'priority': 'critical',
                    'timeline': 'immediate',
                    'estimated_effort': '2-3 days',
                    'dependencies': [],
                    'status': 'completed',
                    'created_from': 'chat_history'
                },
                {
                    'title': '🔌 MCP Integration & Dynamic Project Board',
                    'description': 'Real-time project board with MCP tools, time tracking, and auto-updating capabilities',
                    'category': 'AI & MCP Integration',
                    'priority': 'high',
                    'timeline': 'short-term',
                    'estimated_effort': '1-2 days',
                    'status': 'in_progress',
                    'created_from': 'chat_history'
                },
                {
                    'title': '📊 Master Roadmap with Vector Intelligence',
                    'description': 'AI-powered roadmap generation from chat history, GitHub data, and vector embeddings',
                    'category': 'AI & MCP Integration',
                    'priority': 'high',
                    'timeline': 'medium-term',
                    'estimated_effort': '3-5 days',
                    'dependencies': ['MCP Integration & Dynamic Project Board'],
                    'status': 'planned',
                    'created_from': 'chat_history'
                },
                {
                    'title': '🛡️ Advanced Security & Monitoring',
                    'description': 'SOC2 compliance, comprehensive logging, and AI-powered threat detection',
                    'category': 'Security & Monitoring',
                    'priority': 'critical',
                    'timeline': 'ongoing',
                    'estimated_effort': '1-2 weeks',
                    'dependencies': [],
                    'status': 'planned',
                    'created_from': 'chat_history'
                },
                {
                    'title': '🌐 Multi-Cloud Infrastructure',
                    'description': 'AWS, Azure, and GCP integration with unified management and cost optimization',
                    'category': 'Infrastructure & DevOps',
                    'priority': 'high',
                    'timeline': 'long-term',
                    'estimated_effort': '2-3 weeks',
                    'dependencies': ['Production-Ready Deployment Pipeline'],
                    'status': 'planned',
                    'created_from': 'chat_history'
                }
            ]
            
            for item_data in chat_based_items:
                item = RoadmapItem(
                    id=self._generate_item_id(item_data['title']),
                    title=item_data['title'],
                    description=item_data['description'],
                    category=item_data['category'],
                    priority=item_data['priority'],
                    timeline=item_data['timeline'],
                    estimated_effort=item_data['estimated_effort'],
                    dependencies=item_data.get('dependencies', []),
                    status=item_data['status'],
                    created_from=item_data['created_from'],
                    created_at=datetime.now(),
                    updated_at=datetime.now(),
                    metadata={
                        'source': 'chat_analysis',
                        'confidence': 0.95,
                        'extracted_at': datetime.now().isoformat()
                    }
                )
                
                items.append(item)
                self.roadmap_items[item.id] = item
                self.save_roadmap_item(item)
            
            logger.info(f"Generated {len(items)} roadmap items from chat history")
            
        except Exception as e:
            logger.error(f"Error analyzing chat history: {e}")
        
        return items
    
    def analyze_github_data(self) -> List[RoadmapItem]:
        """Analyze GitHub data to extract roadmap items"""
        items = []
        
        if not self.github_token:
            logger.warning("GitHub token not available, skipping GitHub analysis")
            return items
        
        try:
            headers = {
                'Authorization': f'token {self.github_token}',
                'Accept': 'application/vnd.github.v3+json'
            }
            
            # Analyze issues and pull requests
            response = requests.get(
                'https://api.github.com/repos/snevemoney/n8n-cursor/issues',
                headers=headers,
                params={'state': 'open', 'per_page': 100}
            )
            
            if response.status_code == 200:
                issues = response.json()
                
                for issue in issues:
                    # Skip if already in roadmap
                    if any(item.title == issue['title'] for item in self.roadmap_items.values()):
                        continue
                    
                    # Analyze issue content for roadmap potential
                    if self._is_roadmap_candidate(issue):
                        item = RoadmapItem(
                            id=f"github_{issue['number']}",
                            title=issue['title'],
                            description=issue['body'] or 'No description provided',
                            category=self._categorize_issue(issue),
                            priority=self._determine_priority(issue),
                            timeline=self._estimate_timeline(issue),
                            estimated_effort=self._estimate_effort(issue),
                            dependencies=self._extract_dependencies(issue),
                            status='planned',
                            created_from='github_analysis',
                            created_at=datetime.now(),
                            updated_at=datetime.now(),
                            metadata={
                                'github_issue_number': issue['number'],
                                'github_url': issue['html_url'],
                                'labels': [label['name'] for label in issue['labels']],
                                'assignees': [assignee['login'] for assignee in issue['assignees']],
                                'source': 'github_analysis'
                            }
                        )
                        
                        items.append(item)
                        self.roadmap_items[item.id] = item
                        self.save_roadmap_item(item)
                
                logger.info(f"Generated {len(items)} roadmap items from GitHub data")
            
        except Exception as e:
            logger.error(f"Error analyzing GitHub data: {e}")
        
        return items
    
    def _is_roadmap_candidate(self, issue: Dict[str, Any]) -> bool:
        """Determine if an issue should be included in the roadmap"""
        # Check for roadmap-related labels
        roadmap_labels = ['roadmap', 'feature', 'enhancement', 'infrastructure', 'devops']
        issue_labels = [label['name'].lower() for label in issue['labels']]
        
        if any(label in roadmap_labels for label in issue_labels):
            return True
        
        # Check for roadmap-related keywords in title
        roadmap_keywords = ['roadmap', 'feature', 'enhancement', 'improve', 'add', 'implement']
        title_lower = issue['title'].lower()
        
        if any(keyword in title_lower for keyword in roadmap_keywords):
            return True
        
        return False
    
    def _categorize_issue(self, issue: Dict[str, Any]) -> str:
        """Categorize an issue based on content and labels"""
        # Default categories from config
        categories = [
            'Infrastructure & DevOps',
            'n8n Workflows', 
            'AI & MCP Integration',
            'Security & Monitoring',
            'Documentation & Training'
        ]
        
        # Analyze labels and content for categorization
        issue_labels = [label['name'].lower() for label in issue['labels']]
        content = (issue['title'] + ' ' + (issue['body'] or '')).lower()
        
        if any(label in ['devops', 'infrastructure', 'deployment'] for label in issue_labels):
            return 'Infrastructure & DevOps'
        elif any(label in ['n8n', 'workflow', 'automation'] for label in issue_labels):
            return 'n8n Workflows'
        elif any(label in ['ai', 'mcp', 'ml'] for label in issue_labels):
            return 'AI & MCP Integration'
        elif any(label in ['security', 'monitoring', 'logging'] for label in issue_labels):
            return 'Security & Monitoring'
        elif any(label in ['docs', 'documentation', 'training'] for label in issue_labels):
            return 'Documentation & Training'
        
        # Default based on content analysis
        if 'deploy' in content or 'infrastructure' in content:
            return 'Infrastructure & DevOps'
        elif 'workflow' in content or 'n8n' in content:
            return 'n8n Workflows'
        elif 'ai' in content or 'mcp' in content:
            return 'AI & MCP Integration'
        else:
            return 'Infrastructure & DevOps'  # Default category
    
    def _determine_priority(self, issue: Dict[str, Any]) -> str:
        """Determine priority based on labels and content"""
        issue_labels = [label['name'].lower() for label in issue['labels']]
        
        if any(label in ['critical', 'urgent', 'p0'] for label in issue_labels):
            return 'critical'
        elif any(label in ['high', 'p1'] for label in issue_labels):
            return 'high'
        elif any(label in ['medium', 'p2'] for label in issue_labels):
            return 'medium'
        elif any(label in ['low', 'p3'] for label in issue_labels):
            return 'low'
        
        # Default priority
        return 'medium'
    
    def _estimate_timeline(self, issue: Dict[str, Any]) -> str:
        """Estimate timeline based on priority and complexity"""
        priority = self._determine_priority(issue)
        content = (issue['title'] + ' ' + (issue['body'] or '')).lower()
        
        if priority == 'critical':
            return 'immediate'
        elif priority == 'high':
            return 'short-term'
        elif 'complex' in content or 'major' in content:
            return 'long-term'
        else:
            return 'medium-term'
    
    def _estimate_effort(self, issue: Dict[str, Any]) -> str:
        """Estimate effort based on content analysis"""
        content = (issue['title'] + ' ' + (issue['body'] or '')).lower()
        
        if any(word in content for word in ['simple', 'quick', 'minor']):
            return '1-2 hours'
        elif any(word in content for word in ['moderate', 'medium']):
            return '1-2 days'
        elif any(word in content for word in ['complex', 'major', 'refactor']):
            return '1-2 weeks'
        else:
            return '1-2 days'  # Default estimate
    
    def _extract_dependencies(self, issue: Dict[str, Any]) -> List[str]:
        """Extract dependencies from issue content"""
        dependencies = []
        content = issue['body'] or ''
        
        # Look for dependency patterns
        dep_patterns = [
            r'depends on (\w+)',
            r'requires (\w+)',
            r'blocked by (\w+)',
            r'after (\w+)'
        ]
        
        for pattern in dep_patterns:
            matches = re.findall(pattern, content, re.IGNORECASE)
            dependencies.extend(matches)
        
        return list(set(dependencies))  # Remove duplicates
    
    def _generate_item_id(self, title: str) -> str:
        """Generate a unique ID for a roadmap item"""
        # Create a hash-based ID from the title
        title_hash = hashlib.md5(title.encode()).hexdigest()[:8]
        return f"roadmap_{title_hash}"
    
    def generate_master_roadmap(self) -> Dict[str, Any]:
        """Generate the complete master roadmap"""
        logger.info("Generating master roadmap...")
        
        # Analyze all data sources
        chat_items = self.analyze_chat_history()
        github_items = self.analyze_github_data()
        
        # Combine all items
        all_items = list(self.roadmap_items.values())
        
        # Generate insights and analysis
        insights = self._generate_insights(all_items)
        
        # Create roadmap structure
        roadmap = {
            'generated_at': datetime.now().isoformat(),
            'total_items': len(all_items),
            'categories': self._categorize_items(all_items),
            'priorities': self._prioritize_items(all_items),
            'timelines': self._timeline_items(all_items),
            'dependencies': self._analyze_dependencies(all_items),
            'insights': insights,
            'items': [item.to_dict() for item in all_items]
        }
        
        # Save analysis to database
        self._save_roadmap_analysis(roadmap)
        
        return roadmap
    
    def _generate_insights(self, items: List[RoadmapItem]) -> Dict[str, Any]:
        """Generate insights from roadmap items"""
        insights = {
            'critical_path': [],
            'quick_wins': [],
            'resource_allocation': {},
            'risk_assessment': {},
            'recommendations': []
        }
        
        # Identify critical path items
        critical_items = [item for item in items if item.priority == 'critical']
        insights['critical_path'] = [item.title for item in critical_items]
        
        # Identify quick wins (low effort, high impact)
        quick_wins = [item for item in items 
                     if 'hour' in item.estimated_effort.lower() and item.priority in ['high', 'critical']]
        insights['quick_wins'] = [item.title for item in quick_wins]
        
        # Resource allocation by category
        category_counts = defaultdict(int)
        for item in items:
            category_counts[item.category] += 1
        insights['resource_allocation'] = dict(category_counts)
        
        # Risk assessment
        high_risk_items = [item for item in items 
                          if item.priority == 'critical' and 'week' in item.estimated_effort.lower()]
        insights['risk_assessment'] = {
            'high_risk_items': [item.title for item in high_risk_items],
            'risk_level': 'high' if high_risk_items else 'medium'
        }
        
        # Generate recommendations
        if critical_items:
            insights['recommendations'].append(
                f"Focus on {len(critical_items)} critical items first"
            )
        
        if quick_wins:
            insights['recommendations'].append(
                f"Implement {len(quick_wins)} quick wins for immediate impact"
            )
        
        return insights
    
    def _categorize_items(self, items: List[RoadmapItem]) -> Dict[str, List[str]]:
        """Categorize items by category"""
        categories = defaultdict(list)
        for item in items:
            categories[item.category].append(item.title)
        return dict(categories)
    
    def _prioritize_items(self, items: List[RoadmapItem]) -> Dict[str, List[str]]:
        """Group items by priority"""
        priorities = defaultdict(list)
        for item in items:
            priorities[item.priority].append(item.title)
        return dict(priorities)
    
    def _timeline_items(self, items: List[RoadmapItem]) -> Dict[str, List[str]]:
        """Group items by timeline"""
        timelines = defaultdict(list)
        for item in items:
            timelines[item.timeline].append(item.title)
        return dict(timelines)
    
    def _analyze_dependencies(self, items: List[RoadmapItem]) -> Dict[str, List[str]]:
        """Analyze item dependencies"""
        dependencies = defaultdict(list)
        for item in items:
            for dep in item.dependencies:
                dependencies[dep].append(item.title)
        return dict(dependencies)
    
    def _save_roadmap_analysis(self, roadmap: Dict[str, Any]):
        """Save roadmap analysis to database"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                conn.execute('''
                    INSERT INTO roadmap_analysis 
                    (analysis_timestamp, total_items, categories, priorities, timelines, insights)
                    VALUES (?, ?, ?, ?, ?, ?)
                ''', (
                    roadmap['generated_at'],
                    roadmap['total_items'],
                    json.dumps(roadmap['categories']),
                    json.dumps(roadmap['priorities']),
                    json.dumps(roadmap['timelines']),
                    json.dumps(roadmap['insights'])
                ))
                conn.commit()
                
        except Exception as e:
            logger.error(f"Error saving roadmap analysis: {e}")
    
    def export_roadmap(self, format: str = 'json') -> str:
        """Export roadmap in specified format"""
        roadmap = self.generate_master_roadmap()
        
        if format == 'json':
            return json.dumps(roadmap, indent=2)
        elif format == 'yaml':
            return yaml.dump(roadmap, default_flow_style=False, indent=2)
        elif format == 'markdown':
            return self._roadmap_to_markdown(roadmap)
        else:
            raise ValueError(f"Unsupported format: {format}")
    
    def _roadmap_to_markdown(self, roadmap: Dict[str, Any]) -> str:
        """Convert roadmap to Markdown format"""
        md = f"# 🗺️ Master Roadmap - n8n-cursor\n\n"
        md += f"**Generated**: {roadmap['generated_at']}\n"
        md += f"**Total Items**: {roadmap['total_items']}\n\n"
        
        # Insights
        md += "## 📊 Insights\n\n"
        insights = roadmap['insights']
        
        if insights['critical_path']:
            md += "### 🚨 Critical Path\n"
            for item in insights['critical_path']:
                md += f"- {item}\n"
            md += "\n"
        
        if insights['quick_wins']:
            md += "### ⚡ Quick Wins\n"
            for item in insights['quick_wins']:
                md += f"- {item}\n"
            md += "\n"
        
        # Categories
        md += "## 📂 Categories\n\n"
        for category, items in roadmap['categories'].items():
            md += f"### {category}\n"
            for item in items:
                md += f"- {item}\n"
            md += "\n"
        
        # Priorities
        md += "## 🎯 Priorities\n\n"
        for priority, items in roadmap['priorities'].items():
            md += f"### {priority.title()}\n"
            for item in items:
                md += f"- {item}\n"
            md += "\n"
        
        # Timelines
        md += "## ⏰ Timelines\n\n"
        for timeline, items in roadmap['timelines'].items():
            md += f"### {timeline.title()}\n"
            for item in items:
                md += f"- {item}\n"
            md += "\n"
        
        # Detailed Items
        md += "## 📋 Detailed Items\n\n"
        for item in roadmap['items']:
            md += f"### {item['title']}\n"
            md += f"**Category**: {item['category']}\n"
            md += f"**Priority**: {item['priority']}\n"
            md += f"**Timeline**: {item['timeline']}\n"
            md += f"**Effort**: {item['estimated_effort']}\n"
            md += f"**Status**: {item['status']}\n"
            if item['dependencies']:
                md += f"**Dependencies**: {', '.join(item['dependencies'])}\n"
            md += f"\n{item['description']}\n\n"
        
        return md

def main():
    """Main entry point"""
    try:
        # Initialize the roadmap generator
        generator = MasterRoadmapGenerator()
        
        # Check command line arguments
        if len(sys.argv) > 1:
            if sys.argv[1] == '--export':
                format = sys.argv[2] if len(sys.argv) > 2 else 'json'
                output = generator.export_roadmap(format)
                print(output)
            elif sys.argv[1] == '--markdown':
                output = generator.export_roadmap('markdown')
                # Save to file
                output_path = Path('docs/MASTER_ROADMAP.md')
                output_path.parent.mkdir(exist_ok=True)
                with open(output_path, 'w') as f:
                    f.write(output)
                print(f"Roadmap exported to {output_path}")
            else:
                print("Usage:")
                print("  python roadmap-generator.py              # Generate roadmap")
                print("  python roadmap-generator.py --export     # Export as JSON")
                print("  python roadmap-generator.py --export yaml # Export as YAML")
                print("  python roadmap-generator.py --markdown   # Export as Markdown")
        else:
            # Generate and display roadmap
            roadmap = generator.generate_master_roadmap()
            print(f"Generated roadmap with {roadmap['total_items']} items")
            print(f"Categories: {list(roadmap['categories'].keys())}")
            print(f"Priorities: {list(roadmap['priorities'].keys())}")
            print(f"Timelines: {list(roadmap['timelines'].keys())}")
            
    except Exception as e:
        logger.error(f"Fatal error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
