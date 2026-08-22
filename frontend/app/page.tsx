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
  report_id?: number;
  file_name: string;
  status?: string;
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
       * Upload the PDF and save it as a report.
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
       * Analyze the CBC report.
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
          errorData.detail ||
            "Failed to analyze CBC report."
        );
      }

      const result = await analyzeResponse.json();

      setCbcResult(result);

      /*
       * Refresh report list.
       */

      await loadReports();

      setSelectedFile(null);

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
      <main className="page">
        <div className="loading-container">
          <h2>Loading MediAssist AI...</h2>
        </div>
      </main>
    );
  }

  return (
    <main className="page">

      {/* ================= HEADER ================= */}

      <header className="header">

        <div className="brand">
          <div className="brand-icon">
            🩺
          </div>

          <div>
            <h1>MediAssist AI</h1>

            <p>
              Intelligent Healthcare Assistant
            </p>
          </div>
        </div>

        <button
          className="logout-button"
          onClick={logout}
        >
          Logout
        </button>

      </header>


      {/* ================= MAIN CONTENT ================= */}

      <div className="container">

        {/* ================= WELCOME ================= */}

        <section className="welcome-section">

          <h2>
            Welcome to MediAssist AI
          </h2>

          <p>
            Upload your medical report and let AI
            help you understand your health information.
          </p>

        </section>


        {/* ================= ERROR ================= */}

        {error && (
          <div className="error-box">
            <strong>Error:</strong> {error}
          </div>
        )}


        {/* ================= UPLOAD CARD ================= */}

        <section className="upload-card">

          <div className="upload-icon">
            📄
          </div>

          <h2>
            Upload Medical Report
          </h2>

          <p>
            Upload your CBC blood report in PDF format.
          </p>

          <label className="file-label">

            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
            />

            Choose PDF Report

          </label>

          {selectedFile && (
            <div className="selected-file">

              <span>
                📎 {selectedFile.name}
              </span>

            </div>
          )}

          <button
            className="primary-button"
            onClick={uploadReport}
            disabled={loading || !selectedFile}
          >

            {loading
              ? "Analyzing Report..."
              : "Upload & Analyze"}

          </button>

        </section>


        {/* ================= RESULT ================= */}

        {cbcResult && (
          <section className="result-section">

            <div className="result-header">

              <div>
                <h2>
                  CBC Analysis Result
                </h2>

                <p>
                  {cbcResult.file_name}
                </p>
              </div>

              <div className="analysis-badge">
                ✓ Analyzed
              </div>

            </div>


            {/* SUMMARY */}

            {cbcResult.summary && (
              <div className="summary-card">

                <h3>
                  Overall Summary
                </h3>

                <div className="summary-status">

                  <span>
                    Overall Status:
                  </span>

                  <strong>
                    {cbcResult.summary.overall_status}
                  </strong>

                </div>

                <p>
                  {cbcResult.summary.summary}
                </p>


                <div className="summary-stats">

                  <div>
                    <strong>
                      {cbcResult.summary.total_parameters}
                    </strong>

                    <span>
                      Total
                    </span>
                  </div>

                  <div>
                    <strong>
                      {cbcResult.summary.normal_count}
                    </strong>

                    <span>
                      Normal
                    </span>
                  </div>

                  <div>
                    <strong>
                      {cbcResult.summary.high_count}
                    </strong>

                    <span>
                      High
                    </span>
                  </div>

                  <div>
                    <strong>
                      {cbcResult.summary.low_count}
                    </strong>

                    <span>
                      Low
                    </span>
                  </div>

                </div>

              </div>
            )}


            {/* CBC PARAMETERS */}

            <div className="parameters-card">

              <h3>
                CBC Parameters
              </h3>

              <div className="parameters-grid">

                {Object.entries(
                  cbcResult.analysis
                ).map(([key, parameter]) => (

                  <div
                    className="parameter-card"
                    key={key}
                  >

                    <div className="parameter-name">
                      {parameterName(key)}
                    </div>

                    <div className="parameter-value">

                      {parameter.value}

                      {parameter.unit && (
                        <span>
                          {" "}
                          {parameter.unit}
                        </span>
                      )}

                    </div>

                    <div className="parameter-reference">
                      Reference: {parameter.reference}
                    </div>

                    <div
                      className={getStatusClass(
                        parameter.status
                      )}
                    >
                      {parameter.status}
                    </div>

                  </div>

                ))}

              </div>

            </div>

          </section>
        )}


        {/* ================= FEATURE CARDS ================= */}

        <section className="cards-section">

          {/* REPORTS */}

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

            <div className="reports-header">

              <h2 className="reports-title">
                My Reports
              </h2>

              <button
                className="close-reports"
                onClick={() => setShowReports(false)}
              >
                ✕
              </button>

            </div>

            {reports.length === 0 ? (

              <p>
                No reports uploaded yet.
              </p>

            ) : (

              <div className="reports-list">

                {reports.map((report) => (

                  <div
                    className="report-item"
                    key={report.id}
                  >

                    <div>

                      <div className="report-name">
                        📄 {report.file_name}
                      </div>

                      <div className="report-date">

                        {report.uploaded_at
                          ? new Date(
                              report.uploaded_at
                            ).toLocaleString()
                          : "Date unavailable"}

                      </div>

                    </div>

                    <div
                      className={`report-status ${
                        report.status === "Analyzed"
                          ? "analyzed"
                          : ""
                      }`}
                    >
                      {report.status}
                    </div>

                  </div>

                ))}

              </div>

            )}

          </section>
        )}

      </div>


      {/* ================= FOOTER ================= */}

      <footer className="footer">

        <p>
          MediAssist AI • AI-powered healthcare assistance
        </p>

        <p>
          For informational purposes only. Always consult
          a qualified healthcare professional for medical advice.
        </p>

      </footer>


      {/* ================= STYLES ================= */}

      <style jsx>{`

        .page {
          min-height: 100vh;
          background: #f5f8fc;
          color: #1f2937;
        }

        .header {
          background: white;
          border-bottom: 1px solid #e5e7eb;
          padding: 20px 6%;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .brand-icon {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          background: #e8f1ff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 25px;
        }

        .brand h1 {
          margin: 0;
          font-size: 24px;
          color: #174ea6;
        }

        .brand p {
          margin: 3px 0 0;
          color: #6b7280;
          font-size: 13px;
        }

        .logout-button {
          border: none;
          background: #fee2e2;
          color: #b91c1c;
          padding: 10px 18px;
          border-radius: 9px;
          cursor: pointer;
          font-weight: 600;
        }

        .logout-button:hover {
          background: #fecaca;
        }

        .container {
          width: min(1100px, 92%);
          margin: 0 auto;
          padding: 40px 0 60px;
        }

        .welcome-section {
          text-align: center;
          margin-bottom: 32px;
        }

        .welcome-section h2 {
          font-size: 32px;
          margin-bottom: 10px;
          color: #111827;
        }

        .welcome-section p {
          color: #6b7280;
          font-size: 16px;
        }

        .error-box {
          background: #fee2e2;
          color: #991b1b;
          border: 1px solid #fecaca;
          padding: 14px 18px;
          border-radius: 10px;
          margin-bottom: 20px;
        }

        .upload-card {
          background: white;
          border-radius: 18px;
          padding: 42px;
          text-align: center;
          border: 1px solid #e5e7eb;
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.05);
          margin-bottom: 35px;
        }

        .upload-icon {
          font-size: 45px;
          margin-bottom: 12px;
        }

        .upload-card h2 {
          margin: 8px 0;
          font-size: 24px;
        }

        .upload-card p {
          color: #6b7280;
          margin-bottom: 25px;
        }

        .file-label {
          display: inline-block;
          background: #edf4ff;
          color: #1757b8;
          border: 1px dashed #5791e8;
          padding: 14px 24px;
          border-radius: 10px;
          cursor: pointer;
          font-weight: 600;
        }

        .file-label input {
          display: none;
        }

        .selected-file {
          margin: 18px auto;
          padding: 12px;
          background: #f3f4f6;
          border-radius: 8px;
          max-width: 500px;
          word-break: break-word;
        }

        .primary-button,
        .secondary-button,
        .assistant-button {
          border: none;
          padding: 12px 22px;
          border-radius: 9px;
          cursor: pointer;
          font-weight: 600;
          font-size: 14px;
        }

        .primary-button {
          display: block;
          margin: 20px auto 0;
          background: #1769e0;
          color: white;
        }

        .primary-button:hover {
          background: #1257bd;
        }

        .primary-button:disabled {
          background: #9ca3af;
          cursor: not-allowed;
        }

        .result-section {
          margin-bottom: 40px;
        }

        .result-header {
          background: white;
          padding: 24px;
          border-radius: 16px 16px 0 0;
          border: 1px solid #e5e7eb;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .result-header h2 {
          margin: 0 0 5px;
        }

        .result-header p {
          margin: 0;
          color: #6b7280;
        }

        .analysis-badge {
          background: #dcfce7;
          color: #166534;
          padding: 8px 14px;
          border-radius: 20px;
          font-weight: 600;
        }

        .summary-card,
        .parameters-card {
          background: white;
          padding: 25px;
          border: 1px solid #e5e7eb;
          border-top: none;
        }

        .summary-card h3,
        .parameters-card h3 {
          margin-top: 0;
        }

        .summary-status {
          display: flex;
          gap: 8px;
          margin-bottom: 12px;
        }

        .summary-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          margin-top: 22px;
        }

        .summary-stats div {
          background: #f8fafc;
          border-radius: 10px;
          padding: 15px;
          text-align: center;
        }

        .summary-stats strong,
        .summary-stats span {
          display: block;
        }

        .summary-stats strong {
          font-size: 24px;
          color: #1757b8;
        }

        .summary-stats span {
          color: #6b7280;
          font-size: 13px;
          margin-top: 4px;
        }

        .parameters-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 15px;
        }

        .parameter-card {
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 18px;
          background: #fafcff;
        }

        .parameter-name {
          font-weight: 700;
          margin-bottom: 10px;
        }

        .parameter-value {
          font-size: 24px;
          font-weight: 700;
          color: #111827;
        }

        .parameter-value span {
          font-size: 13px;
          color: #6b7280;
          font-weight: 500;
        }

        .parameter-reference {
          font-size: 12px;
          color: #6b7280;
          margin: 8px 0;
        }

        .status {
          display: inline-block;
          padding: 5px 10px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 700;
        }

        .status.normal {
          background: #dcfce7;
          color: #166534;
        }

        .status.high {
          background: #fee2e2;
          color: #b91c1c;
        }

        .status.low {
          background: #fef3c7;
          color: #92400e;
        }

        .cards-section {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 25px;
          margin-top: 30px;
        }

        .card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 16px;
          padding: 30px;
          text-align: center;
          box-shadow: 0 5px 20px rgba(0, 0, 0, 0.04);
        }

        .card-icon {
          font-size: 38px;
          margin-bottom: 12px;
        }

        .card-title {
          margin: 5px 0 10px;
        }

        .card-description {
          color: #6b7280;
          line-height: 1.6;
          margin-bottom: 22px;
        }

        .secondary-button {
          background: #eef2ff;
          color: #3730a3;
        }

        .secondary-button:hover {
          background: #e0e7ff;
        }

        .assistant-button {
          background: #1769e0;
          color: white;
        }

        .assistant-button:hover {
          background: #1257bd;
        }

        .reports-section {
          background: white;
          margin-top: 30px;
          border-radius: 16px;
          padding: 25px;
          border: 1px solid #e5e7eb;
        }

        .reports-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .reports-title {
          margin: 0;
        }

        .close-reports {
          border: none;
          background: #f3f4f6;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          cursor: pointer;
        }

        .report-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          margin-bottom: 10px;
        }

        .report-name {
          font-weight: 600;
        }

        .report-date {
          color: #6b7280;
          font-size: 12px;
          margin-top: 5px;
        }

        .report-status {
          background: #fef3c7;
          color: #92400e;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 700;
        }

        .report-status.analyzed {
          background: #dcfce7;
          color: #166534;
        }

        .loading-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .footer {
          text-align: center;
          padding: 30px;
          color: #6b7280;
          font-size: 12px;
        }

        @media (max-width: 800px) {

          .parameters-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .cards-section {
            grid-template-columns: 1fr;
          }

          .summary-stats {
            grid-template-columns: repeat(2, 1fr);
          }

        }

        @media (max-width: 500px) {

          .header {
            padding: 15px;
          }

          .container {
            width: 94%;
          }

          .upload-card {
            padding: 25px 15px;
          }

          .parameters-grid {
            grid-template-columns: 1fr;
          }

          .result-header {
            flex-direction: column;
            gap: 15px;
            align-items: flex-start;
          }

        }

      `}</style>

    </main>
  );
}
