import { Request, Response } from 'express';
import { userService } from './user.service';
import { sendSuccess } from '../../helper/api-response';

export const userController = {
  async list(req: Request, res: Response) {
    const users = await userService.list(req.query);
    sendSuccess(res, { users }, 'Users retrieved');
  },

  async getById(req: Request, res: Response) {
    const user = await userService.getById(req.params.id);
    sendSuccess(res, { user }, 'User retrieved');
  },

  async create(req: Request, res: Response) {
    const user = await userService.create(req.body);
    sendSuccess(res, { user }, 'User created', 201);
  },

  async update(req: Request, res: Response) {
    const user = await userService.update(req.params.id, req.body);
    sendSuccess(res, { user }, 'User updated');
  },

  async remove(req: Request, res: Response) {
    await userService.deactivate(req.params.id);
    sendSuccess(res, null, 'User deactivated');
  },
};
