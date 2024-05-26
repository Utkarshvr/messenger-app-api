import { Router } from "express";
import isAuth from "@/middlewares/auth/isAuth";
import { getMessages } from "@/controllers/messages.controller";

const messagesRoute = Router();

messagesRoute.use(isAuth);
messagesRoute.get("/", getMessages);

export default messagesRoute;
