export function readFromPath(state: unknown): string | null {
  if (typeof state !== 'object' || state === null || !('from' in state)) {
    return null;
  }
  const from = state.from;
  if (typeof from !== 'string' || !from.startsWith('/') || from.startsWith('//')) {
    return null;
  }
  return from;
}
