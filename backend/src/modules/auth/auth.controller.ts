import { Request, Response } from 'express';
import { authService } from './auth.service';
import { sendSuccess } from '../../helper/api-response';
import { AuthRequest } from '../../types';

export const authController = {
  async login(req: Request, res: Response) {
    const result = await authService.login(req.body);
    sendSuccess(res, result, 'Login successful');
  },

  async register(req: Request, res: Response) {
    const user = await authService.register(req.body);
    sendSuccess(res, { user }, 'User registered successfully', 201);
  },

  async me(req: AuthRequest, res: Response) {
    const user = await authService.getCurrentUser(req.user!.id);
    sendSuccess(res, { user }, 'Current user retrieved');
  },

  async changePassword(req: AuthRequest, res: Response) {
    await authService.changePassword(req.user!.id, req.body);
    sendSuccess(res, null, 'Password updated successfully');
  },
};
