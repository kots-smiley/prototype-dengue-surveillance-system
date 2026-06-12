import { Router } from 'express';
import { maternalController } from './maternal.controller';
import { createMaternalSchema, updateMaternalSchema, listMaternalQuerySchema } from './maternal.schema';
import { validate } from '../../middleware/validate.middleware';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { asyncHandler } from '../../helper/async-handler';
import { CLINICAL_ROLES } from '../../configuration/constants';

const router = Router();

router.use(authenticate);
router.use(authorize(...CLINICAL_ROLES));

router.get('/', validate(listMaternalQuerySchema, 'query'), asyncHandler(maternalController.list));
router.post('/', validate(createMaternalSchema), asyncHandler(maternalController.create));
router.put('/:id', validate(updateMaternalSchema), asyncHandler(maternalController.update));
router.delete('/:id', asyncHandler(maternalController.remove));

export default router;
