import Errors from "../libs/Errors";
import { View, ViewInput } from "../libs/types/views";
import ViewModel from "../schema/View.model";
import { HttpCode, Message } from "../libs/Errors";

class ViewService {
  private readonly viewModel;

  constructor() {
    this.viewModel = ViewModel;
  }

  public async checkViewExistence(input: ViewInput): Promise<View> {
    const view = await this.viewModel
      .findOne({ memberId: input.memberId, viewrefId: input.viewrefId })
      .exec();

    return view as unknown as View;
  }

  public async insertMemberView(input: ViewInput): Promise<View> {
    try {
      return (await this.viewModel.create(input)) as unknown as View;
    } catch (err) {
      console.log("ERORR in insert view", err);
      throw new Errors(HttpCode.BAD_REQUEST, Message.CREATED_FAILED);
    }
  }
}

export default ViewService;
