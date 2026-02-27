const { getPool } = require("../config/postgresql");

const REFERRAL_SOURCES = [
  "Google Search",
  "LinkedIn",
  "Facebook",
  "Instagram",
  "Referral / Word of mouth",
  "Conference / Event",
  "Blog / Article",
  "Other",
];

/**
 * Create the bookings table if it doesn't exist.
 */
async function createBookingsTable() {
  const pool = getPool();
  await pool.query(`
    CREATE TABLE IF NOT EXISTS bookings (
      id UUID PRIMARY KEY,
      full_name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      company VARCHAR(255) NOT NULL,
      referral_source VARCHAR(255) NOT NULL,
      referral_source_other VARCHAR(500),
      date DATE NOT NULL,
      time INTEGER NOT NULL,
      timezone VARCHAR(100) NOT NULL DEFAULT 'America/New_York',
      meet_link TEXT,
      status VARCHAR(50) NOT NULL DEFAULT 'confirmed',
      notes TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  console.log("bookings table ensured.");
}

/**
 * Insert a new booking into PostgreSQL.
 */
async function insertBooking(booking) {
  const pool = getPool();
  const {
    id,
    fullName,
    email,
    company,
    referralSource,
    referralSourceOther,
    date,
    time,
    timezone,
    meetLink,
    status,
    notes,
  } = booking;

  const result = await pool.query(
    `INSERT INTO bookings
       (id, full_name, email, company, referral_source, referral_source_other,
        date, time, timezone, meet_link, status, notes)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
     RETURNING *`,
    [
      id,
      fullName,
      email,
      company,
      referralSource,
      referralSourceOther || null,
      date,
      time,
      timezone || "America/New_York",
      meetLink || null,
      status || "confirmed",
      notes || null,
    ]
  );
  return result.rows[0];
}

/**
 * Get a booking by its UUID.
 */
async function getBookingById(id) {
  const pool = getPool();
  const result = await pool.query("SELECT * FROM bookings WHERE id = $1", [id]);
  return result.rows[0] || null;
}

/**
 * Get all bookings for a given email, ordered by creation date descending.
 */
async function getBookingsByEmail(email) {
  const pool = getPool();
  const result = await pool.query(
    "SELECT * FROM bookings WHERE email = $1 ORDER BY created_at DESC",
    [email]
  );
  return result.rows;
}

/**
 * Get the latest N bookings for a given email.
 */
async function getLatestBookingsByEmail(email, limit = 5) {
  const pool = getPool();
  const result = await pool.query(
    "SELECT * FROM bookings WHERE email = $1 ORDER BY created_at DESC LIMIT $2",
    [email, limit]
  );
  return result.rows;
}

/**
 * Delete a booking by its UUID.
 */
async function deleteBooking(id) {
  const pool = getPool();
  const result = await pool.query(
    "DELETE FROM bookings WHERE id = $1 RETURNING *",
    [id]
  );
  return result.rows[0] || null;
}

/**
 * Get all bookings (admin), paginated.
 */
async function getAllBookings(limit = 50, offset = 0) {
  const pool = getPool();
  const result = await pool.query(
    "SELECT * FROM bookings ORDER BY created_at DESC LIMIT $1 OFFSET $2",
    [limit, offset]
  );
  return result.rows;
}

module.exports = {
  REFERRAL_SOURCES,
  createBookingsTable,
  insertBooking,
  getBookingById,
  getBookingsByEmail,
  getLatestBookingsByEmail,
  deleteBooking,
  getAllBookings,
};
