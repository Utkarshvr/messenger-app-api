import { Router } from "express";
import { getUserRequests } from "@/controllers/friend-requests.controller";
import isAuth from "@/middlewares/auth/isAuth";
import {
  getAllSuggestedUsers,
  getAllUsers,
} from "@/controllers/user.controller";

const userRoute = Router();

userRoute.use(isAuth);
userRoute.get("/", getAllUsers);
userRoute.get("/suggested", getAllSuggestedUsers);
userRoute.get("/me/requests", getUserRequests);

export default userRoute;
