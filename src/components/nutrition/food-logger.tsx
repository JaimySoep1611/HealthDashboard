"use client";

import { useEffect, useRef, useState } from "react";
import { CloseIcon } from "@/components/icons";

type AiFoodItem = {
  name: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
};

type FavoriteMeal = AiFoodItem & { id: string };

const MAX_UPLOAD_DIMENSION = 1024;
const UPLOAD_JPEG_QUALITY = 0.82;

function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not load image"));
    img.src = dataUrl;
  });
}

async function resizeImageForUpload(dataUrl: string): Promise<{ base64: string; mediaType: string }> {
  const img = await loadImage(dataUrl);
  const scale = Math.min(1, MAX_UPLOAD_DIMENSION / Math.max(img.width, img.height));
  const width = Math.round(img.width * scale);
  const height = Math.round(img.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");
  ctx.drawImage(img, 0, 0, width, height);

  const resizedDataUrl = canvas.toDataURL("image/jpeg", UPLOAD_JPEG_QUALITY);
  const [, base64] = resizedDataUrl.split(",");
  return { base64, mediaType: "image/jpeg" };
}

export function FoodLogger({
  onAdd,
  recentMeals,
}: {
  onAdd: (item: AiFoodItem, source: string) => void;
  recentMeals: AiFoodItem[];
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<AiFoodItem[]>([]);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [manualOpen, setManualOpen] = useState(false);

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
    const data = await response.json().catch(() => null);
    if (!response.ok) {
      setError(data?.error ?? "Couldn't analyze that description — try rephrasing.");
      return;
    }
    setItems(data?.items ?? []);
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
      setLoading(true);
      try {
        // Camera photos can be several MB straight off an iPhone — well over the
        // hosting platform's request size limit. Downscale + re-encode as JPEG
        // client-side so the upload reliably stays small regardless of source size.
        const { base64, mediaType } = await resizeImageForUpload(dataUrl);
        const response = await fetch("/api/nutrition/analyze-photo", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageBase64: base64, mediaType }),
        });
        const data = await response.json().catch(() => null);
        if (!response.ok) {
          setError(data?.error ?? "Couldn't recognize this photo — try a clearer shot.");
          return;
        }
        setItems(data?.items ?? []);
      } catch {
        setError("Couldn't process this photo — try again.");
      } finally {
        setLoading(false);
      }
    };
    reader.onerror = () => setError("Couldn't read this photo — try again.");
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
          className="min-w-0 flex-1 rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm outline-none focus:border-navy-light"
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

      <button
        type="button"
        onClick={() => setManualOpen(true)}
        className="self-start text-xs text-muted underline-offset-2 hover:text-foreground hover:underline"
      >
        Or log it manually
      </button>

      {manualOpen && (
        <ManualEntryModal
          recentMeals={recentMeals}
          onClose={() => setManualOpen(false)}
          onSave={(item) => {
            onAdd(item, "manual");
            setManualOpen(false);
          }}
        />
      )}

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
              onAdd={() => onAdd(item, photoPreview ? "ai-photo" : "ai-text")}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ManualEntryModal({
  recentMeals,
  onClose,
  onSave,
}: {
  recentMeals: AiFoodItem[];
  onClose: () => void;
  onSave: (item: AiFoodItem) => void;
}) {
  const [name, setName] = useState("");
  const [calories, setCalories] = useState("");
  const [proteinG, setProteinG] = useState("");
  const [carbsG, setCarbsG] = useState("");
  const [fatG, setFatG] = useState("");
  const [saveAsFavorite, setSaveAsFavorite] = useState(false);

  const [favorites, setFavorites] = useState<FavoriteMeal[]>([]);
  const [favoritesLoaded, setFavoritesLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/nutrition/favorites")
      .then((response) => response.json())
      .then((data) => setFavorites(data?.favorites ?? []))
      .finally(() => setFavoritesLoaded(true));
  }, []);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!name.trim()) return;
    const item = {
      name: name.trim(),
      calories: Number(calories) || 0,
      proteinG: Number(proteinG) || 0,
      carbsG: Number(carbsG) || 0,
      fatG: Number(fatG) || 0,
    };
    if (saveAsFavorite) {
      fetch("/api/nutrition/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      });
    }
    onSave(item);
  }

  function removeFavorite(id: string) {
    setFavorites((current) => current.filter((favorite) => favorite.id !== id));
    fetch(`/api/nutrition/favorites/${id}`, { method: "DELETE" });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div
        className="tile flex max-h-[85vh] w-full max-w-sm flex-col gap-4 overflow-y-auto p-5"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-medium">Log food manually</h3>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-7 w-7 flex-none items-center justify-center rounded-full text-muted transition hover:text-foreground"
          >
            <CloseIcon size={16} />
          </button>
        </div>

        {favoritesLoaded && favorites.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <p className="text-xs text-muted">Favorites (shared)</p>
            <div className="flex flex-col gap-1.5">
              {favorites.map((favorite) => (
                <QuickPickRow
                  key={favorite.id}
                  item={favorite}
                  onPick={() => onSave(favorite)}
                  onRemove={() => removeFavorite(favorite.id)}
                />
              ))}
            </div>
          </div>
        )}

        {recentMeals.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <p className="text-xs text-muted">Recent</p>
            <div className="flex flex-col gap-1.5">
              {recentMeals.map((meal) => (
                <QuickPickRow key={meal.name} item={meal} onPick={() => onSave(meal)} />
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3 border-t border-border pt-3">
          <label className="flex flex-col gap-1 text-xs text-muted">
            Name
            <input
              autoFocus
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. Double cappuccino"
              className="rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm text-foreground outline-none focus:border-navy-light"
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1 text-xs text-muted">
              Calories
              <input
                type="number"
                min={0}
                value={calories}
                onChange={(event) => setCalories(event.target.value)}
                placeholder="0"
                className="rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm text-foreground outline-none focus:border-navy-light"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs text-muted">
              Protein (g)
              <input
                type="number"
                min={0}
                value={proteinG}
                onChange={(event) => setProteinG(event.target.value)}
                placeholder="0"
                className="rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm text-foreground outline-none focus:border-navy-light"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs text-muted">
              Carbs (g)
              <input
                type="number"
                min={0}
                value={carbsG}
                onChange={(event) => setCarbsG(event.target.value)}
                placeholder="0"
                className="rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm text-foreground outline-none focus:border-navy-light"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs text-muted">
              Fat (g)
              <input
                type="number"
                min={0}
                value={fatG}
                onChange={(event) => setFatG(event.target.value)}
                placeholder="0"
                className="rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm text-foreground outline-none focus:border-navy-light"
              />
            </label>
          </div>

          <label className="flex items-center gap-2 text-xs text-muted">
            <input
              type="checkbox"
              checked={saveAsFavorite}
              onChange={(event) => setSaveAsFavorite(event.target.checked)}
              className="h-4 w-4 rounded border-border"
            />
            ★ Save as favorite (shared with the other profile)
          </label>

          <button
            type="submit"
            disabled={!name.trim()}
            className="rounded-lg bg-navy px-4 py-2 text-sm font-medium text-white transition hover:bg-navy-light disabled:opacity-50"
          >
            Save
          </button>
        </form>
      </div>
    </div>
  );
}

function QuickPickRow({
  item,
  onPick,
  onRemove,
}: {
  item: AiFoodItem;
  onPick: () => void;
  onRemove?: () => void;
}) {
  const [added, setAdded] = useState(false);

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => {
          onPick();
          setAdded(true);
        }}
        disabled={added}
        className="flex flex-1 items-center justify-between rounded-lg border border-border px-3 py-2 text-left text-sm transition hover:border-navy-light disabled:opacity-50"
      >
        <span className="truncate">{item.name}</span>
        <span className="flex-none pl-2 text-xs text-muted">
          {added ? "Added" : `${Math.round(item.calories)} kcal`}
        </span>
      </button>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${item.name} from favorites`}
          className="flex-none text-xs text-muted hover:text-red-400"
        >
          <CloseIcon size={14} />
        </button>
      )}
    </div>
  );
}

function AiItemRow({ item, onAdd }: { item: AiFoodItem; onAdd: () => void }) {
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
        disabled={added}
        className="rounded-lg border border-border px-2 py-1 text-xs hover:border-navy-light disabled:opacity-50"
      >
        {added ? "Added" : "Add"}
      </button>
    </div>
  );
}
