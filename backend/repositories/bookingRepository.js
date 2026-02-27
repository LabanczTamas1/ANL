const { getPool } = require("../config/postgresql");

/**
 * Database operations for bookings
 */
class BookingRepository {
  /**
   * Create bookings table if it doesn't exist
   */
  async createTable() {
    const pool = getPool();
    await pool.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id UUID PRIMARY KEY,
        full_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        company VARCHAR(255) NOT NULL,
        referral_source VARCHAR(100) NOT NULL,
        referral_source_other VARCHAR(255),
        date DATE NOT NULL,
        time INTEGER NOT NULL,
        timezone VARCHAR(100) DEFAULT 'America/New_York',
        meet_link TEXT,
        status VARCHAR(50) DEFAULT 'confirmed',
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_bookings_email ON bookings(email);
      CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(date);
      CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
    `);
  }

  /**
   * Insert a new booking
   */
  async insert(booking) {
    const pool = getPool();
    const result = await pool.query(
      `INSERT INTO bookings 
       (id, full_name, email, company, referral_source, referral_source_other, 
        date, time, timezone, meet_link, status, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [
        booking.id,
        booking.fullName,
        booking.email,
        booking.company,
        booking.referralSource,
        booking.referralSourceOther || null,
        booking.date,
        booking.time,
        booking.timezone,
        booking.meetLink || null,
        booking.status,
        booking.notes || null,
      ]
    );
    return result.rows[0];
  }

  /**
   * Get booking by ID
   */
  async findById(id) {
    const pool = getPool();
    const result = await pool.query(
      "SELECT * FROM bookings WHERE id = $1",
      [id]
    );
    return result.rows[0];
  }

  /**
   * Get all bookings by email
   */
  async findByEmail(email) {
    const pool = getPool();
    const result = await pool.query(
      "SELECT * FROM bookings WHERE email = $1 ORDER BY created_at DESC",
      [email]
    );
    return result.rows;
  }

  /**
   * Get latest bookings by email
   */
  async findLatestByEmail(email, limit = 5) {
    const pool = getPool();
    const result = await pool.query(
      "SELECT * FROM bookings WHERE email = $1 ORDER BY created_at DESC LIMIT $2",
      [email, limit]
    );
    return result.rows;
  }

  /**
   * Get all bookings with pagination
   */
  async findAll(limit = 50, offset = 0) {
    const pool = getPool();
    const result = await pool.query(
      "SELECT * FROM bookings ORDER BY created_at DESC LIMIT $1 OFFSET $2",
      [limit, offset]
    );
    return result.rows;
  }

  /**
   * Delete a booking by ID
   */
  async delete(id) {
    const pool = getPool();
    const result = await pool.query(
      "DELETE FROM bookings WHERE id = $1 RETURNING *",
      [id]
    );
    return result.rows[0];
  }

  /**
   * Update booking status
   */
  async updateStatus(id, status) {
    const pool = getPool();
    const result = await pool.query(
      "UPDATE bookings SET status = $1 WHERE id = $2 RETURNING *",
      [status, id]
    );
    return result.rows[0];
  }
}

module.exports = new BookingRepository();
