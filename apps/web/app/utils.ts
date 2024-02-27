import { pgpool } from "./sessions";
import { FeatureFlag } from "./../types/FeatureFlags";

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

export async function getFeatureFlag(slug: string) {
  const result = await pgpool.query<FeatureFlag, [string]>(
    `SELECT * FROM feature_flags WHERE slug = $1`,
    [slug]
  );
  return result.rows[0];
}

export async function getFeatureFlags() {
  return (
    await pgpool.query<FeatureFlag, string[]>(`SELECT * FROM feature_flags`)
  ).rows;
}
