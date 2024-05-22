import { Router, json } from "express";
import webhookRoute from "./webhook.routes";
import userRoute from "./user.routes";
import requestRoute from "./requests.routes";

const rootRoute = Router();

rootRoute.use("/webhooks", webhookRoute);

// Use express.json() middleware only after the webhooks api
rootRoute.use(json());
rootRoute.get("/", (req, res) => {
  res.json("Welcome to the Portfolio API");
});

rootRoute.use("/users", userRoute);
rootRoute.use("/requests", requestRoute);

export default rootRoute;
