import { Request, Response, NextFunction } from 'express';
import { UserRepository } from '../repositories/user.repository.js';

const userRepository = new UserRepository();

export class UserController {
  async getAllUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await userRepository.findAll();
      return res.status(200).json({
        success: true,
        message: 'Users retrieved successfully',
        data: { users },
      });
    } catch (error) {
      next(error);
    }
  }

  async getTeamWorkloads(req: Request, res: Response, next: NextFunction) {
    try {
      const workloads = await userRepository.getMembersWorkload();
      return res.status(200).json({
        success: true,
        message: 'Team workload metrics retrieved successfully',
        data: { workloads },
      });
    } catch (error) {
      next(error);
    }
  }
}
