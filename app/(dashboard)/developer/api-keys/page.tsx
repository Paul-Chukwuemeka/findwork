"use client";

import { useEffect, useState } from "react";
import { PageShell } from "@/components/PageShell";

type ApiKey = {
  id: string;
  label: string;
  key: string;
  lastUsed: string | null;
  createdAt: string;
};

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [label, setLabel] = useState("");
  const [newKey, setNewKey] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/user/api-keys");
    setKeys(await res.json());
  }

  useEffect(() => {
    load();
  }, []);

  async function generate() {
    const res = await fetch("/api/user/api-keys", {
      method: "POST",
      body: JSON.stringify({ label }),
      headers: { "Content-Type": "application/json" },
    });
    const key = await res.json();
    setNewKey(key.key);
    setLabel("");
    load();
  }

  async function deleteKey(id: string) {
    await fetch("/api/user/api-keys", {
      method: "DELETE",
      body: JSON.stringify({ id }),
      headers: { "Content-Type": "application/json" },
    });
    load();
  }

  return (
    <PageShell medium>
      <h1 className="heading-page">API keys</h1>
      <p className="page-subtitle">
        Use these keys to access the FindWork public API. Pass as:{" "}
        <code className="code">Authorization: Bearer &lt;key&gt;</code>
      </p>

      {newKey && (
        <div className="notice">
          <p className="notice__title">
            Key generated — copy it now, it won&apos;t be shown again
          </p>
          <code className="code-block">{newKey}</code>
        </div>
      )}

      <div className="form-row" style={{ marginBottom: 32 }}>
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Key label (e.g. My App)"
          className="input"
        />
        <button type="button" onClick={generate} className="btn btn-primary">
          Generate key
        </button>
      </div>

      <div className="stack-12">
        {keys.map((k) => (
          <div key={k.id} className="card row-between">
            <div>
              <p className="card-title">{k.label || "Unnamed key"}</p>
              <p className="meta">{k.key.slice(0, 16)}...</p>
              <p className="meta">
                Last used:{" "}
                {k.lastUsed
                  ? new Date(k.lastUsed).toLocaleDateString()
                  : "never"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => deleteKey(k.id)}
              className="btn btn-secondary"
            >
              Revoke
            </button>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
