/**
 * Python Expert Agent
 * Specializes in Python programming, best practices, library selection, and code optimization
 */

import { LLMAdapter } from '../llm/modelAdapter';
import { RAGStore } from '../rag/store';

export interface CodeReview {
  issues: {
    type: 'bug' | 'style' | 'performance' | 'security';
    severity: 'critical' | 'high' | 'medium' | 'low';
    line: number;
    description: string;
    suggestion: string;
  }[];
  improvements: string[];
  score: number; // 0-100
}

export interface LibraryRecommendation {
  name: string;
  purpose: string;
  advantages: string[];
  alternatives: string[];
  installation: string;
  example_code: string;
}

export class PythonExpertAgent {
  constructor(
    private llm: LLMAdapter,
    private ragStore: RAGStore
  ) {}

  /**
   * Generate Python code for a task
   */
  async generateCode(
    task: string,
    constraints?: string[]
  ): Promise<{ code: string; explanation: string; dependencies: string[] }> {
    console.log(`🐍 PythonExpertAgent generating code for: ${task}`);

    const knowledge = await this.ragStore.search(
      `python Python programming ${task} best practices`,
      10
    );

    const context = knowledge.map(k => `${k.title}\n${k.description}`).join('\n\n');

    const prompt = `Generate production-quality Python code:

Knowledge:
${context}

Task: ${task}
${constraints ? `Constraints: ${constraints.join(', ')}` : ''}

Provide:
1. Complete, working Python code with proper error handling
2. Explanation of the approach
3. Required dependencies (with versions)

Return JSON: { code, explanation, dependencies }`;

    const response = await this.llm.generate({
      system: 'You are a senior Python developer who writes clean, efficient, and well-documented code following PEP 8 standards.',
      user: prompt,
      jsonOutput: true
    });

    return JSON.parse(response);
  }

  /**
   * Review Python code and suggest improvements
   */
  async reviewCode(code: string): Promise<CodeReview> {
    const knowledge = await this.ragStore.search(
      'python Python best practices code review style security performance',
      10
    );

    const context = knowledge.map(k => `${k.title}\n${k.description}`).join('\n\n');

    const prompt = `Review this Python code and provide detailed feedback:

Knowledge:
${context}

Code:
\`\`\`python
${code}
\`\`\`

Identify:
1. Issues (bugs, style violations, performance problems, security concerns)
2. Suggested improvements
3. Overall quality score (0-100)

Return JSON matching CodeReview interface.`;

    const response = await this.llm.generate({
      system: 'You are a Python code reviewer with expertise in best practices, performance, and security.',
      user: prompt,
      jsonOutput: true
    });

    return JSON.parse(response);
  }

  /**
   * Recommend Python libraries for a use case
   */
  async recommendLibraries(useCase: string): Promise<LibraryRecommendation[]> {
    const knowledge = await this.ragStore.search(
      `Python libraries ${useCase} NumPy Pandas requests`,
      10
    );

    const context = knowledge.map(k => `${k.title}\n${k.description}`).join('\n\n');

    const prompt = `Recommend Python libraries for this use case:

Knowledge:
${context}

Use Case: ${useCase}

Provide 2-4 library recommendations with:
- Name and purpose
- Key advantages
- Alternatives
- Installation command
- Example usage code

Return JSON array of LibraryRecommendation objects.`;

    const response = await this.llm.generate({
      system: 'You are a Python ecosystem expert familiar with all major libraries and frameworks.',
      user: prompt,
      jsonOutput: true
    });

    return JSON.parse(response).recommendations;
  }

  /**
   * Optimize Python code for performance
   */
  async optimizeCode(code: string, goal: string): Promise<any> {
    const knowledge = await this.ragStore.search(
      'Python performance optimization caching vectorization async',
      10
    );

    const context = knowledge.map(k => `${k.title}\n${k.description}`).join('\n\n');

    const prompt = `Optimize this Python code:

Knowledge:
${context}

Current Code:
\`\`\`python
${code}
\`\`\`

Optimization Goal: ${goal}

Provide:
1. Optimized code
2. Explanation of changes
3. Expected performance improvement
4. Trade-offs (if any)

Return JSON.`;

    const response = await this.llm.generate({
      system: 'You are a Python performance optimization expert.',
      user: prompt,
      jsonOutput: true
    });

    return JSON.parse(response);
  }

  /**
   * Convert code to async/await pattern
   */
  async convertToAsync(code: string): Promise<any> {
    const knowledge = await this.ragStore.search(
      'Python async await asyncio coroutines',
      10
    );

    const context = knowledge.map(k => `${k.title}\n${k.description}`).join('\n\n');

    const prompt = `Convert this synchronous code to async/await:

Knowledge:
${context}

Synchronous Code:
\`\`\`python
${code}
\`\`\`

Provide:
1. Async version of the code
2. Required changes explanation
3. Dependencies needed
4. Usage example

Return JSON.`;

    const response = await this.llm.generate({
      system: 'You are an async Python programming expert.',
      user: prompt,
      jsonOutput: true
    });

    return JSON.parse(response);
  }

  /**
   * Design Python project structure
   */
  async designProjectStructure(projectType: string, requirements: string[]): Promise<any> {
    const knowledge = await this.ragStore.search(
      'Python project structure best practices packaging testing',
      10
    );

    const context = knowledge.map(k => `${k.title}\n${k.description}`).join('\n\n');

    const prompt = `Design a Python project structure:

Knowledge:
${context}

Project Type: ${projectType}
Requirements: ${requirements.join(', ')}

Provide:
1. Directory structure
2. Key files (setup.py, requirements.txt, etc.)
3. Package organization
4. Testing setup
5. CI/CD configuration
6. Documentation structure

Return JSON.`;

    const response = await this.llm.generate({
      system: 'You are a Python software architect.',
      user: prompt,
      jsonOutput: true
    });

    return JSON.parse(response);
  }

  /**
   * Generate test cases for code
   */
  async generateTests(code: string, framework: 'pytest' | 'unittest' = 'pytest'): Promise<any> {
    const knowledge = await this.ragStore.search(
      'Python testing pytest unittest fixtures mocking',
      10
    );

    const context = knowledge.map(k => `${k.title}\n${k.description}`).join('\n\n');

    const prompt = `Generate comprehensive test cases:

Knowledge:
${context}

Code to Test:
\`\`\`python
${code}
\`\`\`

Framework: ${framework}

Provide:
1. Test code covering main scenarios
2. Edge case tests
3. Mock examples (if needed)
4. Fixtures (if needed)
5. Instructions to run tests

Return JSON.`;

    const response = await this.llm.generate({
      system: 'You are a Python testing expert.',
      user: prompt,
      jsonOutput: true
    });

    return JSON.parse(response);
  }

  /**
   * Debug Python code
   */
  async debugCode(code: string, error: string): Promise<any> {
    const knowledge = await this.ragStore.search(
      'Python debugging error handling exceptions',
      10
    );

    const context = knowledge.map(k => `${k.title}\n${k.description}`).join('\n\n');

    const prompt = `Debug this Python code:

Knowledge:
${context}

Code:
\`\`\`python
${code}
\`\`\`

Error:
${error}

Provide:
1. Root cause analysis
2. Fixed code
3. Explanation of the fix
4. Prevention strategy for future

Return JSON.`;

    const response = await this.llm.generate({
      system: 'You are a Python debugging expert.',
      user: prompt,
      jsonOutput: true
    });

    return JSON.parse(response);
  }
}

