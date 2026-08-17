"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

type AiFoodItem = {
  name: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
};

export function FoodLogger() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<AiFoodItem[]>([]);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function logEntry(item: AiFoodItem, source: string) {
    setSaving(true);
    await fetch("/api/nutrition/entries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...item, source }),
    });
    setSaving(false);
    router.refresh();
  }

  async function analyzeDescription(event: React.FormEvent) {
    event.preventDefault();
    if (!description.trim()) return;
    setLoading(true);
    setError(null);
    setItems([]);
    setPhotoPreview(null);
    const response = await fetch("/api/nutrition/parse-text", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: description }),
    });
    setLoading(false);
    if (!response.ok) {
      setError("Couldn't analyze that description — try rephrasing.");
      return;
    }
    const data = await response.json();
    setItems(data.items ?? []);
  }

  function handlePhotoSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setError(null);
    setItems([]);
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      setPhotoPreview(dataUrl);
      const [header, base64] = dataUrl.split(",");
      const mediaType = header.match(/data:(.*);base64/)?.[1] ?? "image/jpeg";
      setLoading(true);
      const response = await fetch("/api/nutrition/analyze-photo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64, mediaType }),
      });
      setLoading(false);
      if (!response.ok) {
        setError("Couldn't recognize this photo — try a clearer shot.");
        return;
      }
      const data = await response.json();
      setItems(data.items ?? []);
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <div className="flex flex-col gap-3">
      <form onSubmit={analyzeDescription} className="flex items-center gap-2">
        <input
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="What did you eat? e.g. two fried eggs and a black coffee"
          className="flex-1 rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm outline-none focus:border-navy-light"
        />

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handlePhotoSelected}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          aria-label="Take a photo"
          className="flex h-10 w-10 flex-none items-center justify-center rounded-lg border border-border text-muted transition hover:border-navy-light hover:text-foreground"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 8h2.5l1.2-2h8.6l1.2 2H20a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z" />
            <circle cx="12" cy="13" r="3.5" />
          </svg>
        </button>

        <button
          type="submit"
          disabled={loading || !description.trim()}
          className="flex-none rounded-lg bg-navy px-4 py-2 text-sm font-medium text-white transition hover:bg-navy-light disabled:opacity-50"
        >
          {loading ? "…" : "Add"}
        </button>
      </form>

      {photoPreview && (
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photoPreview}
            alt="Selected food"
            className="h-16 w-16 rounded-lg border border-border object-cover"
          />
          {loading && <p className="text-xs text-muted">Analyzing photo…</p>}
        </div>
      )}

      {error && <p className="text-sm text-red-400">{error}</p>}

      {items.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-xs text-muted">Recognized — tap to add</p>
          {items.map((item, index) => (
            <AiItemRow
              key={index}
              item={item}
              saving={saving}
              onAdd={() => logEntry(item, photoPreview ? "ai-photo" : "ai-text")}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function AiItemRow({
  item,
  saving,
  onAdd,
}: {
  item: AiFoodItem;
  saving: boolean;
  onAdd: () => void;
}) {
  const [added, setAdded] = useState(false);

  return (
    <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm">
      <div>
        <span>{item.name}</span>{" "}
        <span className="text-muted">
          — {Math.round(item.calories)} kcal · P{Math.round(item.proteinG)} C
          {Math.round(item.carbsG)} F{Math.round(item.fatG)}
        </span>
      </div>
      <button
        onClick={() => {
          onAdd();
          setAdded(true);
        }}
        disabled={saving || added}
        className="rounded-lg border border-border px-2 py-1 text-xs hover:border-navy-light disabled:opacity-50"
      >
        {added ? "Added" : "Add"}
      </button>
    </div>
  );
}
