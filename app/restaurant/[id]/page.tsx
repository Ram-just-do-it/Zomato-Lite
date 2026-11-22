"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { Star } from "@/components/Star";

type Review = { id: number; rating: number; comment: string; createdAt: string };
type RestaurantPage = {
  name: string;
  cuisine: string;
  area: string;
  averageRating: number | null;
  totalReviews: number;
  latestReview: Review | null;
  reviews: Review[];
};

// Turns a timestamp into "20 Nov, 3:58pm". Formatting for display only — no maths.
function formatDate(iso: string) {
  const d = new Date(iso);
  const date = d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  const time = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }).replace(" ", "").toLowerCase();
  return `${date}, ${time}`;
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex gap-0.5" aria-label={`${rating} of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => <Star key={n} filled={n <= rating} size={14} />)}
    </span>
  );
}

// Screen 2 — the restaurant page.
// It asks GET /api/restaurants/[id] for everything and prints it. No adding, dividing or sorting here.
export default function RestaurantPageScreen({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [data, setData] = useState<RestaurantPage | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/restaurants/${id}`).then(async (res) => {
      if (res.status === 404) return setNotFound(true);
      setData(await res.json());
    });
  }, [id]);

  if (notFound) {
    return <main className="mx-auto max-w-[560px] px-6 py-14 text-muted">Restaurant not found.</main>;
  }
  if (!data) {
    return <main className="mx-auto max-w-[560px] px-6 py-14 text-muted">Loading…</main>;
  }

  return (
    <main className="mx-auto max-w-[560px] px-6 py-14">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">{data.name}</h1>
        <p className="mt-1 text-sm text-muted">{data.cuisine} · {data.area}</p>
      </header>

      {data.latestReview === null ? (
        <section className="mt-12 rounded-xl border border-dashed border-line px-6 py-10 text-center">
          <p className="font-medium">No reviews yet</p>
          <p className="mt-1 text-sm text-muted">Been here? Be the first to say how it was.</p>
          <Link href={`/review/${id}`}
            className="mt-6 inline-block rounded-lg bg-ink px-5 py-2.5 text-sm font-medium text-paper">
            Write the first review
          </Link>
        </section>
      ) : (
        <>
          <section className="mt-10 flex items-baseline gap-3">
            {/* The average, printed exactly as the backend sent it. */}
            <span className="text-7xl font-semibold tracking-tight">{data.averageRating}</span>
            <span className="text-sm text-muted">
              out of 5 · {data.totalReviews} {data.totalReviews === 1 ? "review" : "reviews"}
            </span>
          </section>

          <section className="mt-10">
            <p className="text-xs font-medium uppercase tracking-wider text-accent">Latest review</p>
            <article className="mt-3 rounded-xl border-l-2 border-accent bg-accent-soft px-5 py-4">
              <Stars rating={data.latestReview.rating} />
              <p className="mt-2 text-lg leading-snug">{data.latestReview.comment}</p>
              <p className="mt-2 text-xs text-muted">{formatDate(data.latestReview.createdAt)}</p>
            </article>
          </section>

          {data.reviews.length > 0 && (
            <section className="mt-10">
              <p className="text-xs font-medium uppercase tracking-wider text-muted">Earlier reviews</p>
              <ul className="mt-2 divide-y divide-line">
                {data.reviews.map((r) => (
                  <li key={r.id} className="py-4">
                    <Stars rating={r.rating} />
                    <p className="mt-1.5">{r.comment}</p>
                    <p className="mt-1 text-xs text-muted">{formatDate(r.createdAt)}</p>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <Link href={`/review/${id}`}
            className="mt-10 block rounded-lg border border-ink px-4 py-3 text-center text-sm font-medium">
            Write a review
          </Link>
        </>
      )}
    </main>
  );
}
