"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Star } from "@/components/Star";

// Screen 1 — write a review.
// It collects three things, hands them to the backend, and steps back.
export default function ReviewPage({ params }: { params: Promise<{ restaurantId: string }> }) {
  const { restaurantId } = use(params);
  const router = useRouter();

  const [restaurantName, setRestaurantName] = useState<string | null>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Ask the backend for the restaurant's name so you know what you are reviewing.
  useEffect(() => {
    fetch(`/api/restaurants/${restaurantId}`)
      .then((res) => res.json())
      .then((data) => setRestaurantName(data.name ?? null));
  }, [restaurantId]);

  // Frontend check (kindness): stop honest mistakes. The backend checks again (security).
  const canSubmit = rating > 0 && comment.trim() !== "" && !submitting;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ restaurantId: Number(restaurantId), rating, comment }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error); // show exactly what the backend said
      setSubmitting(false);
      return;
    }

    router.push(`/restaurant/${restaurantId}`);
  }

  return (
    <main className="mx-auto max-w-[560px] px-6 py-14">
      <p className="text-sm text-muted">Write a review for</p>
      <h1 className="mt-1 text-2xl font-semibold tracking-tight">{restaurantName ?? " "}</h1>

      <form onSubmit={handleSubmit} className="mt-10 space-y-8">
        <fieldset>
          <legend className="text-sm font-medium">Your rating</legend>
          <div className="mt-3 flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} type="button" onClick={() => setRating(n)}
                aria-label={`${n} star${n > 1 ? "s" : ""}`} aria-pressed={rating === n}
                className="rounded-md p-1 transition-colors hover:bg-accent-soft">
                <Star filled={n <= rating} size={32} />
              </button>
            ))}
          </div>
          <p className="mt-2 h-5 text-sm text-muted">{rating > 0 ? `${rating} of 5` : ""}</p>
        </fieldset>

        <label className="block">
          <span className="text-sm font-medium">Your review</span>
          <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={5}
            placeholder="What did you eat? How was it?"
            className="mt-3 block w-full resize-none rounded-lg border border-line bg-white px-4 py-3 text-base outline-none placeholder:text-muted/70 focus:border-ink" />
        </label>

        {error && (
          <p role="alert" className="rounded-lg border border-accent/30 bg-accent-soft px-4 py-3 text-sm text-accent">
            {error}
          </p>
        )}

        <button type="submit" disabled={!canSubmit}
          className="w-full rounded-lg bg-ink px-4 py-3 text-sm font-medium text-paper transition-opacity disabled:opacity-30">
          {submitting ? "Submitting…" : "Submit review"}
        </button>
      </form>
    </main>
  );
}
