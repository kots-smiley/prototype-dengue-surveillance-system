import { Response } from 'express';
import { clinicalService } from './clinical.service';
import { sendSuccess } from '../../helper/api-response';
import { AuthRequest } from '../../types';

export const clinicalController = {
  async listAllergies(req: AuthRequest, res: Response) {
    const items = await clinicalService.listAllergies(req.query);
    sendSuccess(res, { allergies: items }, 'Allergies retrieved');
  },

  async createAllergy(req: AuthRequest, res: Response) {
    const record = await clinicalService.createAllergy(req.body);
    sendSuccess(res, { allergy: record }, 'Allergy recorded', 201);
  },

  async removeAllergy(req: AuthRequest, res: Response) {
    await clinicalService.removeAllergy(req.params.id);
    sendSuccess(res, null, 'Allergy deleted');
  },

  async listProblems(req: AuthRequest, res: Response) {
    const items = await clinicalService.listProblems(req.query);
    sendSuccess(res, { problems: items }, 'Problems retrieved');
  },

  async createProblem(req: AuthRequest, res: Response) {
    const record = await clinicalService.createProblem(req.body);
    sendSuccess(res, { problem: record }, 'Problem added', 201);
  },

  async updateProblem(req: AuthRequest, res: Response) {
    const record = await clinicalService.updateProblem(req.params.id, req.body);
    sendSuccess(res, { problem: record }, 'Problem updated');
  },

  async removeProblem(req: AuthRequest, res: Response) {
    await clinicalService.removeProblem(req.params.id);
    sendSuccess(res, null, 'Problem deleted');
  },
};
