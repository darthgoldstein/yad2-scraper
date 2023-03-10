import { Request, Response } from 'express';
import { getRentalFilters, updateRentalFilters } from '../yad2/yad2-scraper';

export const createApiController = (bot: TelegramBot) => {
  const checkRentalUpdates = async (_: Request, res: Response) => {
    await bot.checkForRentalUpdates();
    res.json({ status: true });
  };

  const getFilters = async (req: Request, res: Response) => {
    const filters = await getRentalFilters();
    res.json({ status: true, data: filters });
  };

  const updateFilters = async (req: Request, res: Response) => {
    const filters = req.body || {};
    await updateRentalFilters(filters);
    res.json({ status: true });
  };

  return {
    checkRentalUpdates,
    getFilters,
    updateFilters,
  };
};
