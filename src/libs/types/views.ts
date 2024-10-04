import { ObjectId, Types } from "mongoose";
import { ViewGroup } from "../enums/views.enum";

export interface View {
  _id: Types.ObjectId;
  viewGroup: ViewGroup;
  memberId: ObjectId;
  viewrefId: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface ViewInput {
  memberId: ObjectId;
  viewrefId: ObjectId;
  viewGroup: ViewGroup;
}
