import "dotenv/config";
import express from "express";
import userRoute from "@routes/user.route";

const app = express();
app.use(express.json());
app.use("/user", userRoute);

const PORT = process.env.PORT || 3000;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;
app.listen(PORT, () => {
  console.log(`Server running on ${BASE_URL}`);
});
