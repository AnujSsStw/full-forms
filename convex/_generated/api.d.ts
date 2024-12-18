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
import type * as embed from "../embed.js";
import type * as http from "../http.js";
import type * as init from "../init.js";
import type * as message from "../message.js";
import type * as mutation from "../mutation.js";
import type * as pc from "../pc.js";
import type * as pcSeed from "../pcSeed.js";
import type * as query from "../query.js";
import type * as serve from "../serve.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  embed: typeof embed;
  http: typeof http;
  init: typeof init;
  message: typeof message;
  mutation: typeof mutation;
  pc: typeof pc;
  pcSeed: typeof pcSeed;
  query: typeof query;
  serve: typeof serve;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
