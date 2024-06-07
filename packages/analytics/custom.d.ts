// / <reference types="next" />
// / <reference types="next/types/global" />

interface Window {
  _paq?:
    | (
        | Dimensions
        | number[]
        | string[]
        | number
        | string
        | null
        | undefined
      )[][]
    | null;
}
declare namespace NodeJS {
  interface Global {
    _paq?:
      | (
          | Dimensions
          | number[]
          | string[]
          | number
          | string
          | null
          | undefined
        )[][]
      | null;
  }
}
