import { Router } from 'express';

import { asyncHandler } from '../../shared/middleware/asyncHandler.js';
import { validateBody } from '../../shared/middleware/validate.middleware.js';
import { createExport, downloadExportFile, getJobStatus } from './export.controller.js';
import { exportBodySchema } from './export.schema.js';

export const exportRouter = Router();

exportRouter.post('/export', validateBody(exportBodySchema), asyncHandler(createExport));
exportRouter.get('/jobs/:id', asyncHandler(getJobStatus));
exportRouter.get('/jobs/:id/download', asyncHandler(downloadExportFile));
