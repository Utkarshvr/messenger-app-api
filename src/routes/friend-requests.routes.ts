import {
  sendRequest,
  markAllRequestsAsSeen,
  rejectRequest,
  accpetRequest,
  cancelRequest,
} from "@/controllers/friend-requests.controller";
import isAuth from "@/middlewares/auth/isAuth";
import { Router } from "express";

const friendRequestsRoute = Router();

friendRequestsRoute.use(isAuth);

// Mark requests as seen
friendRequestsRoute.put("/seen", markAllRequestsAsSeen);

// Send a request
friendRequestsRoute.post("/:recipientID", sendRequest);
// Accept and reject a request
friendRequestsRoute.put("/:requestID/cancel", cancelRequest);
friendRequestsRoute.put("/:requestID/accept", accpetRequest);
friendRequestsRoute.put("/:requestID/reject", rejectRequest);

export default friendRequestsRoute;
