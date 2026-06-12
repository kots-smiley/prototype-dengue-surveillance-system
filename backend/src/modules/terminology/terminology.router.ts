import { Router } from 'express';
import { terminologyController } from './terminology.controller';
import { listTerminologyQuerySchema } from './terminology.schema';
import { validate } from '../../middleware/validate.middleware';
import { authenticate } from '../../middleware/auth.middleware';
import { asyncHandler } from '../../helper/async-handler';

const router = Router();

router.use(authenticate);
router.get('/', validate(listTerminologyQuerySchema, 'query'), asyncHandler(terminologyController.list));

export default router;
