import mongoose, { Document, Model, Schema } from "mongoose";

export interface IOder extends Document {
  courseId: string;
  userId: string;
  payment_info: object;
}

const orderSchema = new Schema<IOder>(
  {
    courseId: {
      type: String,
      required: true,
    },

    userId: {
      type: String,
      required: true,
    },

    payment_info: {
      type: Object,
    },
  },
  { timestamps: true }
);

const OrderModel: Model<IOder> = mongoose.model("Order", orderSchema);

export default OrderModel;
