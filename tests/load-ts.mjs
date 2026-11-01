import { readFileSync, existsSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { runInThisContext } from "node:vm";
import ts from "typescript";

const root = fileURLToPath(new URL("../", import.meta.url));

// Exercise the actual TypeScript route/page modules with a synthetic Prisma
// boundary, without requiring a running database or changing production data.
export function createLoader(stubs = {}) {
  const cache = new Map();
  function load(filename) {
    const resolved = path.resolve(root, filename);
    if (cache.has(resolved)) return cache.get(resolved).exports;
    const loaded = { exports: {} };
    cache.set(resolved, loaded);
    const nativeRequire = createRequire(resolved);
    const require = (specifier) => {
      if (Object.hasOwn(stubs, specifier)) return stubs[specifier];
      if (specifier.startsWith("@/") || specifier.startsWith(".")) {
        const target = specifier.startsWith("@/")
          ? path.join(root, specifier.slice(2))
          : path.resolve(path.dirname(resolved), specifier);
        for (const candidate of [target, `${target}.ts`, `${target}.tsx`]) {
          if (existsSync(candidate) && /\.tsx?$/.test(candidate)) return load(candidate);
        }
      }
      return nativeRequire(specifier);
    };
    const { outputText } = ts.transpileModule(readFileSync(resolved, "utf8"), {
      fileName: resolved,
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
        jsx: ts.JsxEmit.ReactJSX,
        esModuleInterop: true,
      },
    });
    const execute = runInThisContext(`(function(require,module,exports){${outputText}\n})`, { filename: resolved });
    execute(require, loaded, loaded.exports);
    return loaded.exports;
  }
  return load;
}
