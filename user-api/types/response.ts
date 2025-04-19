import { ResponseStatus } from "@constants/status";
import { User } from "@models/user";

export type ErrorResponse =
  | { status: typeof ResponseStatus.NO_CHANGE }
  | { status: typeof ResponseStatus.UNIQUE_CONSTRAINT_FAILED; error: string }
  | { status: typeof ResponseStatus.ERROR; error: string };

export type CreateUserResponse =
  | { status: typeof ResponseStatus.CREATED; user: User }
  | ErrorResponse;

export type UpdateUserResponse =
  | { status: typeof ResponseStatus.UPDATED; user: User }
  | ErrorResponse;
