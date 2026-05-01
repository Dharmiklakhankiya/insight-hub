import type { UserRole } from "@/lib/constants";

export type Role = UserRole;

export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  tenantId: string | null;
};

export type Tenant = {
  id: string;
  name: string;
};

export type TimelineEvent = {
  type: "filing" | "hearing" | "adjournment" | "judgment";
  date: string;
  note: string;
};

export type DocumentItem = {
  _id: string;
  case_id: string;
  tags: string[];
  file_path: string;
  mime_type: string;
  original_name: string;
  uploaded_by: string;
  createdAt: string;
};

export type CaseItem = {
  _id: string;
  title: string;
  client_name: string;
  case_type: string;
  court: string;
  judge: string;
  status: "ongoing" | "closed" | "pending";
  assigned_lawyers: string[];
  filing_date: string;
  closing_date: string | null;
  timeline: TimelineEvent[];
  createdAt: string;
  updatedAt: string;
  documents?: DocumentItem[];
};

export type PaginatedCases = {
  items: CaseItem[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type AnalyticsSummary = {
  totalCases: number;
  activeCount: number;
  closedCount: number;
  caseTypeDistribution: Array<{ case_type: string; count: number }>;
  averageCaseDuration: number;
  lawyerWorkload: Array<{ lawyer: string; caseCount: number }>;
  insights: string[];
};
