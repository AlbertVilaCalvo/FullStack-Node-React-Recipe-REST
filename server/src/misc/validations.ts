export function isValidId(id: number): boolean {
  return !isNaN(id) && id > 0
}
