import 'dotenv/config';
import app from './app.js';
import { logger } from './shared/utils/logger.js';

const PORT = 3000;

app.listen(PORT, () => {
  logger.info(`Server is running at http://localhost:${PORT}`);
});