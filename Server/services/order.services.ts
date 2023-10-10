


//get all orders
export const getAllOrdersService = async(res: Response)=>{
    const orders = await OrderModel.find().sort({createdAt: -1});
    res.status(201).json({
      success: true,
      orders,
    });
  };