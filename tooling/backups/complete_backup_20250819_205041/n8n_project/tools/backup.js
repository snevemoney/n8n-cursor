import fs from 'fs';
import path from 'path';

export function createBackup() {
  const timestamp = new Date().toISOString()
    .replace(/[:.]/g, '-')
    .slice(0, 16); // YYYY-MM-DDTHH-MM
  
  const backupDir = `/home/evens/n8n-cursor/backups/${timestamp}`;
  
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  
  const workflowsDir = '/home/evens/n8n-cursor/workflows';
  
  if (fs.existsSync(workflowsDir)) {
    const files = fs.readdirSync(workflowsDir)
      .filter(file => file.endsWith('.json'));
    
    files.forEach(file => {
      const source = path.join(workflowsDir, file);
      const dest = path.join(backupDir, file);
      fs.copyFileSync(source, dest);
    });
    
    console.log(`✅ Backup created: ${backupDir} (${files.length} workflows)`);
  }
  
  // Keep only last 10 backups
  cleanupOldBackups();
  
  return backupDir;
}

function cleanupOldBackups() {
  const backupsDir = '/home/evens/n8n-cursor/backups';
  
  if (!fs.existsSync(backupsDir)) return;
  
  const backups = fs.readdirSync(backupsDir)
    .filter(dir => /^\d{4}-\d{2}-\d{2}T\d{2}-\d{2}$/.test(dir))
    .sort()
    .reverse();
  
  // Keep newest 10, delete rest
  backups.slice(10).forEach(oldBackup => {
    const oldPath = path.join(backupsDir, oldBackup);
    fs.rmSync(oldPath, { recursive: true, force: true });
    console.log(`🗑️ Cleaned up old backup: ${oldBackup}`);
  });
}
