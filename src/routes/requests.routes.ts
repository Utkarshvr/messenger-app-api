import { createRequest, markRequestAsSeen } from "@/controllers/request.controller";
import { Router } from "express";

const requestRoute = Router();

requestRoute.put("/:requestID/seen", markRequestAsSeen);
requestRoute.post("/:recipientID", createRequest);

export default requestRoute;
