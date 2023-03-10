import { Router } from 'express';
import { createApiRouter } from './api-router';
import { createPageRouter } from './page-router';

const appRoutes = {
  pages: '',
  api: '/api',
};

export const createAppRouter = (bot: TelegramBot) => {
  const appRouter = Router();

  appRouter.use(appRoutes.api, createApiRouter(bot));
  appRouter.use(appRoutes.pages, createPageRouter());

  return appRouter;
};
