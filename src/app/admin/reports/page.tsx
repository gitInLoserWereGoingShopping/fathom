import { prisma } from "@/lib/db";
import { isAdminSecretValid } from "@/lib/admin";
import { AdminReportActions } from "@/components/AdminReportActions";

export default async function AdminReportsPage({
  searchParams,
}: {
  searchParams: { secret?: string };
}) {
  const secret = searchParams.secret ?? "";

  if (!isAdminSecretValid(secret)) {
    return (
      <div className="page">
        <h1>Admin access required</h1>
        <p>Provide a valid secret to view reports.</p>
      </div>
    );
  }

  const reports = await prisma.report.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      explanation: true,
    },
  });

  return (
    <div className="page">
      <header className="hero">
        <div>
          <h1>Safety Reports</h1>
          <p>Review and resolve flagged answers.</p>
        </div>
      </header>

      <div className="stack">
        {reports.map((report) => (
          <section key={report.id} className="card">
            <h3>Report</h3>
            <p className="muted">Created {report.createdAt.toLocaleString()}</p>
            <p>
              <strong>Status:</strong> {report.status}
            </p>
            <p>
              <strong>Explanation:</strong> {report.explanationId}
            </p>
            <p>
              <strong>Reason:</strong> {report.reason}
            </p>
            <AdminReportActions reportId={report.id} secret={secret} />
          </section>
        ))}
      </div>
    </div>
  );
}
