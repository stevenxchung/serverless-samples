import "dotenv/config";
import express from "express";
import userRoute from "src/user.route";
import usersRoute from "src/users.route";

const app = express();
app.use(express.json());
app.use("/user", userRoute);
app.use("/users", usersRoute);

const PORT = process.env.PORT || 3000;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;
app.listen(PORT, () => {
  console.log(`Server running on ${BASE_URL}`);
});
