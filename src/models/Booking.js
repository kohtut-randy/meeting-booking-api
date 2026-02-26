const db = require("../config/database");

class Booking {
  constructor(id, user_id, startTime, endTime, createdAt) {
    this.id = id;
    this.user_id = user_id;
    this.startTime = startTime;
    this.endTime = endTime;
    this.createdAt = createdAt;
  }

  static formatToTimezoneOffset(value, offsetMinutes = 7 * 60) {
    if (!value) return null;

    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    const shiftedDate = new Date(date.getTime() + offsetMinutes * 60 * 1000);
    const isoWithoutZ = shiftedDate.toISOString().replace("Z", "");

    const sign = offsetMinutes >= 0 ? "+" : "-";
    const absoluteOffset = Math.abs(offsetMinutes);
    const hours = String(Math.floor(absoluteOffset / 60)).padStart(2, "0");
    const minutes = String(absoluteOffset % 60).padStart(2, "0");

    return `${isoWithoutZ}${sign}${hours}:${minutes}`;
  }

  toJSON() {
    return {
      id: this.id,
      user_id: this.user_id,
      startTime: Booking.formatToTimezoneOffset(this.startTime),
      endTime: Booking.formatToTimezoneOffset(this.endTime),
      createdAt: Booking.formatToTimezoneOffset(this.createdAt),
    };
  }

  static async create(bookingData) {
    const { id, user_id, startTime, endTime, createdAt } = bookingData;

    const query = `
      INSERT INTO bookings (id, user_id, start_time, end_time, created_at)
      SELECT
        COALESCE(
          $1,
          CASE
            WHEN pg_get_serial_sequence('bookings', 'id') IS NOT NULL
              THEN nextval(pg_get_serial_sequence('bookings', 'id'))
            ELSE (SELECT COALESCE(MAX(id), 0) + 1 FROM bookings)
          END
        ),
        $2,
        $3,
        $4,
        COALESCE($5, NOW())
      WHERE NOT EXISTS (
        SELECT 1
        FROM bookings
        WHERE start_time < $4
          AND end_time > $3
      )
      RETURNING id, user_id as "user_id", start_time as "startTime", 
                end_time as "endTime", created_at as "createdAt"
    `;

    const result = await db.query(query, [
      id ?? null,
      user_id,
      startTime,
      endTime,
      createdAt ?? null,
    ]);
    if (result.rows.length === 0) {
      return null;
    }

    const booking = result.rows[0];
    return new Booking(
      booking.id,
      booking.user_id,
      booking.startTime,
      booking.endTime,
      booking.createdAt,
    );
  }

  static async findAll() {
    const query = `
      SELECT id, user_id as "user_id", start_time as "startTime", 
             end_time as "endTime", created_at as "createdAt" 
      FROM bookings 
      ORDER BY start_time DESC
    `;

    const result = await db.query(query);
    return result.rows.map(
      (row) =>
        new Booking(
          row.id,
          row.user_id,
          row.startTime,
          row.endTime,
          row.createdAt,
        ),
    );
  }

  static async findById(id) {
    const query = `
      SELECT id, user_id as "user_id", start_time as "startTime", 
             end_time as "endTime", created_at as "createdAt" 
      FROM bookings 
      WHERE id = $1
    `;

    const result = await db.query(query, [id]);

    if (result.rows.length === 0) {
      return null;
    }

    const booking = result.rows[0];
    return new Booking(
      booking.id,
      booking.user_id,
      booking.startTime,
      booking.endTime,
      booking.createdAt,
    );
  }

  static async findByUserId(user_id) {
    const query = `
      SELECT id, user_id as "user_id", start_time as "startTime", 
             end_time as "endTime", created_at as "createdAt" 
      FROM bookings 
      WHERE user_id = $1 
      ORDER BY start_time DESC
    `;

    const result = await db.query(query, [user_id]);
    return result.rows.map(
      (row) =>
        new Booking(
          row.id,
          row.user_id,
          row.startTime,
          row.endTime,
          row.createdAt,
        ),
    );
  }

  static async deleteById(id) {
    const query = "DELETE FROM bookings WHERE id = $1 RETURNING id";
    const result = await db.query(query, [id]);
    return result.rows.length > 0;
  }

  static async deleteByUserId(user_id) {
    const query = "DELETE FROM bookings WHERE user_id = $1 RETURNING id";
    const result = await db.query(query, [user_id]);
    return result.rows.length;
  }

  static async checkOverlap(startTime, endTime, excludeBookingId = null) {
    let query = `
      SELECT EXISTS(
        SELECT 1 FROM bookings 
        WHERE 
          start_time < $2
          AND end_time > $1
    `;

    const params = [startTime, endTime];

    if (excludeBookingId) {
      query += ` AND id != $3`;
      params.push(excludeBookingId);
    }

    query += `) as overlap`;

    const result = await db.query(query, params);
    return result.rows[0].overlap;
  }

  static validateBookingTimes(startTime, endTime) {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const now = new Date();

    if (start >= end) {
      return { valid: false, error: "startTime must be before endTime" };
    }

    if (start < now) {
      return { valid: false, error: "Cannot book meetings in the past" };
    }

    return { valid: true };
  }

  static async getBookingsWithUserDetails() {
    const query = `
      SELECT 
        b.id, b.user_id as "user_id", b.start_time as "startTime", 
        b.end_time as "endTime", b.created_at as "createdAt",
        u.name as "userName", u.role as "userRole"
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      ORDER BY b.start_time DESC
    `;

    const result = await db.query(query);
    return result.rows;
  }
}

module.exports = Booking;
