import type { Response } from 'express';
import { memGet, memSet } from '../cache/memCache.js';
import { asyncHandler } from './asyncHandler.js';

export function cacheMiddleware(key: string, ttlSecs: number) {
  const withCacheHit = (body: unknown, cacheHit: boolean) => {
    if (!body || typeof body !== 'object') return body;
    if (!('cacheHit' in (body as Record<string, unknown>))) return body;
    return { ...(body as Record<string, unknown>), cacheHit };
  };

  return asyncHandler(async (req, res, next) => {
    const cached = memGet(key);

    res.setHeader('Cache-Control', `public, max-age=${ttlSecs}`);

    if (cached !== null) {
      res.setHeader('X-Cache', 'HIT');
      return res.json(withCacheHit(cached, true));
    }

    res.setHeader('X-Cache', 'MISS');
    const originalJson = res.json.bind(res);

    res.json = ((body: unknown) => {
      if (req.method === 'GET' && res.statusCode >= 200 && res.statusCode < 300) {
        memSet(key, withCacheHit(body, false), ttlSecs * 1000);
      }
      return originalJson(body);
    }) as Response['json'];

    next();
  });
}
