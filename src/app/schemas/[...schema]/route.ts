import type { NextRequest } from 'next/server';

export const runtime = 'nodejs';

const REVALIDATE_SECONDS = 60 * 60;

const cacheHeaders = {
  'Cache-Control': `public, s-maxage=${REVALIDATE_SECONDS}, stale-while-revalidate=${60 * 60 * 24}`,
};

function getSchemaRelPath(schemaParam: string[] | string | undefined) {
  const parts = Array.isArray(schemaParam) ? schemaParam : schemaParam ? [schemaParam] : [];

  if (parts.length === 0) return null;
  if (parts.some((p) => !p || p === '.' || p === '..' || p.includes('\0'))) return null;

  const relPath = parts.join('/');
  if (!relPath.endsWith('.json')) return null;

  return relPath;
}

async function readLocalSchema(relPath: string) {
  const path = await import('node:path');
  const { readFile } = await import('node:fs/promises');

  const baseDir = path.join(process.cwd(), 'public', 'schemas');
  const absPath = path.resolve(baseDir, relPath);

  // anti-path-traversal guard
  const relative = path.relative(baseDir, absPath);
  if (relative.startsWith('..') || path.isAbsolute(relative)) return null;

  try {
    const data = await readFile(absPath, 'utf8');

    return new Response(data, {
      status: 200,
      headers: {
        'Content-Type': 'application/schema+json; charset=utf-8',
        ...cacheHeaders,
      },
    });
  } catch (error: any) {
    if (error?.code === 'ENOENT')
      return new Response('Not Found', { status: 404, headers: cacheHeaders });

    return new Response('Failed to read schema', { status: 500, headers: cacheHeaders });
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ schema: string[] }> },
) {
  void request;

  const { schema } = await context.params;
  const relPath = getSchemaRelPath(schema);
  if (!relPath) return new Response('Bad Request', { status: 400, headers: cacheHeaders });

  const local = await readLocalSchema(relPath);
  if (local) return local;

  return new Response('Not Found', { status: 404, headers: cacheHeaders });
}
