module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',     // New feature
        'fix',      // Bug fix
        'docs',     // Documentation
        'style',    // Formatting, missing semicolons, etc.
        'refactor', // Code change that neither fixes a bug nor adds a feature
        'perf',     // Performance improvements
        'test',     // Adding tests
        'chore',    // Maintenance tasks
        'build',    // Build system or external dependencies
        'ci',       // CI configuration
        'revert'    // Revert previous commit
      ]
    ],
    'scope-enum': [
      2,
      'always',
      [
        'lightningflow',  // LightningFlow AI app
        'n8n-cursor',     // n8n-cursor app
        'packages',       // Shared packages
        'tooling',        // Workspace tooling
        'docs',           // Documentation
        'ci',             // CI/CD
        'infra',          // Infrastructure
        'repo'            // Repository setup
      ]
    ],
    'subject-case': [2, 'always', 'lower-case'],
    'subject-max-length': [2, 'always', 72]
  }
};
