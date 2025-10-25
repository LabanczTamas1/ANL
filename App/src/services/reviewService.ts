const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3001/api";

export async function addReview(payload: { username: string; score: number; description: string }, token?: string) {
  const res = await fetch(`${API_BASE}/reviews`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });

  return res.json();
}

export async function getReviewsByScore(score: number) {
  const res = await fetch(`${API_BASE}/reviews?score=${score}`);
  return res.json();
}

export async function getAllReviews() {
  const res = await fetch(`${API_BASE}/reviews`);
  return res.json();
}
