import { Date, ObjectId } from "mongoose";
import { OrderStatus } from "../enums/order.enum";
import { Course } from "./course";
export interface OrderItem {
  _id: ObjectId;
  itemQuantity: number;
  itemPrice: number;
  orderItem: ObjectId;
  courseId: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface Order {
  _id: ObjectId;
  orderTotal: number;
  orderDelivery: number;
  orderStatus: OrderStatus;
  memberId: ObjectId;
  createdAt: Date;
  updatedAt: Date;

  // from aggregation
  orderItems: OrderItem[];
  courseData: Course[];
}

export interface OrderItemInput {
  itemQuantity: number;
  itemPrice: number;
  courseId: ObjectId;
  orderId?: ObjectId;
}

export interface OrderInquery {
  page: number;
  limit: number;
  orderStatus: OrderStatus;
}

export interface OrderUpdateInput {
  orderId: string;
  orderStatus: OrderStatus;
  // courseId: string;
}
