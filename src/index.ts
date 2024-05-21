import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import mongoose from "mongoose";

import connectToDB from "@/utils/connectToDB";
import rootRoute from "@/routes/root.routes";

const app = express();
connectToDB();

app.use(cookieParser());
app.use(
  cors({
    origin: "*",
  })
);

app.get("/", (_, res) => {
  res.redirect("/api");
});

app.use("/api", rootRoute);

const PORT = 5000;

mongoose.connection.once("open", () => {
  console.log("Connected to MongoDB");
  app.listen(PORT || 5000, () => {
    console.log(`👂 Server is running on: http://localhost:${PORT}`);
  });
});

mongoose.connection.on("error", (err) => {
  console.log(err);
});
