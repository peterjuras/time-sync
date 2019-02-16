let lastId = 0;
export function generateId(): number {
  return lastId++;
}
