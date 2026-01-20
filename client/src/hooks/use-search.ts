import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { type Hit, type Query } from "@shared/schema";
import { z } from "zod";

// Helper to safely parse API responses since the backend is Python
function parseResponse<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.error("[Zod] Validation failed:", result.error);
    // In production, you might want to throw here, but for now we return data as is casted if parsing fails 
    // to prevent the UI from completely breaking if the schema is slightly off.
    return data as T;
  }
  return result.data;
}

export function useHistory() {
  return useQuery({
    queryKey: [api.search.history.path],
    queryFn: async () => {
      const res = await fetch(api.search.history.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch history");
      const data = await res.json();
      return parseResponse(api.search.history.responses[200], data);
    },
  });
}

export function useSearch() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (queryText: string) => {
      const validatedInput = api.search.perform.input.parse({ query: queryText });
      
      const res = await fetch(api.search.perform.path, {
        method: api.search.perform.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validatedInput),
        credentials: "include",
      });
      
      if (!res.ok) throw new Error("Search failed");
      const data = await res.json();
      const parsed = parseResponse(api.search.perform.responses[200], data);
      return parsed.results;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.search.history.path] });
    },
  });
}
