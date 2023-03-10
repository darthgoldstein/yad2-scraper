import { Router } from 'express';
import { createApiController } from '../controllers/api-controller';

const apiRoutes = {
  checkForRentalUpdates: '/checkForRentalUpdates',
  getFilters: '/getFilters',
  updateFilters: '/updateFilters',
};

export const createApiRouter = (bot: TelegramBot) => {
  const apiController = createApiController(bot);
  const apiRouter = Router();

  apiRouter.get(apiRoutes.getFilters, apiController.getFilters);
  apiRouter.post(apiRoutes.updateFilters, apiController.updateFilters);
  apiRouter.post(
    apiRoutes.checkForRentalUpdates,
    apiController.checkRentalUpdates
  );

  return apiRouter;
};
