export function clamp(
  value: number,
  min = Number.NEGATIVE_INFINITY,
  max = Number.POSITIVE_INFINITY
) {
  if (value < min) {
    return min;
  }

  if (value > max) {
    return max;
  }

  return value;
}
