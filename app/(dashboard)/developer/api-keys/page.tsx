"use client";
import { useEffect, useState } from "react";

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
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-2">API Keys</h1>
      <p className="text-gray-500 mb-6 text-sm">
        Use these keys to access the DevBoard public API.
        <br />
        Pass as:{" "}
        <code className="bg-gray-100 px-1 rounded">
          Authorization: Bearer &lt;key&gt;
        </code>
      </p>

      {newKey && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <p className="text-sm font-medium text-green-800 mb-1">
            Key generated — copy it now, it won't be shown again
          </p>
          <code className="text-xs break-all text-green-900">{newKey}</code>
        </div>
      )}

      <div className="flex gap-2 mb-8">
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Key label (e.g. My App)"
          className="flex-1 border rounded px-3 py-2"
        />
        <button
          onClick={generate}
          className="bg-black text-white px-4 py-2 rounded"
        >
          Generate key
        </button>
      </div>

      <div className="space-y-3">
        {keys.map((k) => (
          <div
            key={k.id}
            className="border rounded-lg p-4 flex items-center justify-between"
          >
            <div>
              <p className="font-medium">{k.label || "Unnamed key"}</p>
              <p className="text-xs text-gray-400 font-mono">
                {k.key.slice(0, 16)}...
              </p>
              <p className="text-xs text-gray-400">
                Last used:{" "}
                {k.lastUsed
                  ? new Date(k.lastUsed).toLocaleDateString()
                  : "never"}
              </p>
            </div>
            <button
              onClick={() => deleteKey(k.id)}
              className="text-red-500 text-sm hover:underline"
            >
              Revoke
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
