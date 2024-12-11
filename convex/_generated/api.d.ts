/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as http from "../http.js";
import type * as init from "../init.js";
import type * as mutation from "../mutation.js";
import type * as pc from "../pc.js";
import type * as pcSeed from "../pcSeed.js";
import type * as query from "../query.js";
import type * as shared from "../shared.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  http: typeof http;
  init: typeof init;
  mutation: typeof mutation;
  pc: typeof pc;
  pcSeed: typeof pcSeed;
  query: typeof query;
  shared: typeof shared;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
