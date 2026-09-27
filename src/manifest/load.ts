/**
 * Runs inside the app (`node --import tsx load.js <file>...`, cwd = app root)
 * so contract files resolve the app's own zod and bloom. Prints the
 * contracts it finds as JSON on stdout.
 *
 * Contracts are recognised by the global symbol defineRoute() sets, so this
 * works whichever copy of @bloomneo/bloom the app has.
 */
import { pathToFileURL } from 'node:url';
import { relative } from 'node:path';

const CONTRACT = Symbol.for('bloomneo.contract');

/**
 * A schema as a short TypeScript-like type: `{ name: string; age?: number }`.
 * Reads zod 3 (`_def.typeName`) and zod 4 (`_zod.def.type`); any other
 * Standard Schema library is named by its vendor.
 */
export function describe(schema: any, depth = 0): string {
  if (!schema || typeof schema !== 'object') return 'unknown';
  if (depth > 8) return '…';
  const next = (s: any) => describe(s, depth + 1);
  const v4 = schema._zod?.def;
  const v3 = schema._def;
  const kind: string | undefined = v4?.type ?? v3?.typeName?.replace(/^Zod/, '').toLowerCase();
  const def = v4 ?? v3;
  switch (kind) {
    case 'string':
    case 'number':
    case 'boolean':
    case 'date':
    case 'bigint':
    case 'null':
    case 'undefined':
    case 'any':
    case 'unknown':
    case 'never':
    case 'void':
      return kind;
    case 'nan':
      return 'number';
    case 'literal': {
      const values: unknown[] = def.values ?? [def.value];
      return values.map((x) => JSON.stringify(x)).join(' | ');
    }
    case 'enum': {
      const values: unknown[] = Array.isArray(def.values) ? def.values : Object.values(def.entries ?? def.values ?? {});
      return values.map((x) => JSON.stringify(x)).join(' | ');
    }
    case 'nativeenum':
      // Numeric TS enums carry reverse mappings ("0": "A"); skip those keys.
      return Object.entries(def.values ?? {})
        .filter(([k]) => Number.isNaN(Number(k)))
        .map(([, x]) => JSON.stringify(x))
        .join(' | ');
    case 'array':
      return `${wrap(next(def.element ?? def.type))}[]`;
    case 'set':
      return `Set<${next(def.valueType)}>`;
    case 'tuple':
      return `[${(def.items ?? []).map(next).join(', ')}]`;
    case 'record':
      return `Record<${next(def.keyType)}, ${next(def.valueType)}>`;
    case 'map':
      return `Map<${next(def.keyType)}, ${next(def.valueType)}>`;
    case 'object': {
      const shape = typeof def.shape === 'function' ? def.shape() : def.shape ?? {};
      const fields = Object.keys(shape).map((k) => {
        const f = shape[k];
        const optional = isOptional(f);
        return `${k}${optional ? '?' : ''}: ${next(optional ? unwrapOptional(f) : f)}`;
      });
      return fields.length ? `{ ${fields.join('; ')} }` : '{}';
    }
    case 'union':
    case 'discriminatedunion': {
      const options = def.options instanceof Map ? [...def.options.values()] : def.options ?? [];
      return options.map(next).join(' | ');
    }
    case 'intersection':
      return `${next(def.left)} & ${next(def.right)}`;
    case 'optional':
      return `${next(def.innerType)} | undefined`;
    case 'nullable':
      return `${next(def.innerType)} | null`;
    case 'default':
    case 'prefault':
    case 'catch':
    case 'readonly':
    case 'nonoptional':
    case 'branded':
    case 'brand':
      return next(def.innerType ?? def.type);
    case 'effects':
      return next(def.schema);
    case 'pipe':
    case 'pipeline':
      return next(def.in);
    case 'lazy':
      return 'lazy';
    case 'promise':
      return `Promise<${next(def.innerType ?? def.type)}>`;
  }
  const vendor = schema['~standard']?.vendor;
  return vendor ? `(${vendor} schema)` : 'unknown';
}

function wrap(t: string): string {
  return /[|&]/.test(t) ? `(${t})` : t;
}

function isOptional(s: any): boolean {
  const kind = s?._zod?.def?.type ?? s?._def?.typeName;
  if (kind === 'optional' || kind === 'ZodOptional') return true;
  // A default makes the input optional.
  return kind === 'default' || kind === 'ZodDefault';
}

function unwrapOptional(s: any): any {
  return s?._zod?.def?.innerType ?? s?._def?.innerType ?? s;
}

export interface ManifestContract {
  name: string;
  file: string;
  method: string;
  path: string;
  auth: unknown;
  tenant: boolean;
  summary?: string;
  params?: string;
  query?: string;
  body?: string;
  response?: string;
}

async function main(): Promise<void> {
  const root = process.cwd();
  const out: ManifestContract[] = [];
  const failed: Array<{ file: string; error: string }> = [];
  for (const file of process.argv.slice(2)) {
    let mod: Record<string, unknown>;
    try {
      mod = await import(pathToFileURL(file).href);
    } catch (err) {
      failed.push({ file: relative(root, file), error: String((err as Error)?.message ?? err).split('\n')[0] });
      continue;
    }
    for (const [name, value] of Object.entries(mod)) {
      const c = value as any;
      if (!c || typeof c !== 'object' || c[CONTRACT] !== true) continue;
      const entry: ManifestContract = {
        name,
        file: relative(root, file),
        method: c.method,
        path: c.path,
        auth: c.auth,
        tenant: c.tenant ?? c.auth !== 'public',
      };
      if (c.summary) entry.summary = c.summary;
      for (const part of ['params', 'query', 'body', 'response'] as const) {
        if (c[part]) entry[part] = describe(c[part]);
      }
      out.push(entry);
    }
  }
  process.stdout.write(JSON.stringify({ contracts: out, failed }));
}

// Run only as the entry script, not when imported (tests import describe()).
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((err) => {
    process.stderr.write(String(err?.stack ?? err));
    process.exit(1);
  });
}
