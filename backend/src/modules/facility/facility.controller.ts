import { Response } from 'express';
import { facilityService } from './facility.service';
import { sendSuccess } from '../../helper/api-response';
import { AuthRequest } from '../../types';

export const facilityController = {
  async list(req: AuthRequest, res: Response) {
    const result = await facilityService.list(req.query);
    sendSuccess(res, result, 'Facilities retrieved');
  },

  async getById(req: AuthRequest, res: Response) {
    const facility = await facilityService.getById(req.params.id);
    sendSuccess(res, { facility }, 'Facility retrieved');
  },

  async create(req: AuthRequest, res: Response) {
    const facility = await facilityService.create(req.body);
    sendSuccess(res, { facility }, 'Facility created', 201);
  },

  async update(req: AuthRequest, res: Response) {
    const facility = await facilityService.update(req.params.id, req.body);
    sendSuccess(res, { facility }, 'Facility updated');
  },

  async remove(req: AuthRequest, res: Response) {
    await facilityService.remove(req.params.id);
    sendSuccess(res, null, 'Facility deactivated');
  },
};
