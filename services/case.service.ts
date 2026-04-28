import { Types } from "mongoose";

import { connectDb } from "@/lib/db";
import { AppError } from "@/lib/errors";
import type {
  CaseCreateInput,
  CaseUpdateInput,
} from "@/lib/validators/case.schema";
import type { SearchQueryInput } from "@/lib/validators/search.schema";
import { CaseModel } from "@/models/Case";
import { DocumentModel } from "@/models/Document";

function parseCaseDates(input: CaseCreateInput | CaseUpdateInput) {
  return {
    ...input,
    filing_date: input.filing_date ? new Date(input.filing_date) : undefined,
    closing_date: input.closing_date
      ? new Date(input.closing_date)
      : (input.closing_date ?? undefined),
  };
}

function buildCaseQuery(input: SearchQueryInput) {
  const query: Record<string, unknown> = {};

  if (input.status) {
    query.status = input.status;
  }

  if (input.court) {
    query.court = input.court;
  }

  if (input.judge) {
    query.judge = input.judge;
  }

  if (input.query) {
    query.$text = { $search: input.query };
  }

  return query;
}

export async function createCase(input: CaseCreateInput, userId: string) {
  await connectDb();

  const payload = parseCaseDates(input);

  const caseRecord = await CaseModel.create({
    ...payload,
    created_by: new Types.ObjectId(userId),
  });

  return caseRecord.toObject();
}

export async function listCases(input: SearchQueryInput) {
  await connectDb();

  const query = buildCaseQuery(input);
  const skip = (input.page - 1) * input.limit;
  const sortDirection = input.sortOrder === "asc" ? 1 : -1;

  const sort: Record<string, 1 | -1 | { $meta: "textScore" }> = input.query
    ? { score: { $meta: "textScore" }, createdAt: -1 }
    : { [input.sortBy]: sortDirection };

  const [items, total] = await Promise.all([
    CaseModel.find(
      query,
      input.query ? { score: { $meta: "textScore" } } : undefined,
    )
      .sort(sort)
      .skip(skip)
      .limit(input.limit)
      .lean(),
    CaseModel.countDocuments(query),
  ]);

  return {
    items,
    page: input.page,
    limit: input.limit,
    total,
    totalPages: Math.ceil(total / input.limit) || 1,
  };
}

export async function getCaseById(caseId: string) {
  await connectDb();

  const record = await CaseModel.findById(caseId).lean();
  if (!record) {
    throw new AppError("Case not found", 404);
  }

  const documents = await DocumentModel.find({ case_id: caseId })
    .sort({ createdAt: -1 })
    .lean();

  return {
    ...record,
    documents,
  };
}

export async function updateCase(caseId: string, input: CaseUpdateInput) {
  await connectDb();

  const payload = parseCaseDates(input);

  const updated = await CaseModel.findByIdAndUpdate(caseId, payload, {
    new: true,
    runValidators: true,
  }).lean();

  if (!updated) {
    throw new AppError("Case not found", 404);
  }

  return updated;
}

export async function deleteCase(caseId: string) {
  await connectDb();

  const deleted = await CaseModel.findByIdAndDelete(caseId).lean();
  if (!deleted) {
    throw new AppError("Case not found", 404);
  }

  await DocumentModel.deleteMany({ case_id: caseId });

  return deleted;
}
