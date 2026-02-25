const db = require("../config/database");

class User {
  constructor(id, name, role, createdAt) {
    this.id = id;
    this.name = name;
    this.role = role;
    this.createdAt = createdAt;
  }

  static async create(userData) {
    const { name, role } = userData;
    const query = `
      INSERT INTO users (id, name, role, "createdAt")
      VALUES (
        CASE
          WHEN pg_get_serial_sequence('users', 'id') IS NOT NULL
            THEN nextval(pg_get_serial_sequence('users', 'id'))
          ELSE (SELECT COALESCE(MAX(id), 0) + 1 FROM users)
        END,
        $1,
        $2,
        NOW()
      )
      RETURNING id, name, role, "createdAt"
    `;

    try {
      const result = await db.query(query, [name, role]);
      const user = result.rows[0];
      return new User(user.id, user.name, user.role, user.createdAt);
    } catch (error) {
      if (error.code === "23505") {
        // Unique violation
        throw new Error("User with this name already exists");
      }
      throw error;
    }
  }

  static async findAll() {
    const query =
      'SELECT id, name, role, "createdAt" FROM users ORDER BY "createdAt" DESC';
    const result = await db.query(query);
    return result.rows.map(
      (row) => new User(row.id, row.name, row.role, row.createdAt),
    );
  }

  static async findById(id) {
    const query = 'SELECT id, name, role, "createdAt" FROM users WHERE id = $1';
    const result = await db.query(query, [id]);

    if (result.rows.length === 0) {
      return null;
    }

    const user = result.rows[0];
    return new User(user.id, user.name, user.role, user.createdAt);
  }

  static async findByName(name) {
    const query = `
      SELECT id, name, role, "createdAt"
      FROM users
      WHERE LOWER(TRIM(name)) = LOWER(TRIM($1))
      LIMIT 1
    `;
    const result = await db.query(query, [name]);

    if (result.rows.length === 0) {
      return null;
    }

    const user = result.rows[0];
    return new User(user.id, user.name, user.role, user.createdAt);
  }

  static async deleteById(id) {
    const query = "DELETE FROM users WHERE id = $1 RETURNING id";
    const result = await db.query(query, [id]);
    return result.rows.length > 0;
  }

  static async updateRole(id, newRole) {
    const query = `
      UPDATE users 
      SET role = $1 
      WHERE id = $2 
      RETURNING id, name, role, "createdAt"
    `;

    const result = await db.query(query, [newRole, id]);

    if (result.rows.length === 0) {
      return null;
    }

    const user = result.rows[0];
    return new User(user.id, user.name, user.role, user.createdAt);
  }
}

module.exports = User;
