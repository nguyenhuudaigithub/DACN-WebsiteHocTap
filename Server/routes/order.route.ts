import { getAllOrders } from "../controllers/order.controller";
import { authorizeRoles, isAutheticated } from "../middleware/auth";
import express from "express";
import { isAutheticated } from "../middleware/auth";
import { createOrder } from "../controllers/order.controller";
const orderRouter = express.Router();

orderRouter.post("/create-order", isAutheticated, createOrder);
orderRouter.post("/get-orders", isAutheticated, authorizeRoles("admin"), getAllOrders);

export default orderRouter;
