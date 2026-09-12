"use client";

import { useId, useRef } from "react";
import Image from "next/image";

import type { AdminArtworkOption } from "@/features/topics/admin-topic-types";
import { uploadedArtworkSrc } from "@/features/topics/topic-presentation";

import { adminCopy } from "./admin-copy";
import { artworkOptionLabel } from "./admin-topic-editor-state";

type AdminArtworkPickerProps = {
  assets: AdminArtworkOption[];
  selectedId: string;
  selectedSrc?: string;
  alt: string;
  pending: boolean;
  onChange: (assetId: string, src: string | undefined) => void;
  onUploaded: (asset: AdminArtworkOption) => void;
  onMessage: (message: string) => void;
  runPending: (work: () => Promise<void>) => Promise<void>;
};

export function AdminArtworkPicker({
  assets,
  selectedId,
  selectedSrc,
  alt,
  pending,
  onChange,
  onUploaded,
  onMessage,
  runPending,
}: AdminArtworkPickerProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const selected = assets.find((asset) => asset.id === selectedId);
  const previewSrc = selectedSrc ?? selected?.artworkSrc;
  const previewAlt = alt.trim() || adminCopy.artworkPreview;

  function openPreview() {
    dialogRef.current?.showModal();
  }

  function closePreview() {
    dialogRef.current?.close();
  }

  return (
    <div className="flex flex-col gap-3 text-sm">
      <span className="font-medium">{adminCopy.artwork}</span>
      <p className="text-muted text-xs">{adminCopy.artworkHint}</p>

      {previewSrc ? (
        <button
          type="button"
          onClick={openPreview}
          className="group relative w-fit cursor-pointer overflow-hidden rounded-xl ring-1 ring-[var(--border)]"
          aria-haspopup="dialog"
        >
          <Image
            src={previewSrc}
            alt={previewAlt}
            width={144}
            height={96}
            className="h-24 w-36 object-cover"
          />
          <span className="absolute inset-x-0 bottom-0 bg-black/45 px-2 py-1 text-[0.65rem] font-medium text-white">
            {adminCopy.artworkOpenPreview}
          </span>
        </button>
      ) : (
        <div className="text-muted flex h-24 w-36 items-center justify-center rounded-xl bg-[var(--surface-muted)] text-center text-[0.7rem] leading-snug">
          {adminCopy.artworkNone}
        </div>
      )}

      <label className="flex flex-col gap-1">
        <span className="text-muted text-xs">{adminCopy.existingArtwork}</span>
        <select
          value={selectedId}
          onChange={(event) => {
            const nextId = event.target.value;
            const next = assets.find((asset) => asset.id === nextId);
            onChange(nextId, next?.artworkSrc);
          }}
          className="rounded-xl border border-[var(--border)] px-3 py-2"
        >
          <option value="">{adminCopy.artworkNone}</option>
          {assets.map((asset) => (
            <option key={asset.id} value={asset.id}>
              {artworkOptionLabel(asset)}
            </option>
          ))}
        </select>
      </label>

      <div className="flex flex-wrap items-center gap-2">
        <label className={`cursor-pointer rounded-full border border-[var(--border)] px-3 py-1.5 text-xs font-medium ${pending ? "pointer-events-none opacity-60" : ""}`}>
          {pending ? adminCopy.artworkUploading : adminCopy.uploadArtwork}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            disabled={pending}
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (!file) {
                return;
              }
              const form = new FormData();
              form.set("file", file);
              void runPending(async () => {
                let response: Response;
                try {
                  response = await fetch("/api/admin/artwork", { method: "POST", body: form });
                } catch {
                  onMessage(adminCopy.networkError);
                  return;
                } finally {
                  event.target.value = "";
                }

                const payload = (await response.json()) as { assetId?: string; error?: string };
                if (!response.ok || !payload.assetId) {
                  onMessage(payload.error ?? "Artwork could not be uploaded.");
                  return;
                }

                const src = uploadedArtworkSrc(payload.assetId);
                onUploaded({
                  id: payload.assetId,
                  storageKind: "uploaded",
                  storageKey: payload.assetId,
                  artworkSrc: src,
                });
                onChange(payload.assetId, src);
                onMessage(adminCopy.artworkUploaded);
              });
            }}
          />
        </label>
        {selectedId ? (
          <button
            type="button"
            className="text-muted cursor-pointer text-xs"
            onClick={() => onChange("", undefined)}
          >
            {adminCopy.clearArtwork}
          </button>
        ) : null}
      </div>

      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        className="fixed top-1/2 left-1/2 z-50 max-h-[90vh] w-[min(56rem,92vw)] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border-0 bg-[#0b0d12] p-0 text-white backdrop:bg-black/70"
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            closePreview();
          }
        }}
      >
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <h2 id={titleId} className="text-sm font-semibold">
            {adminCopy.artworkPreview}
          </h2>
          <button
            type="button"
            onClick={closePreview}
            className="inline-flex size-8 cursor-pointer items-center justify-center rounded-full text-white/80 hover:bg-white/10 hover:text-white"
            aria-label={adminCopy.closeArtworkPreview}
          >
            <ClosePreviewIcon />
          </button>
        </div>
        {previewSrc ? (
          <div className="px-4 pb-4">
            <Image
              src={previewSrc}
              alt={previewAlt}
              width={1536}
              height={1024}
              className="mx-auto max-h-[calc(90vh-4.5rem)] w-auto max-w-full object-contain"
            />
          </div>
        ) : null}
      </dialog>
    </div>
  );
}

function ClosePreviewIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" className="size-3.5">
      <path
        d="m4 4 8 8M12 4 4 12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
