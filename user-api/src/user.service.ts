import db from "src/config";
import { CreateUserResponse, UpdateUserResponse } from "types/response";
import { User } from "src/user";
import { UserRepository } from "src/user.repository";

export class UserService {
  private userRepo = new UserRepository(db);

  getUsers(limit = 10): User[] {
    return this.userRepo.getUsers(limit);
  }

  getUserById(id: string): User | null {
    return this.userRepo.getUserById(id) ?? null;
  }

  createUser(userData: Partial<User>): CreateUserResponse {
    if (!userData.firstName || !userData.lastName || !userData.email) {
      throw new Error("firstName, lastName, and email are required.");
    }
    return this.userRepo.createUser(userData);
  }

  updateUser(id: string, updates: Partial<User>): UpdateUserResponse {
    return this.userRepo.updateUser(id, updates);
  }

  activateUser(id: string): UpdateUserResponse {
    return this.userRepo.updateUser(id, {
      // Since SQLite only supports 0 or 1
      isActive: 1,
    });
  }

  deleteUser(id: string): boolean {
    return this.userRepo.deleteUser(id);
  }
}
