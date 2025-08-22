import { execSync } from 'child_process';

export function syncToGitHub(commitMessage = null) {
  try {
    console.log('🔄 Syncing to GitHub...');
    
    // Stage all changes
    execSync('git add .', { stdio: 'inherit' });
    
    // Check if there are changes to commit
    try {
      execSync('git diff --cached --exit-code', { stdio: 'pipe' });
      console.log('📭 No changes to commit');
      return;
    } catch {
      // There are changes to commit
    }
    
    // Commit with auto-generated or custom message
    const message = commitMessage || `Auto-update: workflow diagrams ${new Date().toISOString()}`;
    execSync(`git commit -m "${message}"`, { stdio: 'inherit' });
    
    // Push to origin
    execSync('git push origin main', { stdio: 'inherit' });
    
    console.log('✅ Successfully synced to GitHub!');
  } catch (error) {
    console.error('❌ GitHub sync failed:', error.message);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const message = process.argv[2];
  syncToGitHub(message);
}
