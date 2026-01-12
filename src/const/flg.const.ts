/**
 * DBフラグ定数
 */
export const FLG = {
  ON: "1",
  OFF: "0",
} as const;

export type FlgType = (typeof FLG)[keyof typeof FLG];
