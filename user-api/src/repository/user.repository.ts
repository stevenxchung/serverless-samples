import { Database } from "better-sqlite3";
import { CreateUserResponse, UpdateUserResponse } from "types/response";
import { ResponseStatus } from "@constants/status";
import { User } from "@models/user";

const toUser = (row: any): User | undefined => {
  return row ? { ...row, isActive: Boolean(row.isActive) } : undefined;
};

export class UserRepository {
  constructor(private db: Database) {}

  getUsers = (limit: Number): User[] => {
    const rows = this.db
      .prepare(`SELECT * FROM users LIMIT ${limit}`)
      .all() as User[];
    return rows.map(toUser).filter((user): user is User => user !== undefined);
  };

  getUserById = (id: string): User | undefined => {
    const row = this.db.prepare("SELECT * FROM users WHERE id = ?").get(id) as
      | User
      | undefined;
    return toUser(row);
  };

  createUser = (userData: Partial<User>): CreateUserResponse => {
    const now = new Date().toISOString();

    try {
      const stmt = this.db.prepare(`
            INSERT INTO users 
            (firstName, lastName, email, address, phone, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `);
      const result = stmt.run(
        userData.firstName,
        userData.lastName,
        userData.email,
        userData.address ?? null,
        userData.phone ?? null,
        now,
        now
      );

      const row = this.getUserById(String(result.lastInsertRowid));
      return { status: ResponseStatus.CREATED, user: toUser(row)! };
    } catch (err: any) {
      if (err.code.includes("CONSTRAINT_UNIQUE")) {
        return {
          status: ResponseStatus.UNIQUE_CONSTRAINT_FAILED,
          error: "Email and phone must be unique.",
        };
      }

      return {
        status: ResponseStatus.ERROR,
        error: "An unexpected error occurred.",
      };
    }
  };

  updateUser = (id: string, updates: Partial<User>): UpdateUserResponse => {
    const now = new Date().toISOString();
    const fields = [
      "firstName",
      "lastName",
      "email",
      "address",
      "phone",
      "isActive",
    ];
    const setClauses = [];
    const values: any[] = [];

    for (const field of fields) {
      if (updates[field as keyof User] !== undefined) {
        setClauses.push(`${field} = ?`);
        values.push(updates[field as keyof User]);
      }
    }

    if (setClauses.length === 0) return { status: ResponseStatus.NO_CHANGE };

    setClauses.push("updatedAt = ?");
    values.push(now);
    values.push(id);

    try {
      const stmt = this.db.prepare(
        `UPDATE users SET ${setClauses.join(", ")} WHERE id = ?`
      );
      const result = stmt.run(...values);

      if (result.changes === 0) return { status: ResponseStatus.NO_CHANGE };

      const updatedUser = this.getUserById(id)!;
      return { status: ResponseStatus.UPDATED, user: updatedUser };
    } catch (err: any) {
      if (err.code.includes("CONSTRAINT_UNIQUE")) {
        return {
          status: ResponseStatus.UNIQUE_CONSTRAINT_FAILED,
          error: "Email and phone must be unique.",
        };
      }

      return {
        status: ResponseStatus.ERROR,
        error: "An unexpected error occurred.",
      };
    }
  };

  deleteUser = (id: string): boolean => {
    const stmt = this.db.prepare("DELETE FROM users WHERE id = ?");
    const result = stmt.run(id);
    return result.changes > 0;
  };
}
