#!/usr/bin/env python3
import sqlite3
import json
import hashlib
import uuid
from datetime import datetime

# Database path
DB_PATH = '/var/snap/docker/common/var-lib-docker/volumes/n8n-cursor_n8n_data/_data/database.sqlite'

# User data
USER_ID = 'db619a70-c346-4444-89df-3e5181528a34'
PROJECT_ID = 'SF4pJV9FxUwRkZkW'

def hash_password(password):
    # Simple hash for demo - in real scenario use bcrypt
    return f"$2a$10${hashlib.sha256(password.encode()).hexdigest()[:50]}"

def create_user_and_project(conn):
    # Create user
    conn.execute("""
        INSERT OR REPLACE INTO user (id, email, firstName, lastName, password, personalizedInfo, settings, role, createdAt, updatedAt) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        USER_ID,
        'snevemoney12@gmail.com',
        'evens', 
        'louis',
        hash_password('temppassword123'),
        '{}',
        '{"allowSSOManualLogin": true}',
        'global:owner',
        datetime.now().isoformat(),
        datetime.now().isoformat()
    ))
    
    # Create project
    conn.execute("""
        INSERT OR REPLACE INTO project (id, name, type, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?)
    """, (
        PROJECT_ID,
        'evens louis <snevemoney12@gmail.com>',
        'personal',
        datetime.now().isoformat(),
        datetime.now().isoformat()
    ))
    
    # Create project relation
    conn.execute("""
        INSERT OR REPLACE INTO project_relation (userId, projectId, role, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?)
    """, (
        USER_ID,
        PROJECT_ID, 
        'project:personalOwner',
        datetime.now().isoformat(),
        datetime.now().isoformat()
    ))

def import_workflow(conn, workflow_file):
    with open(workflow_file, 'r') as f:
        workflow_data = json.load(f)
    
    workflow_id = str(uuid.uuid4())
    
    # Insert workflow
    conn.execute("""
        INSERT INTO workflow_entity (id, name, active, nodes, connections, createdAt, updatedAt, settings, staticData, pinData, versionId)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        workflow_id,
        workflow_data.get('name', 'Untitled'),
        workflow_data.get('active', True),
        json.dumps(workflow_data.get('nodes', [])),
        json.dumps(workflow_data.get('connections', {})),
        datetime.now().isoformat(),
        datetime.now().isoformat(),
        json.dumps(workflow_data.get('settings', {})),
        json.dumps(workflow_data.get('staticData')),
        json.dumps(workflow_data.get('pinData')),
        str(uuid.uuid4())
    ))
    
    # Create shared workflow entry
    conn.execute("""
        INSERT INTO shared_workflow (workflowId, userId, projectId, role, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (
        workflow_id,
        USER_ID,
        PROJECT_ID,
        'workflow:owner',
        datetime.now().isoformat(),
        datetime.now().isoformat()
    ))
    
    print(f"✅ Imported: {workflow_data.get('name', 'Untitled')}")

def main():
    print("🔄 Direct Database Restoration")
    print("=============================")
    
    try:
        conn = sqlite3.connect(DB_PATH)
        
        # Create user and project
        print("👤 Creating user and project...")
        create_user_and_project(conn)
        
        # Import workflows
        print("📥 Importing workflows...")
        import glob
        for workflow_file in glob.glob('/home/evens/n8n-cursor/workflows/*.json'):
            try:
                import_workflow(conn, workflow_file)
            except Exception as e:
                print(f"❌ Failed to import {workflow_file}: {e}")
        
        conn.commit()
        conn.close()
        
        print("🎉 Database restoration completed!")
        print("🔄 Restart n8n to see your restored workflows")
        
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    main()
