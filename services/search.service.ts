import type { SearchQueryInput } from "@/lib/validators/search.schema";
import { listCases } from "@/services/case.service";

export async function searchCases(input: SearchQueryInput) {
  return listCases(input);
}
