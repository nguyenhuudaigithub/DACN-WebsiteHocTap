import { getAllOrders } from "../controllers/order.controller";
import { authorizeRoles, isAutheticated } from "../middleware/auth";

orderRouter.post("/get-orders", isAutheticated, authorizeRoles("admin"), getAllOrders);

export default orderRouter;