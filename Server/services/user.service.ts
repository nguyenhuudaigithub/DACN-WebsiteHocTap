import { Response } from 'express';
import userModel from '../models/user.model';

// lấy user từ id
export const getUserById = async (id: string, res: Response) => {
  const userJson = await res.get(id);

  if (userJson) {
    const user = JSON.parse(userJson);

    res.status(201).json({
      success: true,
      user,
    });
  }
};
