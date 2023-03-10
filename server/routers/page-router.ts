import { Router } from 'express';
import { createPageController } from '../controllers/page-controller';

const pageRoutes = {
  home: '*',
};

export const createPageRouter = () => {
  const pageController = createPageController();
  const pageRouter = Router();

  pageRouter.get(pageRoutes.home, pageController.getHomePage);

  return pageRouter;
};
