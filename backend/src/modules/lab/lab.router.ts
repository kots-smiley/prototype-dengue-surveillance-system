import { Router } from 'express';
import { labController } from './lab.controller';
import { createLabSchema, updateLabSchema, listLabQuerySchema } from './lab.schema';
import { validate } from '../../middleware/validate.middleware';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { asyncHandler } from '../../helper/async-handler';
import { CLINICAL_ROLES } from '../../configuration/constants';

const router = Router();

router.use(authenticate);
router.use(authorize(...CLINICAL_ROLES));

router.get('/', validate(listLabQuerySchema, 'query'), asyncHandler(labController.list));
router.post('/', validate(createLabSchema), asyncHandler(labController.create));
router.put('/:id/cancel', asyncHandler(labController.cancel));
router.put('/:id', validate(updateLabSchema), asyncHandler(labController.update));
router.delete('/:id', asyncHandler(labController.remove));

export default router;
