"use client";

import { useEffect, useState } from "react";
import { PageShell } from "@/components/PageShell";
import { DeveloperNav } from "@/components/DeveloperNav";

type AlertSub = {
  id: string;
  keywords: string[];
  location: string | null;
  createdAt: string;
};

export default function JobAlertsPage() {
  const [alerts, setAlerts] = useState<AlertSub[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form states
  const [keywordsText, setKeywordsText] = useState("");
  const [locationText, setLocationText] = useState("");
  const [creating, setCreating] = useState(false);

  async function loadAlerts() {
    try {
      const res = await fetch("/api/user/alerts");
      if (!res.ok) throw new Error("Failed to load alerts");
      const data = await res.json();
      setAlerts(data);
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Could not fetch alert subscriptions.";
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    Promise.resolve().then(() => {
      loadAlerts();
    });
  }, []);

  async function handleCreateAlert(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    const keywordsArray = keywordsText
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean);

    if (keywordsArray.length === 0) {
      setError("Please enter at least one keyword (e.g. React)");
      return;
    }

    setCreating(true);

    try {
      const res = await fetch("/api/user/alerts", {
        method: "POST",
        body: JSON.stringify({
          keywords: keywordsArray,
          location: locationText,
        }),
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to create subscription");
      }

      setSuccess("Job alert subscription created!");
      setKeywordsText("");
      setLocationText("");
      await loadAlerts();
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Failed to create alert subscription.";
      setError(errMsg);
    } finally {
      setCreating(false);
    }
  }

  async function deleteAlert(id: string) {
    setError("");
    setSuccess("");
    try {
      const res = await fetch(`/api/user/alerts?id=${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete alert subscription");
      setSuccess("Job alert removed");
      await loadAlerts();
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Failed to delete alert subscription.";
      setError(errMsg);
    }
  }

  return (
    <PageShell active="dashboard" medium>
      <h1 className="heading-page">Job Alerts</h1>
      <p className="page-subtitle">
        Subscribe to email notifications matching your target keywords and location.
      </p>

      <DeveloperNav />

      {error && <p className="form-error" style={{ marginBottom: 16 }}>{error}</p>}
      {success && <p style={{ color: "green", fontSize: 14, marginBottom: 16 }}>{success}</p>}

      <section className="section" style={{ marginBottom: 40 }}>
        <h2 className="heading-section" style={{ marginBottom: 16 }}>Subscribe to new alert</h2>
        <form onSubmit={handleCreateAlert} className="card stack-16" style={{ padding: 24 }}>
          <div className="form-field">
            <label htmlFor="keywords" className="form-label">
              Keywords (comma-separated)
            </label>
            <input
              id="keywords"
              type="text"
              value={keywordsText}
              onChange={(e) => setKeywordsText(e.target.value)}
              placeholder="e.g. React, Next.js, Remote, Rust"
              className="input"
              required
            />
            <p className="text-xs text-[#666]" style={{ marginTop: 4 }}>
              Alert triggers when jobs match any of these keywords.
            </p>
          </div>

          <div className="form-field">
            <label htmlFor="location" className="form-label">
              Location / Region (optional)
            </label>
            <input
              id="location"
              type="text"
              value={locationText}
              onChange={(e) => setLocationText(e.target.value)}
              placeholder="e.g. Lagos, remote, Accra"
              className="input"
            />
          </div>

          <button
            type="submit"
            disabled={creating}
            className="btn btn-primary"
            style={{ marginTop: 8 }}
          >
            {creating ? "Subscribing..." : "Create alert subscription"}
          </button>
        </form>
      </section>

      <section className="section">
        <h2 className="heading-section" style={{ marginBottom: 16 }}>Active Subscriptions</h2>
        {loading ? (
          <p className="body-text">Loading alerts...</p>
        ) : alerts.length === 0 ? (
          <p className="body-text" style={{ fontSize: 16 }}>
            You have no active job alerts. Subscribe above to get notified of new jobs.
          </p>
        ) : (
          <div className="stack-12">
            {alerts.map((alert) => (
              <div key={alert.id} className="card row-between" style={{ padding: 20 }}>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    {alert.keywords.map((k) => (
                      <span
                        key={k}
                        className="pill"
                        style={{
                          fontSize: 11,
                          backgroundColor: "#f0f0f0",
                          border: "1px solid #ddd",
                          padding: "2px 8px",
                          borderRadius: 12,
                          color: "#333",
                        }}
                      >
                        {k}
                      </span>
                    ))}
                    {alert.location && (
                      <span
                        className="pill"
                        style={{
                          fontSize: 11,
                          backgroundColor: "#e8f0fe",
                          border: "1px solid #c2dbff",
                          padding: "2px 8px",
                          borderRadius: 12,
                          color: "#1a73e8",
                        }}
                      >
                        📍 {alert.location}
                      </span>
                    )}
                  </div>
                  <p className="meta" style={{ marginTop: 8 }}>
                    Subscribed on {new Date(alert.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => deleteAlert(alert.id)}
                  className="btn btn-secondary"
                  style={{ fontSize: 12, padding: "6px 12px", color: "#d9534f", border: "1px solid #ffcccc" }}
                >
                  Unsubscribe
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </PageShell>
  );
}
