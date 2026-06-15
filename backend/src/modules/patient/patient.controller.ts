import { Response } from 'express';
import { patientService } from './patient.service';
import { sendSuccess } from '../../helper/api-response';
import { AuthRequest } from '../../types';

export const patientController = {
  async list(req: AuthRequest, res: Response) {
    const result = await patientService.list(req.query);
    sendSuccess(res, result, 'Patients retrieved');
  },

  async getById(req: AuthRequest, res: Response) {
    const includeEncounters = req.query.includeEncounters === 'true';
    const record = await patientService.getById(req.params.id, { includeEncounters });
    sendSuccess(res, { patient: record }, 'Patient retrieved');
  },

  async create(req: AuthRequest, res: Response) {
    const record = await patientService.create(req.body, req.user!);
    sendSuccess(res, { patient: record }, 'Patient registered', 201);
  },

  async update(req: AuthRequest, res: Response) {
    const record = await patientService.update(req.params.id, req.body);
    sendSuccess(res, { patient: record }, 'Patient updated');
  },

  async remove(req: AuthRequest, res: Response) {
    await patientService.remove(req.params.id);
    sendSuccess(res, null, 'Patient archived');
  },
};
