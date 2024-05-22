import { Router } from "express";
import { getUserRequests } from "@/controllers/request.controller";

const userRoute = Router();

userRoute.get("/me/requests", getUserRequests);

export default userRoute;
