const db = require("../config/database");

class BookingService {
  static async getBookingsGroupedByUser() {
    const query = `
      SELECT 
        u.id as user_id,
        u.name as user_name,
        u.role as user_role,
        json_agg(
          json_build_object(
            'id', b.id,
            'startTime', b.start_time,
            'endTime', b.end_time,
            'createdAt', b.created_at
          ) ORDER BY b.start_time DESC
        ) as bookings
      FROM users u
      LEFT JOIN bookings b ON u.id = b.user_id
      GROUP BY u.id, u.name, u.role
      ORDER BY u.name
    `;

    const result = await db.query(query);

    // Transform to match expected format
    const grouped = {};
    result.rows.forEach((row) => {
      grouped[row.user_id] = {
        user: {
          id: row.user_id,
          name: row.user_name,
          role: row.user_role,
        },
        bookings: row.bookings.filter((b) => b.id !== null), // Remove null bookings from LEFT JOIN
      };
    });

    return grouped;
  }

  static async getUsageSummary() {
    const query = `
      SELECT 
        u.id as user_id,
        u.name as user_name,
        u.role as user_role,
        COUNT(b.id) as total_bookings,
        COALESCE(SUM(EXTRACT(EPOCH FROM (b.end_time - b.start_time)) / 3600), 0) as total_hours
      FROM users u
      LEFT JOIN bookings b ON u.id = b.user_id
      GROUP BY u.id, u.name, u.role
      ORDER BY total_bookings DESC
    `;

    const result = await db.query(query);

    const summary = {};
    result.rows.forEach((row) => {
      summary[row.user_id] = {
        user: {
          id: row.user_id,
          name: row.user_name,
          role: row.user_role,
        },
        stats: {
          totalBookings: parseInt(row.total_bookings),
          totalHours: parseFloat(row.total_hours),
        },
      };
    });

    return summary;
  }
}

module.exports = BookingService;
