import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";

const http = httpRouter();

// http.route({
//   pathPrefix: "/get-data/",
//   method: "OPTIONS",
//   handler: httpAction(async (_, request) => {
//     // Make sure the necessary headers are present
//     // for this to be a valid pre-flight request
//     const headers = request.headers;
//     if (
//       headers.get("Origin") !== null &&
//       headers.get("Access-Control-Request-Method") !== null &&
//       headers.get("Access-Control-Request-Headers") !== null
//     ) {
//       return new Response(null, {
//         headers: new Headers({
//           // e.g. https://mywebsite.com
//           "Access-Control-Allow-Origin": "*",
//           "Access-Control-Allow-Methods": "GET",
//           "Access-Control-Allow-Headers": "Content-Type",
//           "Access-Control-Max-Age": "86400",
//           "Content-Type": "application/json",
//         }),
//       });
//     } else {
//       return new Response();
//     }
//   }),
// });

http.route({
  pathPrefix: "/get-data/",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const q = request.url.split("/").pop() as string;

    if (!q) {
      return new Response(JSON.stringify([]), {
        headers: { "Content-Type": "application/json" },
      });
    }

    const data = await ctx.runQuery(internal.query.getDataByFetch, {
      id: q,
    });
    return new Response(JSON.stringify(data), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }),
});

export default http;
