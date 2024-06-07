type R<N extends number, Acc extends number[] = []> = Acc["length"] extends N
  ? Acc[number]
  : R<N, [...Acc, Acc["length"]]>;

type DimensionKeys = `dimension${R<41>}`;

export type Dimensions = Partial<{
  [key in DimensionKeys]: any;
}>;
