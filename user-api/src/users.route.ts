import express from "express";
import { UserService } from "src/user.service";

const router = express.Router();
const userService = new UserService();

router.get("/", (req, res) => {
  const limit = Number(req.query.limit as string);
  const users = userService.getUsers(limit);
  return res.json(users);
});

export default router;
