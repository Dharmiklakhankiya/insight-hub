import { describe, expect, it, vi } from "vitest";

const listCasesMock = vi.hoisted(() => vi.fn());

vi.mock("@/services/case.service", () => ({
  listCases: listCasesMock,
}));

import { searchCases } from "@/services/search.service";

describe("search.service", () => {
  it("forwards query input to case listing service", async () => {
    listCasesMock.mockResolvedValue({ items: [], total: 0 });

    const query = {
      query: "breach",
      status: "ongoing" as const,
      court: "Delhi",
      judge: "Justice Rao",
      page: 1,
      limit: 10,
      sortBy: "createdAt" as const,
      sortOrder: "desc" as const,
    };

    await expect(searchCases(query)).resolves.toEqual({ items: [], total: 0 });
    expect(listCasesMock).toHaveBeenCalledWith(query);
  });
});
