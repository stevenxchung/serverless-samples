import express from "express";
import { CreateUserResponse, UpdateUserResponse } from "types/response";
import { ResponseStatus } from "src/status";
import { UserService } from "src/user.service";

const router = express.Router();
const userService = new UserService();

const userResOutcomes = (
  res: express.Response,
  userRes: CreateUserResponse | UpdateUserResponse
): express.Response => {
  switch (userRes.status) {
    case ResponseStatus.CREATED:
      return res.status(201).json(userRes.user);

    case ResponseStatus.UPDATED:
      return res.status(200).json(userRes.user);

    case ResponseStatus.NO_CHANGE:
      return res.status(200).json({ message: "No changes were made." });

    case ResponseStatus.UNIQUE_CONSTRAINT_FAILED:
      return res.status(400).json({ error: userRes.error });

    default:
      return res.status(500).json({ error: userRes.error });
  }
};

router.get("/users", (req, res) => {
  const limit = Number(req.query.limit as string);
  const users = userService.getUsers(limit);
  return res.json(users);
});

router.get("/:id", (req, res) => {
  const user = userService.getUserById(req.params.id);
  if (!user) return res.status(404).json({ error: "User not found" });
  return res.json(user);
});

router.post("/", (req, res) => {
  const user = userService.createUser(req.body);
  return userResOutcomes(res, user);
});

router.patch("/:id", (req, res) => {
  const user = userService.updateUser(req.params.id, req.body);
  return userResOutcomes(res, user);
});

router.patch("/:id/activate", (req, res) => {
  const user = userService.activateUser(req.params.id);
  return userResOutcomes(res, user);
});

router.delete("/:id", (req, res) => {
  const deleted = userService.deleteUser(req.params.id);
  if (!deleted) return res.status(404).json({ error: "User not found" });
  return res.status(204).send();
});

export default router;
