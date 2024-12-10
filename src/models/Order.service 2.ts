import OrderItemModel from "../schema/OrderItem.model";
import { Member } from "../libs/types/member";
import { shapeIntoMongooseObject } from "../libs/config";
import Errors, { HttpCode, Message } from "../libs/Errors";
import { ObjectId } from "mongoose";
import { OrderStatus } from "../libs/enums/order.enum";
import MemberService from "./Member.service";

import {
  Order,
  OrderInquery,
  OrderItemInput,
  OrderUpdateInput,
} from "../libs/types/order";
import OrderModel from "../schema/Order.Model";
import CourseService from "./Course.service";
import { Course } from "../libs/types/course";
class OrderService {
  private readonly orderModel;
  private readonly orderItemModel;
  private readonly memberService;
  private readonly courseService;
  constructor() {
    this.orderModel = OrderModel;
    this.orderItemModel = OrderItemModel;
    this.memberService = new MemberService();
    this.courseService = new CourseService();
  }

  public async createOrder(
    member: Member,
    input: OrderItemInput[]
  ): Promise<Order> {
    // console.log("input:", input);
    const memberId = shapeIntoMongooseObject(member._id);
    const amount = input.reduce((accumulator: number, item: OrderItemInput) => {
      return accumulator + item.itemSaledPrice > 0
        ? item.itemSaledPrice
        : item.itemPrice * item.itemQuantity;
    }, 0);
    // const delivery = amount < 100 ? 5 : 0;
    // console.log("values:", amount, delivery);

    try {
      const newOrder: Order = (await this.orderModel.create({
        orderTotal: amount,
        // orderDelivery: delivery,
        memberId: memberId,
      })) as unknown as Order;

      //   TODO: create order Items

      const orderId = newOrder._id;
      //   console.log("orderId:", orderId);
      await this.recordOrderItem(orderId, input);
      return newOrder;
    } catch (err) {
      console.log("ERROR, model: createOrder:", err);
      throw new Errors(HttpCode.BAD_REQUEST, Message.CREATED_FAILED);
    }
  }

  private async recordOrderItem(
    orderId: ObjectId,
    input: OrderItemInput[]
  ): Promise<void> {
    const promisedList = input.map(async (item: OrderItemInput) => {
      item.orderId = orderId;
      item.courseId = shapeIntoMongooseObject(item.courseId);
      await this.orderItemModel.create(item);
      return "Inserted";
    });
    console.log("promisedList:", promisedList);
    const orderItemsState = await Promise.all(promisedList);

    console.log("orderItemsState:", orderItemsState);
  }

  // public async getMyOrders(
  //   member: Member,
  //   inquery: OrderInquery
  // ): Promise<Order[]> {
  //   const memberId = shapeIntoMongooseObject(member._id);
  //   const matches = { memberId: memberId, orderStatus: inquery.orderStatus };
  //   const result = await this.orderModel
  //     .aggregate([
  //       { $match: matches },
  //       { $sort: { updatedAt: -1 } },
  //       { $skip: (inquery.page - 1) * inquery.limit },
  //       { $limit: inquery.limit },
  //       {
  //         $lookup: {
  //           from: "orderItems",
  //           localField: "_id",
  //           foreignField: "orderId",
  //           as: "orderItems",
  //         },
  //       },
  //       {
  //         $lookup: {
  //           from: "courses",
  //           localField: "orderItems.courseId",
  //           foreignField: "_id",
  //           as: "courseData",
  //         },
  //       },
  //     ])
  //     .exec();
  //   if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
  //   return result;
  // }

  public async getMyOrders(
    member: Member,
    inquery: OrderInquery
  ): Promise<Order[]> {
    const memberId = shapeIntoMongooseObject(member._id);
    const matches = { memberId: memberId, orderStatus: inquery.orderStatus };

    const result = await this.orderModel
      .aggregate([
        { $match: matches },
        { $sort: { updatedAt: -1 } },
        { $skip: (inquery.page - 1) * inquery.limit },
        { $limit: inquery.limit },
        {
          $lookup: {
            from: "orderItems",
            localField: "_id",
            foreignField: "orderId",
            as: "orderItems",
          },
        },

        {
          $lookup: {
            from: "courses",
            localField: "orderItems.courseId",
            foreignField: "_id",
            as: "courseData",
          },
        },
      ])
      .exec();
    if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
    return result;
  }

  public async updateOrder(
    member: Member,
    input: OrderUpdateInput
  ): Promise<Order> {
    const memberId = shapeIntoMongooseObject(member._id),
      orderId = shapeIntoMongooseObject(input.orderId),
      orderStatus = input.orderStatus;

    const result = await this.orderModel
      .findByIdAndUpdate(
        {
          memberId: memberId,
          _id: orderId,
        },
        { orderStatus: orderStatus },
        { new: true }
      )
      .exec();

    if (!result) throw new Errors(HttpCode.NOT_MODIFIED, Message.UPDATE_FAILED);

    // orderStatus PAUSE => PROCESS +1
    if (orderStatus === OrderStatus.PROCESS) {
      await this.memberService.addUserPoint(member, 1);
    }
    console.log("RESLT=>>>>", result);
    return result as unknown as Order;
  }
}
export default OrderService;
