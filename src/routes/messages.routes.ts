import { Router } from "express";
import isAuth from "@/middlewares/auth/isAuth";
import { deleteMessage, getMessages, sendMessage } from "@/controllers/messages.controller";

const messagesRoute = Router();

messagesRoute.use(isAuth);

messagesRoute.get("/:conversationID", getMessages);
messagesRoute.post("/:conversationID", sendMessage);
messagesRoute.delete("/:messageID", deleteMessage);

export default messagesRoute;
