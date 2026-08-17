"use client";

import { useState } from "react";
import { InfoIcon, CloseIcon, BookIcon, ClockIcon } from "@/components/icons";
import { GUIDE_SECTIONS } from "@/lib/guide";
import { CHANGELOG } from "@/lib/changelog";

export function InfoButton() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"guide" | "changelog">("guide");

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Info and changelog"
        className="flex h-7 w-7 items-center justify-center rounded-full text-muted transition hover:text-foreground"
      >
        <InfoIcon size={18} />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="tile flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden p-0"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border p-4">
              <div className="flex gap-1 rounded-full bg-surface-raised p-1">
                <button
                  onClick={() => setTab("guide")}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition ${
                    tab === "guide" ? "bg-navy text-white" : "text-muted hover:text-foreground"
                  }`}
                >
                  <BookIcon size={14} />
                  Guide
                </button>
                <button
                  onClick={() => setTab("changelog")}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition ${
                    tab === "changelog" ? "bg-navy text-white" : "text-muted hover:text-foreground"
                  }`}
                >
                  <ClockIcon size={14} />
                  What&apos;s new
                </button>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="flex h-7 w-7 flex-none items-center justify-center rounded-full text-muted transition hover:text-foreground"
              >
                <CloseIcon size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              {tab === "guide" ? (
                <div className="flex flex-col gap-5">
                  {GUIDE_SECTIONS.map((section) => (
                    <div key={section.title}>
                      <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-navy-light">
                        {section.title}
                      </h3>
                      <div className="flex flex-col gap-3">
                        {section.items.map((item) => (
                          <div key={item.name}>
                            <p className="text-sm font-medium">{item.name}</p>
                            <p className="text-sm text-muted">{item.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {CHANGELOG.map((entry, index) => (
                    <div key={index} className="flex gap-3">
                      <div className="flex flex-none flex-col items-center pt-1">
                        <span className="h-2 w-2 flex-none rounded-full bg-navy-light" />
                        {index < CHANGELOG.length - 1 && (
                          <span className="mt-1 w-px flex-1 bg-border" />
                        )}
                      </div>
                      <div className="pb-1">
                        <p className="text-xs text-muted">
                          {new Date(entry.date).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                        <p className="text-sm font-medium">{entry.title}</p>
                        <p className="text-sm text-muted">{entry.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
