import type { NextRouter } from 'next/router'
import { ParsedUrlQuery } from 'querystring';

export const getQueryParameterString = (query: ParsedUrlQuery, name: string): (string | undefined) => {
  if (!query || name in query === false) {
    return;
  }

  const value = query[name];
  return value ? (Array.isArray(value) ? value[0] : value) : undefined;
}

// export const getQueryParameterStringArray = (query: ParsedUrlQuery, name: string): string[] | undefined => {
//   if (!query || name in query === false) {
//     return;
//   }

//   const value = query[name];
//   return value ? (Array.isArray(value) ? value : [value]) : undefined;
// }