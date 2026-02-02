import Link from "next/link";
import { prisma } from "@/lib/db";
import { isAdminSecretValid } from "@/lib/admin";

type FlowRunRow = {
  id: string;
  createdAt: Date;
  rawQuery: string;
  level: string;
  status: string;
  cacheHit: boolean;
  canonicalTopic: string | null;
  groupKey: string | null;
  errorMessage: string | null;
};

export default async function AdminFlowsPage({
  searchParams,
}: {
  searchParams: { secret?: string };
}) {
  const secret = searchParams.secret ?? "";

  if (!isAdminSecretValid(secret)) {
    return (
      <div className="page">
        <h1>Admin access required</h1>
        <p>Provide a valid secret to view flow runs.</p>
      </div>
    );
  }

  const flows = (await prisma.flowRun.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  })) as FlowRunRow[];

  return (
    <div className="page">
      <header className="hero">
        <div>
          <h1>Flow Runs</h1>
          <p>Inspect every query pipeline from input to persistence.</p>
        </div>
      </header>

      <div className="card table">
        <table>
          <thead>
            <tr>
              <th>Created</th>
              <th>Raw Query</th>
              <th>Level</th>
              <th>Status</th>
              <th>Cache Hit</th>
              <th>Canonical Topic</th>
              <th>Group Key</th>
              <th>Error</th>
            </tr>
          </thead>
          <tbody>
            {flows.map((flow) => (
              <tr key={flow.id}>
                <td>{flow.createdAt.toLocaleString()}</td>
                <td>
                  <Link
                    href={`/admin/flows/${flow.id}?secret=${encodeURIComponent(
                      secret,
                    )}`}
                  >
                    {flow.rawQuery}
                  </Link>
                </td>
                <td>{flow.level}</td>
                <td>{flow.status}</td>
                <td>{flow.cacheHit ? "true" : "false"}</td>
                <td>{flow.canonicalTopic ?? "—"}</td>
                <td className="mono">{flow.groupKey ?? "—"}</td>
                <td>
                  {flow.errorMessage ? (
                    <span className="badge error">Error</span>
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
