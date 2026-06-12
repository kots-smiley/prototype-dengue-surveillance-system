import { Response } from 'express';
import { fhirService } from './fhir.service';
import { sendSuccess } from '../../helper/api-response';
import { AuthRequest } from '../../types';

export const fhirController = {
  async getPatient(req: AuthRequest, res: Response) {
    const resource = await fhirService.getPatient(req.params.id);
    res.status(200).json(resource);
  },

  async everything(req: AuthRequest, res: Response) {
    const bundle = await fhirService.getEverything(req.params.id);
    res.status(200).json(bundle);
  },

  async summary(req: AuthRequest, res: Response) {
    const bundle = await fhirService.getSummary(req.params.id);
    res.status(200).json(bundle);
  },

  async importBundle(req: AuthRequest, res: Response) {
    const result = await fhirService.importBundle(req.body, req.user!.id);
    sendSuccess(res, result, 'FHIR Bundle imported', 201);
  },
};
