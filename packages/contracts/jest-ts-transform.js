const crypto = require('crypto');
const ts = require('typescript');

/** Compile contract tests with the TypeScript already declared in this package. */
module.exports = {
  process(sourceText, sourcePath) {
    const { outputText } = ts.transpileModule(sourceText, {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2020,
        esModuleInterop: true,
        strict: false,
      },
      fileName: sourcePath,
    });
    return { code: outputText };
  },
  getCacheKey(sourceText, sourcePath) {
    return crypto.createHash('sha1').update(sourceText).update(sourcePath).digest('hex');
  },
};
