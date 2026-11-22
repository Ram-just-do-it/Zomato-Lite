import { sql } from "@/lib/db";

// GET /api/restaurants/[id] — everything the restaurant page needs, already worked out.
// The response is shaped like the screen: name, big rating, latest review, then the list.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: rawId } = await params;
  const id = Number(rawId);
  if (!Number.isInteger(id)) {
    return Response.json({ error: "Restaurant not found." }, { status: 404 });
  }

  const restaurants = await sql`
    SELECT name, cuisine, area FROM restaurants WHERE id = ${id}
  `;
  if (restaurants.length === 0) {
    return Response.json({ error: "Restaurant not found." }, { status: 404 });
  }

  // The answers, computed fresh from the facts every time someone asks.
  const [stats] = await sql`
    SELECT
      ROUND(AVG(rating)::numeric, 1)::float8 AS "averageRating",
      COUNT(*)::int                          AS "totalReviews"
    FROM reviews
    WHERE restaurant_id = ${id}
  `;

  // Every review, newest first. The database does the sorting, not the screen.
  const allReviews = await sql`
    SELECT id, rating, comment, created_at AS "createdAt"
    FROM reviews
    WHERE restaurant_id = ${id}
    ORDER BY created_at DESC, id DESC
  `;

  const [latestReview = null, ...olderReviews] = allReviews;

  return Response.json({
    name: restaurants[0].name,
    cuisine: restaurants[0].cuisine,
    area: restaurants[0].area,
    averageRating: stats.averageRating, // AVG(rating), rounded in SQL. null when there are no reviews.
    totalReviews: stats.totalReviews,   // COUNT(*). 0 when there are no reviews.
    latestReview,                       // newest by created_at, or null.
    reviews: olderReviews,              // everything except the latest, newest first.
  });
}
