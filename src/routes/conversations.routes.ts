import { Router } from "express";
import isAuth from "@/middlewares/auth/isAuth";
import {
  createConversation,
  deleteConversation,
  getUnseenMsgCountByConvID,
  getUsersConversations,
  markUnseenMsgsAsSeen,
} from "@/controllers/conversations.controller";
const conversationsRoute = Router();

conversationsRoute.use(isAuth);
conversationsRoute.get("/", getUsersConversations);
conversationsRoute.post("/", createConversation);

conversationsRoute.get(
  "/:conversationID/unseen-msg-count",
  getUnseenMsgCountByConvID
);
conversationsRoute.put("/:conversationID/mark-msg-seen", markUnseenMsgsAsSeen);
conversationsRoute.delete("/:conversationID", deleteConversation);

export default conversationsRoute;
