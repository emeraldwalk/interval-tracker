/**
 * Modulus that works with positive and negative numbers.
 * @param a
 * @param n
 */
export function mod(
  a: number,
  n: number,
) {
  return ( a % n + n ) % n
}