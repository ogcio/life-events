/**
 *
 * @param hex Example format: #FFFFFF
 * @param o Opacity
 * @returns rgba from hex
 */
export function hexToRgba(hex: string, o: number) {
  const parts = hex
    .slice(1)
    .match(/.{1,2}/g)
    ?.map((item) => parseInt(item, 16)) ?? [0, 0, 0];
  return `rgba(${parts.join(", ")} , 0.${o.toString().padStart(2, "0")})`;
}
