import { Request, Response } from 'express';
import path from 'node:path';

import { NotFoundError } from '../../shared/errors/AppError.js';
import type { ExportBodyDto } from './export.schema.js';
import { createExportJob, getExportFileStream, getExportJobStatus } from './export.service.js';

export const createExport = async (req: Request, res: Response) => {
  const body = req.body as ExportBodyDto;
  const userId = req.user?.userId ?? 'anonymous';

  const job = await createExportJob({
    userId,
    format: body.format,
    filters: body.filters,
    notifyEmail: body.notifyEmail,
  });

  return res.status(202).json({
    success: true,
    message: 'Export job created',
    data: job,
  });
};

export const getJobStatus = async (req: Request, res: Response) => {
  const job = await getExportJobStatus(req.params.id as string);

  if (!job) throw new NotFoundError('Job not found', 'JOB_NOT_FOUND');

  return res.json({ success: true, data: job });
};

export const downloadExportFile = async (req: Request, res: Response) => {
  const file = await getExportFileStream(req.params.id as string);

  if (!file) throw new NotFoundError('Export file not found', 'EXPORT_FILE_NOT_FOUND');

  if ('notCompleted' in file) {
    return res.status(400).json({
      success: false,
      message: 'Job is not completed yet',
      code: 'JOB_NOT_COMPLETED',
    });
  }

  const ext = path.extname(file.fileName).toLowerCase();
  const contentType = ext === '.json' ? 'application/json' : 'text/csv';

  res.setHeader('Content-Type', contentType);
  res.setHeader('Content-Disposition', `attachment; filename="${file.fileName}"`);

  return file.stream.pipe(res);
};
