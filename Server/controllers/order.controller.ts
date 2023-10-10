// get all order -- only for admin
export const getAllOrders = CatchAsyncError(
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        getAllOrdersService(res);
      } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
      }
    }
  );