import { sql } from "@/lib/db";

// POST /api/reviews — save one review.
// The backend checks everything itself. It never assumes the screen already did.
export async function POST(request: Request) {
  let body: { restaurantId?: unknown; rating?: unknown; comment?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "The request body must be valid JSON." }, { status: 400 });
  }

  const { restaurantId, rating, comment } = body;

  // Check 1: rating must be a whole number from 1 to 5.
  if (typeof rating !== "number" || !Number.isInteger(rating) || rating < 1 || rating > 5) {
    return Response.json({ error: "Rating must be a whole number from 1 to 5." }, { status: 400 });
  }

  // Check 2: comment must contain real text, not just spaces.
  if (typeof comment !== "string" || comment.trim() === "") {
    return Response.json({ error: "Comment cannot be empty." }, { status: 400 });
  }

  // Check 3: the restaurant must actually exist (this one asks the database).
  if (typeof restaurantId !== "number" || !Number.isInteger(restaurantId)) {
    return Response.json({ error: "That restaurant does not exist." }, { status: 400 });
  }
  const found = await sql`SELECT id FROM restaurants WHERE id = ${restaurantId}`;
  if (found.length === 0) {
    return Response.json({ error: "That restaurant does not exist." }, { status: 400 });
  }

  // All checks passed: write exactly one row. Nothing else in the database changes.
  const inserted = await sql`
    INSERT INTO reviews (restaurant_id, rating, comment)
    VALUES (${restaurantId}, ${rating}, ${comment.trim()})
    RETURNING id
  `;

  return Response.json({ success: true, reviewId: inserted[0].id }, { status: 201 });
}
