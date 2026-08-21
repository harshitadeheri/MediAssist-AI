"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = "http://localhost:8000";

interface CBCParameter {
  value: number | string;
  unit: string;
  reference: string;
  status: "Normal" | "High" | "Low";
}

interface CBCAnalysis {
  hemoglobin?: CBCParameter;
  wbc_count?: CBCParameter;
  rbc_count?: CBCParameter;
  platelets?: CBCParameter;
  hematocrit?: CBCParameter;
  mcv?: CBCParameter;
  mch?: CBCParameter;
  mchc?: CBCParameter;
  neutrophils?: CBCParameter;
  lymphocytes?: CBCParameter;
}

interface Summary {
  overall_status: string;
  summary: string;
  normal_count: number;
  high_count: number;
  low_count: number;
  total_parameters: number;
}

interface CBCResult {
  file_name: string;
  analysis: CBCAnalysis;
  summary?: Summary;
}

interface Report {
  id: number;
  file_name: string;
  file_path: string;
  status: string;
  uploaded_at?: string;
}

export default function Home() {
  const router = useRouter();

  const [token, setToken] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [cbcResult, setCbcResult] = useState<CBCResult | null>(null);

  const [reports, setReports] = useState<Report[]>([]);
  const [showReports, setShowReports] = useState(false);

  useEffect(() => {
    const storedToken = localStorage.getItem("access_token");

    if (!storedToken) {
      router.push("/login");
      return;
    }

    setToken(storedToken);
  }, [router]);

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    setError("");
    setCbcResult(null);

    if (!file) {
      setSelectedFile(null);
      return;
    }

    if (file.type !== "application/pdf") {
      setError("Only PDF files are allowed.");
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const uploadReport = async () => {
    if (!token) {
      router.push("/login");
      return;
    }

    if (!selectedFile) {
      setError("Please select a PDF report first.");
      return;
    }

    setLoading(true);
    setError("");
    setCbcResult(null);

    try {
      /*
       * STEP 1:
       * Upload the PDF to /reports/upload
       */

      const formData = new FormData();
      formData.append("file", selectedFile);

      const uploadResponse = await fetch(
        `${API_URL}/reports/upload`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();

        throw new Error(
          errorData.detail || "Failed to upload report."
        );
      }

      /*
       * STEP 2:
       * Analyze the CBC report
       */

      const analyzeFormData = new FormData();
      analyzeFormData.append("file", selectedFile);

      const analyzeResponse = await fetch(
        `${API_URL}/cbc/analyze`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: analyzeFormData,
        }
      );

      if (!analyzeResponse.ok) {
        const errorData = await analyzeResponse.json();

        throw new Error(
          errorData.detail || "Failed to analyze CBC report."
        );
      }

      const result = await analyzeResponse.json();

      /*
       * The backend returns the CBC analysis.
       */

      setCbcResult(result);

      /*
       * Refresh reports after successful upload.
       */

      await loadReports();
    } catch (err) {
      console.error(err);

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Something went wrong.");
      }
    } finally {
      setLoading(false);
    }
  };

  const loadReports = async () => {
    if (!token) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/reports`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to load reports.");
      }

      const data = await response.json();

      setReports(data);
      setShowReports(true);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load reports."
      );
    }
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    router.push("/login");
  };

  const openAssistant = () => {
    router.push("/chatbot");
  };

  const getStatusClass = (
    status: "Normal" | "High" | "Low"
  ) => {
    if (status === "High") {
      return "status high";
    }

    if (status === "Low") {
      return "status low";
    }

    return "status normal";
  };

  const parameterName = (key: string) => {
    const names: Record<string, string> = {
      hemoglobin: "Hemoglobin",
      wbc_count: "WBC Count",
      rbc_count: "RBC Count",
      platelets: "Platelets",
      hematocrit: "Hematocrit",
      mcv: "MCV",
      mch: "MCH",
      mchc: "MCHC",
      neutrophils: "Neutrophils",
      lymphocytes: "Lymphocytes",
    };

    return names[key] || key;
  };

  if (!token) {
    return (
      <main className="loading-page">
        <p>Loading...</p>
      </main>
    );
  }

  return (
    <>
      <style jsx global>{`
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          font-family:
            Arial,
            Helvetica,
            sans-serif;
          background: #f7f9fc;
          color: #111827;
        }

        button {
          font-family: inherit;
        }

        .page {
          min-height: 100vh;
        }

        /* ================= HEADER ================= */

        .header {
          height: 88px;
          background: white;
          border-bottom: 1px solid #d7deea;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 30px;
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .brand-icon {
          width: 48px;
          height: 48px;
          border-radius: 10px;
          background: #2161f5;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 30px;
          font-weight: bold;
        }

        .brand-title {
          font-size: 23px;
          font-weight: 700;
          color: #174ed4;
        }

        .brand-subtitle {
          font-size: 14px;
          color: #70809b;
          margin-top: 3px;
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .welcome {
          color: #526581;
          font-size: 16px;
        }

        .avatar {
          width: 45px;
          height: 45px;
          border-radius: 50%;
          background: #e2edff;
          color: #1e5bea;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 20px;
        }

        .logout {
          border: none;
          background: transparent;
          color: #e53935;
          cursor: pointer;
          font-weight: 600;
          font-size: 14px;
        }

        /* ================= MAIN ================= */

        .container {
          padding: 45px 30px 35px;
          max-width: 1600px;
          margin: auto;
        }

        .page-title {
          font-size: 36px;
          margin: 0;
          color: #111b31;
        }

        .page-subtitle {
          font-size: 20px;
          color: #536782;
          margin-top: 12px;
          margin-bottom: 42px;
        }

        /* ================= DASHBOARD CARDS ================= */

        .dashboard-grid {
          display: grid;
          grid-template-columns:
            repeat(3, 1fr);
          gap: 30px;
        }

        .card {
          background: white;
          border: 1.5px solid #1c293d;
          border-radius: 20px;
          padding: 30px;
          min-height: 500px;
          box-shadow:
            0 2px 5px rgba(0, 0, 0, 0.03);
        }

        .card-icon {
          width: 60px;
          height: 60px;
          border-radius: 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 30px;
          margin-bottom: 25px;
        }

        .blood-icon {
          background: #dbeafe;
        }

        .reports-icon {
          background: #dcfce7;
        }

        .bot-icon {
          background: #f0e3ff;
        }

        .card-title {
          font-size: 24px;
          margin: 0 0 14px;
          color: #111a30;
        }

        .card-description {
          color: #526681;
          font-size: 18px;
          line-height: 1.5;
          margin-bottom: 28px;
        }

        /* ================= FILE UPLOAD ================= */

        .file-label {
          display: block;
          cursor: pointer;
        }

        .file-input {
          display: none;
        }

        .file-box {
          border: 2px dashed #c9d8eb;
          border-radius: 16px;
          height: 160px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          color: #18243a;
          margin-bottom: 20px;
          transition: 0.2s;
        }

        .file-box:hover {
          border-color: #2161f5;
          background: #f8fbff;
        }

        .file-symbol {
          font-size: 40px;
          margin-bottom: 8px;
        }

        .file-name {
          font-size: 17px;
          font-weight: 500;
          max-width: 90%;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .file-hint {
          color: #6b7d9a;
          margin-top: 8px;
        }

        /* ================= BUTTONS ================= */

        .primary-button {
          width: 100%;
          height: 62px;
          border: none;
          border-radius: 14px;
          background: #2161f5;
          color: white;
          font-size: 20px;
          font-weight: 700;
          cursor: pointer;
          transition: 0.2s;
        }

        .primary-button:hover {
          background: #174ed4;
        }

        .primary-button:disabled {
          background: #9bb5ef;
          cursor: not-allowed;
        }

        .secondary-button {
          width: 100%;
          height: 62px;
          border: 1px solid #cbd8e8;
          border-radius: 14px;
          background: white;
          color: #111a30;
          font-size: 20px;
          font-weight: 700;
          cursor: pointer;
        }

        .secondary-button:hover {
          background: #f7faff;
        }

        .assistant-button {
          width: 100%;
          height: 62px;
          border: none;
          border-radius: 14px;
          background: #9815f3;
          color: white;
          font-size: 20px;
          font-weight: 700;
          cursor: pointer;
          margin-top: 15px;
        }

        .assistant-button:hover {
          background: #8010d2;
        }

        /* ================= ERROR ================= */

        .error {
          margin-top: 18px;
          padding: 16px;
          border-radius: 14px;
          background: #fff0f0;
          color: #dc2626;
          font-size: 16px;
        }

        /* ================= REPORT LIST ================= */

        .reports-section {
          margin-top: 35px;
          background: white;
          border: 1.5px solid #1c293d;
          border-radius: 20px;
          padding: 30px;
        }

        .reports-title {
          font-size: 28px;
          margin-top: 0;
        }

        .report-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 18px 0;
          border-bottom: 1px solid #e2e8f0;
        }

        .report-item:last-child {
          border-bottom: none;
        }

        .report-name {
          font-weight: 600;
          font-size: 17px;
        }

        .report-status {
          color: #07883a;
          background: #dcfce7;
          padding: 7px 13px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 600;
        }

        /* ================= CBC RESULT ================= */

        .result-section {
          margin-top: 35px;
          background: white;
          border: 1.5px solid #1c293d;
          border-radius: 20px;
          padding: 30px;
        }

        .result-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 30px;
        }

        .result-title {
          font-size: 30px;
          margin: 0;
        }

        .result-file {
          color: #637895;
          font-size: 17px;
          margin-top: 8px;
        }

        .analyzed-badge {
          background: #d9fbe5;
          color: #07883a;
          padding: 12px 20px;
          border-radius: 30px;
          font-weight: 700;
        }

        .parameters-grid {
          display: grid;
          grid-template-columns:
            repeat(3, 1fr);
          gap: 20px;
        }

        .parameter-card {
          border: 1.5px solid #24344c;
          border-radius: 16px;
          padding: 20px;
          min-height: 165px;
        }

        .parameter-name {
          color: #70819d;
          font-size: 18px;
          margin-bottom: 15px;
        }

        .parameter-value {
          font-size: 30px;
          font-weight: 700;
          color: #111b31;
        }

        .parameter-unit {
          color: #70819d;
          margin-top: 3px;
        }

        .reference {
          color: #70819d;
          margin-top: 14px;
        }

        .status {
          display: inline-block;
          margin-top: 10px;
          padding: 7px 13px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 700;
        }

        .normal {
          background: #d9fbe5;
          color: #07883a;
        }

        .high {
          background: #fee2e2;
          color: #dc2626;
        }

        .low {
          background: #fff3cd;
          color: #9a6700;
        }

        /* ================= SUMMARY ================= */

        .summary-box {
          margin-top: 35px;
          padding: 25px;
          border-radius: 18px;
          background: #edf5ff;
        }

        .summary-title {
          font-size: 25px;
          color: #20418b;
          margin-top: 0;
        }

        .summary-status {
          font-weight: 700;
          margin-bottom: 10px;
        }

        .summary-text {
          font-size: 18px;
          line-height: 1.6;
          color: #334b72;
        }

        .summary-counts {
          display: flex;
          gap: 25px;
          margin-top: 18px;
          flex-wrap: wrap;
        }

        .count {
          padding: 10px 15px;
          border-radius: 10px;
          background: white;
          font-weight: 600;
        }

        /* ================= FOOTER ================= */

        .disclaimer {
          margin-top: 40px;
          background: #fff9e8;
          border-radius: 15px;
          padding: 22px;
          color: #a54b00;
          font-size: 17px;
        }

        /* ================= LOADING ================= */

        .loading-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
        }

        /* ================= RESPONSIVE ================= */

        @media (max-width: 1100px) {
          .dashboard-grid {
            grid-template-columns: 1fr;
          }

          .parameters-grid {
            grid-template-columns:
              repeat(2, 1fr);
          }
        }

        @media (max-width: 700px) {
          .header {
            padding: 0 15px;
          }

          .welcome {
            display: none;
          }

          .container {
            padding: 30px 15px;
          }

          .page-title {
            font-size: 30px;
          }

          .page-subtitle {
            font-size: 17px;
          }

          .card {
            padding: 22px;
          }

          .parameters-grid {
            grid-template-columns: 1fr;
          }

          .result-header {
            flex-direction: column;
            gap: 15px;
          }

          .report-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
          }
        }
      `}</style>

      <div className="page">

        {/* ================= HEADER ================= */}

        <header className="header">

          <div className="brand">

            <div className="brand-icon">
              +
            </div>

            <div>
              <div className="brand-title">
                MediAssist-AI
              </div>

              <div className="brand-subtitle">
                Intelligent Health Assistant
              </div>
            </div>

          </div>

          <div className="header-right">

            <span className="welcome">
              Welcome back
            </span>

            <div className="avatar">
              H
            </div>

            <button
              className="logout"
              onClick={logout}
            >
              Logout
            </button>

          </div>

        </header>

        {/* ================= MAIN ================= */}

        <main className="container">

          <h1 className="page-title">
            Medical Dashboard
          </h1>

          <p className="page-subtitle">
            Upload your medical reports and get
            AI-powered insights.
          </p>

          {/* ================= THREE CARDS ================= */}

          <section className="dashboard-grid">

            {/* CBC ANALYSIS */}

            <div className="card">

              <div className="card-icon blood-icon">
                🩸
              </div>

              <h2 className="card-title">
                CBC Analysis
              </h2>

              <p className="card-description">
                Upload a Complete Blood Count report
                and understand your blood parameters.
              </p>

              <label className="file-label">

                <input
                  type="file"
                  accept="application/pdf"
                  className="file-input"
                  onChange={handleFileChange}
                />

                <div className="file-box">

                  <div className="file-symbol">
                    📄
                  </div>

                  {selectedFile ? (
                    <>
                      <div className="file-name">
                        {selectedFile.name}
                      </div>

                      <div className="file-hint">
                        PDF selected
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="file-name">
                        Select medical blood report
                      </div>

                      <div className="file-hint">
                        PDF files only
                      </div>
                    </>
                  )}

                </div>

              </label>

              <button
                className="primary-button"
                onClick={uploadReport}
                disabled={loading}
              >
                {loading
                  ? "Analyzing..."
                  : "Analyze Report"}
              </button>

              {error && (
                <div className="error">
                  {error}
                </div>
              )}

            </div>

            {/* MY REPORTS */}

            <div className="card">

              <div className="card-icon reports-icon">
                📋
              </div>

              <h2 className="card-title">
                My Reports
              </h2>

              <p className="card-description">
                View your previously uploaded medical
                reports and their analysis status.
              </p>

              <button
                className="secondary-button"
                onClick={loadReports}
              >
                View Reports
              </button>

            </div>

            {/* AI ASSISTANT */}

            <div className="card">

              <div className="card-icon bot-icon">
                🤖
              </div>

              <h2 className="card-title">
                AI Health Assistant
              </h2>

              <p className="card-description">
                Ask questions about your medical reports
                and receive easy-to-understand explanations.
              </p>

              <button
                className="assistant-button"
                onClick={openAssistant}
              >
                Open Assistant
              </button>

            </div>

          </section>

          {/* ================= REPORTS ================= */}

          {showReports && (
            <section className="reports-section">

              <h2 className="reports-title">
                My Reports
              </h2>

              {reports.length === 0 ? (
                <p>
                  No reports uploaded yet.
                </p>
              ) : (
                reports.map((report) => (
                  <div
                    className="report-item"
                    key={report.id}
                  >

                    <div>

                      <div className="report-name">
                        {report.file_name}
                      </div>

                      {report.uploaded_at && (
                        <div
                          style={{
                            color: "#70819d",
                            marginTop: "5px",
                          }}
                        >
                          {new Date(
                            report.uploaded_at
                          ).toLocaleString()}
                        </div>
                      )}

                    </div>

                    <div className="report-status">
                      {report.status}
                    </div>

                  </div>
                ))
              )}

            </section>
          )}

          {/* ================= CBC RESULT ================= */}

          {cbcResult && (
            <section className="result-section">

              <div className="result-header">

                <div>

                  <h2 className="result-title">
                    CBC Analysis Result
                  </h2>

                  <div className="result-file">
                    {cbcResult.file_name}
                  </div>

                </div>

                <div className="analyzed-badge">
                  Analyzed
                </div>

              </div>

              {/* PARAMETERS */}

              <div className="parameters-grid">

                {Object.entries(
                  cbcResult.analysis || {}
                ).map(([key, parameter]) => {

                  if (
                    !parameter ||
                    typeof parameter !== "object"
                  ) {
                    return null;
                  }

                  const item =
                    parameter as CBCParameter;

                  return (
                    <div
                      className="parameter-card"
                      key={key}
                    >

                      <div className="parameter-name">
                        {parameterName(key)}
                      </div>

                      <div className="parameter-value">
                        {item.value}
                      </div>

                      <div className="parameter-unit">
                        {item.unit}
                      </div>

                      <div className="reference">
                        Reference: {item.reference}
                      </div>

                      <div
                        className={getStatusClass(
                          item.status
                        )}
                      >
                        {item.status}
                      </div>

                    </div>
                  );
                })}

              </div>

              {/* SUMMARY */}

              {cbcResult.summary && (
                <div className="summary-box">

                  <h3 className="summary-title">
                    Summary
                  </h3>

                  <div className="summary-status">
                    Overall Status:{" "}
                    {cbcResult.summary.overall_status}
                  </div>

                  <div className="summary-text">
                    {cbcResult.summary.summary}
                  </div>

                  <div className="summary-counts">

                    <div className="count">
                      Normal:{" "}
                      {cbcResult.summary.normal_count}
                    </div>

                    <div className="count">
                      High:{" "}
                      {cbcResult.summary.high_count}
                    </div>

                    <div className="count">
                      Low:{" "}
                      {cbcResult.summary.low_count}
                    </div>

                    <div className="count">
                      Total:{" "}
                      {cbcResult.summary.total_parameters}
                    </div>

                  </div>

                </div>
              )}

            </section>
          )}

          {/* ================= DISCLAIMER ================= */}

          <div className="disclaimer">
            <strong>Important:</strong>{" "}
            MediAssist-AI provides informational
            assistance and is not a substitute for
            professional medical advice, diagnosis,
            or treatment.
          </div>

        </main>

      </div>
    </>
  );
}
