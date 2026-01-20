import { z } from "zod";
import { insertQuerySchema, insertHitSchema, hits, queries } from "./schema";

export const api = {
  search: {
    perform: {
      method: "POST" as const,
      path: "/api/search",
      input: z.object({ query: z.string() }),
      responses: {
        200: z.object({
          query: z.string(),
          results: z.array(z.object({
            title: z.string(),
            url: z.string(),
            description: z.string().nullable(),
            rank: z.number()
          }))
        })
      }
    },
    history: {
      method: "GET" as const,
      path: "/api/history",
      responses: {
        200: z.array(z.custom<typeof queries.$inferSelect>())
      }
    }
  }
};
