import mongoose, { Schema } from "mongoose";
import { CourseStatus } from "../libs/enums/course.enum";
const orderItemSchema = new Schema(
  {
    itemQuantity: {
      type: Number,
      required: true,
    },

    itemPrice: {
      type: Number,
      required: true,
    },

    itemSaledPrice: {
      type: Number,
      required: true,
    },

    // itemStatus: {
    //   type: CourseStatus,
    //   required: true,
    // },

    orderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
    },

    courseId: {
      type: Schema.Types.ObjectId,
      ref: "Course",
    },
  },
  { timestamps: true, collection: "orderItems" }
);

export default mongoose.model("OrderItem", orderItemSchema);
