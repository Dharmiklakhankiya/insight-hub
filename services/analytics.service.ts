import { connectDb } from "@/lib/db";
import { CaseModel } from "@/models/Case";

type CaseTypeDistribution = {
  case_type: string;
  count: number;
};

type LawyerLoad = {
  lawyer: string;
  caseCount: number;
};

function buildInsights(payload: {
  caseTypeDistribution: CaseTypeDistribution[];
  lawyerWorkload: LawyerLoad[];
  averageCaseDuration: number;
}): string[] {
  const insights: string[] = [];

  if (payload.caseTypeDistribution.length > 0) {
    const topType = payload.caseTypeDistribution[0];
    insights.push(
      `Most frequent case type is ${topType.case_type} (${topType.count} cases).`,
    );
  }

  if (payload.lawyerWorkload.length > 1) {
    const highest = payload.lawyerWorkload[0];
    const lowest = payload.lawyerWorkload[payload.lawyerWorkload.length - 1];

    if (highest.caseCount >= Math.max(2, lowest.caseCount * 2)) {
      insights.push(
        `Workload imbalance detected: ${highest.lawyer} has ${highest.caseCount} cases while ${lowest.lawyer} has ${lowest.caseCount}.`,
      );
    } else {
      insights.push("Lawyer workload is relatively balanced.");
    }
  }

  if (payload.averageCaseDuration > 180) {
    insights.push(
      `Average case duration is ${Math.round(payload.averageCaseDuration)} days, indicating long resolution cycles.`,
    );
  } else {
    insights.push(
      `Average case duration is ${Math.round(payload.averageCaseDuration)} days, within expected range.`,
    );
  }

  return insights;
}

export async function getAnalyticsSummary() {
  await connectDb();

  const [totalCases, statusGroups, typeGroups, durationGroup, lawyerGroups] =
    await Promise.all([
      CaseModel.countDocuments({}),
      CaseModel.aggregate<{ _id: string; count: number }>([
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      CaseModel.aggregate<{ _id: string; count: number }>([
        { $group: { _id: "$case_type", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      CaseModel.aggregate<{ _id: null; avgDuration: number }>([
        {
          $project: {
            durationDays: {
              $divide: [
                {
                  $subtract: [
                    {
                      $ifNull: ["$closing_date", "$$NOW"],
                    },
                    "$filing_date",
                  ],
                },
                1000 * 60 * 60 * 24,
              ],
            },
          },
        },
        {
          $group: {
            _id: null,
            avgDuration: { $avg: "$durationDays" },
          },
        },
      ]),
      CaseModel.aggregate<{ _id: string; caseCount: number }>([
        { $unwind: "$assigned_lawyers" },
        { $group: { _id: "$assigned_lawyers", caseCount: { $sum: 1 } } },
        { $sort: { caseCount: -1 } },
      ]),
    ]);

  const closedCount =
    statusGroups.find((item) => item._id === "closed")?.count ?? 0;
  const activeCount = totalCases - closedCount;

  const caseTypeDistribution = typeGroups.map((item) => ({
    case_type: item._id,
    count: item.count,
  }));

  const averageCaseDuration = durationGroup[0]?.avgDuration ?? 0;

  const lawyerWorkload = lawyerGroups.map((item) => ({
    lawyer: item._id,
    caseCount: item.caseCount,
  }));

  const insights = buildInsights({
    caseTypeDistribution,
    lawyerWorkload,
    averageCaseDuration,
  });

  return {
    totalCases,
    activeCount,
    closedCount,
    caseTypeDistribution,
    averageCaseDuration,
    lawyerWorkload,
    insights,
  };
}
