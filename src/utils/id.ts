/** Local-only id for draft entries — never sent to the backend. */
export function makeLocalId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
