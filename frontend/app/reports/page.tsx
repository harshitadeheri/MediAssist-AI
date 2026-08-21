"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Report {
  id: number;
  file_name: string;
  file_path: string;
  status: string;
  uploaded_at: string | null;
}

export default function ReportsPage() {
  const router = useRouter();

  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchReports = async () => {
      const token = localStorage.getItem("access_token");

      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const response = await fetch(
          "http://127.0.0.1:8000/reports",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status === 401) {
          localStorage.removeItem("access_token");
          router.push("/login");
          return;
        }

        if (!response.ok) {
          throw new Error("Failed to fetch reports");
        }

        const data = await response.json();
        setReports(data);
      } catch (err) {
        console.error(err);
        setError("Unable to load your reports.");
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [router]);

  const formatDate = (date: string | null) => {
    if (!date) return "Unknown date";

    return new Date(date).toLocaleString();
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      {/* Navbar */}
      <nav className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-xl text-white">
              +
            </div>

            <div className="text-left">
              <h1 className="text-xl font-bold text-blue-700">
                MediAssist-AI
              </h1>

              <p className="text-xs text-slate-500">
                Intelligent Health Assistant
              </p>
            </div>
          </button>

          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-slate-600 sm:block">
              My Reports
            </span>

            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-700">
              H
            </div>
          </div>
        </div>
      </nav>

      {/* Main */}
      <section className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-8">
          <button
            onClick={() => router.push("/")}
            className="mb-4 text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            ← Back to Dashboard
          </button>

          <h2 className="text-3xl font-bold">
            My Reports
          </h2>

          <p className="mt-2 text-slate-600">
            View your previously uploaded medical reports and
            their analysis status.
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="rounded-2xl border bg-white p-10 text-center shadow-sm">
            <p className="text-slate-600">
              Loading your reports...
            </p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
            {error}
          </div>
        )}

        {/* No reports */}
        {!loading && !error && reports.length === 0 && (
          <div className="rounded-2xl border bg-white p-10 text-center shadow-sm">
            <div className="text-5xl">📁</div>

            <h3 className="mt-4 text-xl font-semibold">
              No reports yet
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Upload a medical report from your dashboard
              to see it here.
            </p>

            <button
              onClick={() => router.push("/")}
              className="mt-6 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
            >
              Upload Report
            </button>
          </div>
        )}

        {/* Reports */}
        {!loading && !error && reports.length > 0 && (
          <div className="space-y-4">
            {reports.map((report) => (
              <div
                key={report.id}
                className="rounded-2xl border bg-white p-6 shadow-sm"
              >
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-2xl">
                      📄
                    </div>

                    <div>
                      <h3 className="font-semibold text-slate-900">
                        {report.file_name}
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        Uploaded: {formatDate(report.uploaded_at)}
                      </p>

                      <span
                        className={`mt-3 inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                          report.status === "Analyzed"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {report.status}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      router.push(`/reports/${report.id}`)
                    }
                    className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
                  >
                    View Analysis →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
