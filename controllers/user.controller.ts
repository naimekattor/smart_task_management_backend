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

  async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      if (req.user!.id === id) {
        return res.status(400).json({
          success: false,
          message: 'You cannot delete your own account.',
          errors: [],
        });
      }

      await userRepository.delete(id);

      return res.status(200).json({
        success: true,
        message: 'User deleted successfully from the workspace.',
        data: {},
      });
    } catch (error) {
      next(error);
    }
  }
}
