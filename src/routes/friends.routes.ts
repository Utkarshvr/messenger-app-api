import { removeFriend } from "@/controllers/friends.controller";
import isAuth from "@/middlewares/auth/isAuth";
import { Router } from "express";

const friendsRoute = Router();

friendsRoute.use(isAuth);

// Mark requests as seen
friendsRoute.put("/:userID/remove", removeFriend);

export default friendsRoute;
