#!/usr/bin/env python3
"""
GitHub Timeline Integration Script
Creates masterful timelines with milestones, releases, and comprehensive project management
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
import requests
from dataclasses import dataclass, asdict
import re
from collections import defaultdict

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
class TimelineMilestone:
    """GitHub milestone with comprehensive metadata"""
    title: str
    description: str
    due_date: datetime
    state: str = "open"
    issues: List[int] = None
    notes: List[Dict[str, str]] = None
    dependencies: List[str] = None
    resources: List[str] = None
    risks: List[str] = None
    
    def __post_init__(self):
        if self.issues is None:
            self.issues = []
        if self.notes is None:
            self.notes = []
        if self.dependencies is None:
            self.dependencies = []
        if self.resources is None:
            self.resources = []
        if self.risks is None:
            self.risks = []

@dataclass
class TimelineRelease:
    """GitHub release with comprehensive planning"""
    tag_name: str
    name: str
    body: str
    target_commitish: str = "main"
    draft: bool = False
    prerelease: bool = False
    milestones: List[str] = None
    features: List[str] = None
    breaking_changes: List[str] = None
    notes: List[Dict[str, str]] = None
    
    def __post_init__(self):
        if self.milestones is None:
            self.milestones = []
        if self.features is None:
            self.features = []
        if self.breaking_changes is None:
            self.breaking_changes = []
        if self.notes is None:
            self.notes = []

class GitHubTimelineManager:
    """Manages comprehensive GitHub timelines with milestones and releases"""
    
    def __init__(self, config_path: str = "config/project-board.yml"):
        self.config_path = config_path
        self.config = self.load_config()
        self.github_token = os.getenv('GITHUB_TOKEN')
        self.github_api_base = "https://api.github.com"
        
        # GitHub token is optional for local operations
        if not self.github_token:
            print("⚠️  GITHUB_TOKEN not set - GitHub operations will be skipped")
            
        self.headers = {
            'Authorization': f'token {self.github_token}',
            'Accept': 'application/vnd.github.v3+json'
        }
        
        self.repo_owner = "snevemoney"
        self.repo_name = "n8n-cursor"
        
    def load_config(self) -> Dict[str, Any]:
        """Load the project board configuration"""
        try:
            with open(self.config_path, 'r') as f:
                return yaml.safe_load(f)
        except FileNotFoundError:
            logger.error(f"Configuration file not found: {self.config_path}")
            sys.exit(1)
    
    def create_master_timeline(self) -> Dict[str, Any]:
        """Create a comprehensive master timeline"""
        logger.info("Creating master timeline...")
        
        timeline = {
            'created_at': datetime.now().isoformat(),
            'milestones': [],
            'releases': [],
            'timeline_views': {},
            'dependencies': {},
            'critical_path': [],
            'resource_allocation': {},
            'risk_assessment': {}
        }
        
        # Create milestones based on roadmap categories
        milestones = self._create_roadmap_milestones()
        timeline['milestones'] = milestones
        
        # Create releases based on milestones
        releases = self._create_release_plan(milestones)
        timeline['releases'] = releases
        
        # Generate timeline views
        timeline['timeline_views'] = self._generate_timeline_views(milestones)
        
        # Analyze dependencies and critical path
        timeline['dependencies'] = self._analyze_dependencies(milestones)
        timeline['critical_path'] = self._identify_critical_path(milestones)
        
        # Resource allocation and risk assessment
        timeline['resource_allocation'] = self._allocate_resources(milestones)
        timeline['risk_assessment'] = self._assess_risks(milestones)
        
        return timeline
    
    def _create_roadmap_milestones(self) -> List[Dict[str, Any]]:
        """Create milestones based on roadmap configuration"""
        milestones = []
        
        # Get roadmap categories from config
        categories = self.config.get('master_roadmap', {}).get('categories', [])
        
        # Define timeline phases
        timeline_phases = {
            'immediate': {'duration_days': 7, 'priority': 'critical'},
            'short-term': {'duration_days': 30, 'priority': 'high'},
            'medium-term': {'duration_days': 90, 'priority': 'medium'},
            'long-term': {'duration_days': 180, 'priority': 'low'},
            'ongoing': {'duration_days': 365, 'priority': 'medium'}
        }
        
        current_date = datetime.now()
        
        for category in categories:
            timeline = category.get('timeline', 'medium-term')
            phase_config = timeline_phases.get(timeline, timeline_phases['medium-term'])
            
            # Calculate due date
            due_date = current_date + timedelta(days=phase_config['duration_days'])
            
            # Create milestone
            milestone = TimelineMilestone(
                title=f"🎯 {category['name']}",
                description=f"Complete {category['name'].lower()} implementation\n\n"
                           f"**Notes**: {category.get('notes', 'No notes provided')}\n"
                           f"**Gaps**: {category.get('gaps', 'No gaps identified')}\n"
                           f"**Next Steps**: {category.get('next_steps', 'No next steps defined')}",
                due_date=due_date,
                notes=[
                    {
                        'type': 'technical_notes',
                        'content': category.get('notes', 'No technical notes provided')
                    },
                    {
                        'type': 'gaps',
                        'content': category.get('gaps', 'No gaps identified')
                    },
                    {
                        'type': 'next_steps',
                        'content': category.get('next_steps', 'No next steps defined')
                    }
                ],
                dependencies=[],
                resources=['snevemoney'],
                risks=['Timeline delays', 'Resource constraints', 'Technical complexity']
            )
            
            milestones.append(milestone)
            
            # Create the milestone in GitHub
            github_milestone = self._create_github_milestone(milestone)
            if github_milestone:
                logger.info(f"Created GitHub milestone: {milestone.title}")
        
        return [asdict(milestone) for milestone in milestones]
    
    def _create_github_milestone(self, milestone: TimelineMilestone) -> Optional[Dict[str, Any]]:
        """Create a milestone in GitHub"""
        if not self.github_token:
            logger.info(f"GitHub token not available - milestone '{milestone.title}' created locally only")
            return None
            
        try:
            milestone_data = {
                'title': milestone.title,
                'description': milestone.description,
                'due_on': milestone.due_date.isoformat(),
                'state': milestone.state
            }
            
            response = requests.post(
                f"{self.github_api_base}/repos/{self.repo_owner}/{self.repo_name}/milestones",
                headers=self.headers,
                json=milestone_data
            )
            
            if response.status_code == 201:
                return response.json()
            else:
                logger.error(f"Failed to create milestone: {response.status_code}")
                return None
                
        except Exception as e:
            logger.error(f"Error creating GitHub milestone: {e}")
            return None
    
    def _create_release_plan(self, milestones: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Create a comprehensive release plan"""
        releases = []
        
        # Define release phases
        release_phases = [
            {
                'phase': 'alpha',
                'tag': 'v0.1.0-alpha',
                'name': 'Alpha Release - Core Infrastructure',
                'description': 'Initial release with core infrastructure and basic functionality',
                'milestones': ['Infrastructure & DevOps'],
                'features': ['Basic deployment pipeline', 'Health monitoring', 'Project board setup'],
                'breaking_changes': [],
                'notes': [
                    {'type': 'technical_notes', 'content': 'First alpha release with core features'},
                    {'type': 'next_steps', 'content': 'Gather feedback, fix critical issues, prepare for beta'}
                ]
            },
            {
                'phase': 'beta',
                'tag': 'v0.2.0-beta',
                'name': 'Beta Release - Enhanced Features',
                'description': 'Enhanced release with MCP integration and advanced features',
                'milestones': ['n8n Workflows', 'AI & MCP Integration'],
                'features': ['MCP integration', 'Dynamic project board', 'Advanced monitoring'],
                'breaking_changes': ['API changes for MCP integration'],
                'notes': [
                    {'type': 'technical_notes', 'content': 'Beta release with MCP integration'},
                    {'type': 'next_steps', 'content': 'User testing, performance optimization, prepare for RC'}
                ]
            },
            {
                'phase': 'rc',
                'tag': 'v0.3.0-rc',
                'name': 'Release Candidate - Production Ready',
                'description': 'Release candidate with security hardening and production features',
                'milestones': ['Security & Monitoring'],
                'features': ['Security hardening', 'Advanced monitoring', 'Compliance features'],
                'breaking_changes': ['Security policy changes'],
                'notes': [
                    {'type': 'technical_notes', 'content': 'Release candidate with security features'},
                    {'type': 'next_steps', 'content': 'Security audit, performance testing, prepare for GA'}
                ]
            },
            {
                'phase': 'ga',
                'tag': 'v1.0.0',
                'name': 'General Availability - Production Ready',
                'description': 'Production-ready release with comprehensive features and documentation',
                'milestones': ['Documentation & Training'],
                'features': ['Complete documentation', 'Training materials', 'Production support'],
                'breaking_changes': [],
                'notes': [
                    {'type': 'technical_notes', 'content': 'General availability release'},
                    {'type': 'next_steps', 'content': 'Production deployment, user onboarding, support setup'}
                ]
            }
        ]
        
        current_date = datetime.now()
        
        for i, phase in enumerate(release_phases):
            # Calculate release date (spread releases over time)
            release_date = current_date + timedelta(days=30 * (i + 1))
            
            release = TimelineRelease(
                tag_name=phase['tag'],
                name=phase['name'],
                body=self._format_release_body(phase),
                target_commitish="main",
                draft=False,
                prerelease=(phase['phase'] != 'ga'),
                milestones=phase['milestones'],
                features=phase['features'],
                breaking_changes=phase['breaking_changes'],
                notes=phase['notes']
            )
            
            releases.append(asdict(release))
            
            # Create the release in GitHub
            github_release = self._create_github_release(release)
            if github_release:
                logger.info(f"Created GitHub release: {release.name}")
        
        return releases
    
    def _format_release_body(self, phase: Dict[str, Any]) -> str:
        """Format release body with comprehensive information"""
        body = f"# {phase['name']}\n\n"
        body += f"{phase['description']}\n\n"
        
        if phase['features']:
            body += "## ✨ Features\n\n"
            for feature in phase['features']:
                body += f"- {feature}\n"
            body += "\n"
        
        if phase['milestones']:
            body += "## 🎯 Milestones\n\n"
            for milestone in phase['milestones']:
                body += f"- {milestone}\n"
            body += "\n"
        
        if phase['breaking_changes']:
            body += "## ⚠️ Breaking Changes\n\n"
            for change in phase['breaking_changes']:
                body += f"- {change}\n"
            body += "\n"
        
        body += "## 📝 Notes\n\n"
        for note in phase['notes']:
            body += f"**{note['type'].replace('_', ' ').title()}**: {note['content']}\n\n"
        
        body += "---\n"
        body += f"*Release created automatically by GitHub Timeline Manager*"
        
        return body
    
    def _create_github_release(self, release: TimelineRelease) -> Optional[Dict[str, Any]]:
        """Create a release in GitHub"""
        if not self.github_token:
            logger.info(f"GitHub token not available - release '{release.name}' created locally only")
            return None
            
        try:
            release_data = {
                'tag_name': release.tag_name,
                'name': release.name,
                'body': release.body,
                'target_commitish': release.target_commitish,
                'draft': release.draft,
                'prerelease': release.prerelease
            }
            
            response = requests.post(
                f"{self.github_api_base}/repos/{self.repo_owner}/{self.repo_name}/releases",
                headers=self.headers,
                json=release_data
            )
            
            if response.status_code == 201:
                return response.json()
            else:
                logger.error(f"Failed to create release: {response.status_code}")
                return None
                
        except Exception as e:
            logger.error(f"Error creating GitHub release: {e}")
            return None
    
    def _generate_timeline_views(self, milestones: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Generate different timeline views"""
        views = {}
        
        # Overview view (months)
        overview = self._create_timeline_view(milestones, 'months')
        views['overview'] = overview
        
        # Detailed view (weeks)
        detailed = self._create_timeline_view(milestones, 'weeks')
        views['detailed'] = detailed
        
        # Sprint view (days)
        sprint = self._create_timeline_view(milestones, 'days')
        views['sprint'] = sprint
        
        # Roadmap view (quarters)
        roadmap = self._create_timeline_view(milestones, 'quarters')
        views['roadmap'] = roadmap
        
        return views
    
    def _create_timeline_view(self, milestones: List[Dict[str, Any]], granularity: str) -> Dict[str, Any]:
        """Create a timeline view with specified granularity"""
        view = {
            'granularity': granularity,
            'timeline': [],
            'milestones': [],
            'dependencies': [],
            'critical_path': []
        }
        
        # Group milestones by time period
        grouped_milestones = defaultdict(list)
        
        for milestone in milestones:
            if isinstance(milestone['due_date'], str):
                due_date = datetime.fromisoformat(milestone['due_date'])
            else:
                due_date = milestone['due_date']
            
            if granularity == 'days':
                period = due_date.strftime('%Y-%m-%d')
            elif granularity == 'weeks':
                period = due_date.strftime('%Y-W%U')
            elif granularity == 'months':
                period = due_date.strftime('%Y-%m')
            elif granularity == 'quarters':
                quarter = (due_date.month - 1) // 3 + 1
                period = f"{due_date.year}-Q{quarter}"
            else:
                period = due_date.strftime('%Y-%m')
            
            grouped_milestones[period].append(milestone)
        
        # Create timeline structure
        for period in sorted(grouped_milestones.keys()):
            period_data = {
                'period': period,
                'milestones': grouped_milestones[period],
                'total_milestones': len(grouped_milestones[period]),
                'critical_milestones': len([m for m in grouped_milestones[period] 
                                         if 'critical' in m.get('notes', [{}])[0].get('content', '').lower()])
            }
            view['timeline'].append(period_data)
        
        view['milestones'] = milestones
        return view
    
    def _analyze_dependencies(self, milestones: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze dependencies between milestones"""
        dependencies = {
            'direct_dependencies': {},
            'dependency_chains': [],
            'circular_dependencies': [],
            'dependency_graph': {}
        }
        
        # Build dependency graph
        for milestone in milestones:
            milestone_id = milestone['title']
            dependencies['dependency_graph'][milestone_id] = []
            
            # Check for dependencies in notes
            for note in milestone.get('notes', []):
                if 'dependencies' in note['type']:
                    deps = note['content'].split(',')
                    for dep in deps:
                        dep = dep.strip()
                        if dep:
                            dependencies['dependency_graph'][milestone_id].append(dep)
                            dependencies['direct_dependencies'][dep] = milestone_id
        
        # Detect circular dependencies
        dependencies['circular_dependencies'] = self._detect_circular_dependencies(
            dependencies['dependency_graph']
        )
        
        return dependencies
    
    def _detect_circular_dependencies(self, graph: Dict[str, List[str]]) -> List[List[str]]:
        """Detect circular dependencies in the milestone graph"""
        def dfs(node: str, visited: set, rec_stack: set, path: List[str]) -> List[List[str]]:
            visited.add(node)
            rec_stack.add(node)
            path.append(node)
            
            cycles = []
            
            for neighbor in graph.get(node, []):
                if neighbor not in visited:
                    cycles.extend(dfs(neighbor, visited, rec_stack, path))
                elif neighbor in rec_stack:
                    # Found a cycle
                    cycle_start = path.index(neighbor)
                    cycles.append(path[cycle_start:])
            
            rec_stack.remove(node)
            path.pop()
            return cycles
        
        visited = set()
        all_cycles = []
        
        for node in graph:
            if node not in visited:
                cycles = dfs(node, visited, set(), [])
                all_cycles.extend(cycles)
        
        return all_cycles
    
    def _identify_critical_path(self, milestones: List[Dict[str, Any]]) -> List[str]:
        """Identify the critical path through milestones"""
        critical_path = []
        
        # Find milestones with highest priority and dependencies
        critical_milestones = [m for m in milestones 
                             if any('critical' in note['content'].lower() 
                                   for note in m.get('notes', []))]
        
        # Sort by due date and dependencies
        critical_milestones.sort(key=lambda x: datetime.fromisoformat(x['due_date']))
        
        for milestone in critical_milestones:
            critical_path.append(milestone['title'])
        
        return critical_path
    
    def _allocate_resources(self, milestones: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Allocate resources across milestones"""
        resource_allocation = {
            'total_resources': 1,  # snevemoney
            'resource_utilization': {},
            'resource_conflicts': [],
            'recommendations': []
        }
        
        # Calculate resource utilization by time period
        utilization_by_period = defaultdict(int)
        
        for milestone in milestones:
            if isinstance(milestone['due_date'], str):
                due_date = datetime.fromisoformat(milestone['due_date'])
            else:
                due_date = milestone['due_date']
            period = due_date.strftime('%Y-%m')
            
            # Estimate effort based on timeline
            timeline = next((cat['timeline'] for cat in self.config.get('master_roadmap', {}).get('categories', [])
                           if cat['name'] in milestone['title']), 'medium-term')
            
            if timeline == 'immediate':
                effort = 1.0  # Full time
            elif timeline == 'short-term':
                effort = 0.7  # 70% time
            elif timeline == 'medium-term':
                effort = 0.5  # 50% time
            else:
                effort = 0.3  # 30% time
            
            utilization_by_period[period] += effort
        
        resource_allocation['resource_utilization'] = dict(utilization_by_period)
        
        # Identify resource conflicts
        for period, utilization in utilization_by_period.items():
            if utilization > 1.0:
                resource_allocation['resource_conflicts'].append({
                    'period': period,
                    'utilization': utilization,
                    'overallocation': utilization - 1.0
                })
        
        # Generate recommendations
        if resource_allocation['resource_conflicts']:
            resource_allocation['recommendations'].append(
                "Consider extending timelines or adding resources for over-allocated periods"
            )
        
        return resource_allocation
    
    def _assess_risks(self, milestones: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Assess risks across all milestones"""
        risk_assessment = {
            'high_risk_milestones': [],
            'risk_factors': {},
            'mitigation_strategies': [],
            'overall_risk_level': 'medium'
        }
        
        # Assess risks for each milestone
        for milestone in milestones:
            risk_score = 0
            risk_factors = []
            
            # Check timeline pressure
            if isinstance(milestone['due_date'], str):
                due_date = datetime.fromisoformat(milestone['due_date'])
            else:
                due_date = milestone['due_date']
            days_until_due = (due_date - datetime.now()).days
            
            if days_until_due < 7:
                risk_score += 3
                risk_factors.append('Urgent timeline')
            elif days_until_due < 30:
                risk_score += 2
                risk_factors.append('Short timeline')
            elif days_until_due < 90:
                risk_score += 1
                risk_factors.append('Moderate timeline')
            
            # Check complexity
            if 'complex' in milestone['description'].lower():
                risk_score += 2
                risk_factors.append('High complexity')
            
            # Check dependencies
            if milestone.get('dependencies'):
                risk_score += 1
                risk_factors.append('External dependencies')
            
            # Categorize risk level
            if risk_score >= 4:
                risk_level = 'high'
                risk_assessment['high_risk_milestones'].append({
                    'milestone': milestone['title'],
                    'risk_score': risk_score,
                    'risk_factors': risk_factors
                })
            elif risk_score >= 2:
                risk_level = 'medium'
            else:
                risk_level = 'low'
            
            milestone['risk_level'] = risk_level
            milestone['risk_score'] = risk_score
            milestone['risk_factors'] = risk_factors
        
        # Overall risk assessment
        high_risk_count = len(risk_assessment['high_risk_milestones'])
        if high_risk_count > 2:
            risk_assessment['overall_risk_level'] = 'high'
        elif high_risk_count > 0:
            risk_assessment['overall_risk_level'] = 'medium'
        else:
            risk_assessment['overall_risk_level'] = 'low'
        
        # Generate mitigation strategies
        if risk_assessment['overall_risk_level'] == 'high':
            risk_assessment['mitigation_strategies'].extend([
                'Prioritize high-risk milestones',
                'Add buffer time to timelines',
                'Implement early warning systems',
                'Consider resource augmentation'
            ])
        
        return risk_assessment
    
    def export_timeline(self, format: str = 'json') -> str:
        """Export timeline in specified format"""
        timeline = self.create_master_timeline()
        
        if format == 'json':
            # Convert datetime objects to strings for JSON serialization
            timeline_json = self._prepare_for_json(timeline)
            return json.dumps(timeline_json, indent=2)
        elif format == 'yaml':
            return yaml.dump(timeline, default_flow_style=False, indent=2)
        elif format == 'markdown':
            return self._timeline_to_markdown(timeline)
        else:
            raise ValueError(f"Unsupported format: {format}")
    
    def _prepare_for_json(self, obj):
        """Prepare object for JSON serialization by converting datetime objects"""
        if isinstance(obj, dict):
            return {key: self._prepare_for_json(value) for key, value in obj.items()}
        elif isinstance(obj, list):
            return [self._prepare_for_json(item) for item in obj]
        elif isinstance(obj, datetime):
            return obj.isoformat()
        else:
            return obj
    
    def _timeline_to_markdown(self, timeline: Dict[str, Any]) -> str:
        """Convert timeline to Markdown format"""
        md = f"# 🗓️ Master Timeline - n8n-cursor\n\n"
        md += f"**Generated**: {timeline['created_at']}\n\n"
        
        # Overview
        md += "## 📊 Timeline Overview\n\n"
        md += f"**Total Milestones**: {len(timeline['milestones'])}\n"
        md += f"**Total Releases**: {len(timeline['releases'])}\n"
        md += f"**Overall Risk Level**: {timeline['risk_assessment']['overall_risk_level'].title()}\n\n"
        
        # Critical Path
        if timeline['critical_path']:
            md += "## 🚨 Critical Path\n\n"
            for milestone in timeline['critical_path']:
                md += f"- {milestone}\n"
            md += "\n"
        
        # Timeline Views
        md += "## 📅 Timeline Views\n\n"
        for view_name, view_data in timeline['timeline_views'].items():
            md += f"### {view_name.title()} View\n\n"
            for period in view_data['timeline']:
                md += f"**{period['period']}**: {period['total_milestones']} milestones"
                if period['critical_milestones'] > 0:
                    md += f" ({period['critical_milestones']} critical)"
                md += "\n"
            md += "\n"
        
        # Milestones
        md += "## 🎯 Milestones\n\n"
        for milestone in timeline['milestones']:
            md += f"### {milestone['title']}\n"
            md += f"**Due Date**: {milestone['due_date']}\n"
            md += f"**Risk Level**: {milestone.get('risk_level', 'unknown').title()}\n"
            if milestone.get('risk_factors'):
                md += f"**Risk Factors**: {', '.join(milestone['risk_factors'])}\n"
            md += f"\n{milestone['description']}\n\n"
        
        # Releases
        md += "## 🚀 Releases\n\n"
        for release in timeline['releases']:
            md += f"### {release['name']}\n"
            md += f"**Tag**: {release['tag_name']}\n"
            md += f"**Type**: {'Pre-release' if release['prerelease'] else 'Release'}\n"
            if release['features']:
                md += f"**Features**: {', '.join(release['features'])}\n"
            md += f"\n{release['body']}\n\n"
        
        # Risk Assessment
        md += "## ⚠️ Risk Assessment\n\n"
        risk_assessment = timeline['risk_assessment']
        md += f"**Overall Risk Level**: {risk_assessment['overall_risk_level'].title()}\n\n"
        
        if risk_assessment['high_risk_milestones']:
            md += "### High Risk Milestones\n\n"
            for risk_milestone in risk_assessment['high_risk_milestones']:
                md += f"- **{risk_milestone['milestone']}** (Risk Score: {risk_milestone['risk_score']})\n"
                md += f"  - Risk Factors: {', '.join(risk_milestone['risk_factors'])}\n"
            md += "\n"
        
        if risk_assessment['mitigation_strategies']:
            md += "### Mitigation Strategies\n\n"
            for strategy in risk_assessment['mitigation_strategies']:
                md += f"- {strategy}\n"
            md += "\n"
        
        # Resource Allocation
        md += "## 👥 Resource Allocation\n\n"
        resource_allocation = timeline['resource_allocation']
        md += f"**Total Resources**: {resource_allocation['total_resources']}\n\n"
        
        md += "### Resource Utilization by Period\n\n"
        for period, utilization in resource_allocation['resource_utilization'].items():
            md += f"**{period}**: {utilization:.1f} resources\n"
        md += "\n"
        
        if resource_allocation['resource_conflicts']:
            md += "### Resource Conflicts\n\n"
            for conflict in resource_allocation['resource_conflicts']:
                md += f"- **{conflict['period']}**: {conflict['utilization']:.1f} resources "
                md += f"(Overallocation: {conflict['overallocation']:.1f})\n"
            md += "\n"
        
        if resource_allocation['recommendations']:
            md += "### Recommendations\n\n"
            for recommendation in resource_allocation['recommendations']:
                md += f"- {recommendation}\n"
            md += "\n"
        
        return md

def main():
    """Main entry point"""
    try:
        # Initialize the timeline manager
        timeline_manager = GitHubTimelineManager()
        
        # Check command line arguments
        if len(sys.argv) > 1:
            if sys.argv[1] == '--export':
                format = sys.argv[2] if len(sys.argv) > 2 else 'json'
                output = timeline_manager.export_timeline(format)
                print(output)
            elif sys.argv[1] == '--markdown':
                output = timeline_manager.export_timeline('markdown')
                # Save to file
                output_path = Path('docs/MASTER_TIMELINE.md')
                output_path.parent.mkdir(exist_ok=True)
                with open(output_path, 'w') as f:
                    f.write(output)
                print(f"Timeline exported to {output_path}")
            elif sys.argv[1] == '--create':
                # Create timeline in GitHub
                timeline = timeline_manager.create_master_timeline()
                print(f"Created timeline with {len(timeline['milestones'])} milestones and {len(timeline['releases'])} releases")
            else:
                print("Usage:")
                print("  python github-timeline.py              # Create timeline")
                print("  python github-timeline.py --create     # Create timeline in GitHub")
                print("  python github-timeline.py --export     # Export as JSON")
                print("  python github-timeline.py --export yaml # Export as YAML")
                print("  python github-timeline.py --markdown   # Export as Markdown")
        else:
            # Create and display timeline
            timeline = timeline_manager.create_master_timeline()
            print(f"Created timeline with {len(timeline['milestones'])} milestones")
            print(f"Releases: {len(timeline['releases'])}")
            print(f"Risk Level: {timeline['risk_assessment']['overall_risk_level']}")
            
    except Exception as e:
        logger.error(f"Fatal error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
