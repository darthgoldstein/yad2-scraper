import { Request, Response } from 'express';
import path from 'path';

export const createPageController = () => {
  const getHomePage = async (_: Request, res: Response) => {
    res.sendFile(path.resolve('index.html'));
  };

  return { getHomePage };
};
