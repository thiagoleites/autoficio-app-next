/**
 * Helper para rotas dinâmicas no Next.js
 * Resolve params quando vêm como Promise
 */

export async function unwrapParams<T extends Record<string, string>>(
    params: Promise<T> | T
  ): Promise<T> {
    return await params;
  }