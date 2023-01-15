import axios from 'axios';
import { UpdateFilter } from 'mongodb';
import path from 'path';
import { config } from '../config';
import { TelegramMethod, TELEGRAM_API_BASE_URL } from '../lib/constants';
import { logger } from '../lib/logger';
import { TelegramSubscriber } from '../mongo/db-client';
import { KeyValueStore } from '../mongo/key-value-store';
import { composeRentalText } from '../yad2/yad2-scraper';

const composeRoute = (method: TelegramMethod) => {
  return path.join(
    TELEGRAM_API_BASE_URL,
    `bot${config.telegramBotToken}`,
    method
  );
};

const getMe = async () => {
  const url = composeRoute(TelegramMethod.GetMe);
  const { data } = await axios.get<TelegramResponse<User>>(url);
  return data.result;
};

const sendMessage = async (message: string, userID: number) => {
  const url = composeRoute(TelegramMethod.SendMessage);
  const { data } = await axios.post<TelegramResponse<Message>>(url, {
    chat_id: userID,
    text: message,
  });
  return data.result;
};

const getUpdates = async () => {
  const offset =
    (await KeyValueStore.get<number>('lastUpdateID')) + 1 ?? undefined;
  const url = composeRoute(TelegramMethod.GetUpdates);
  const { data } = await axios.post<TelegramResponse<Update[]>>(url, {
    offset,
  });
  return data.result;
};

const handleUpdate = async (update: Update) => {
  const { update_id, message } = update;
  const userID = message.from.id;
  const text = message.text?.trim() ?? '';

  logger.info({ text, userID }, 'received message from user');

  const messageHandlers: Record<string, () => Promise<string>> = {
    '/start': async () => 'Hey there! What do you wanna do?',
    hi: async () => 'Hello to you as well, dear.',
    hello: async () => 'Hello to you as well, dear.',
    subscribe: async () => {
      const result = await TelegramSubscriber.updateOne(
        { userID },
        { $set: { userID } },
        { upsert: true }
      );
      return result.upsertedCount
        ? 'You are now subscribed to receive yad2 rental listings.'
        : "You're already subscribed homie.";
    },
    unsubscribe: async () => {
      const deleted = await TelegramSubscriber.deleteOne({ userID });
      return deleted.deletedCount
        ? "Well I didn't want to fucking help you out anyway, so whatever."
        : "You're not even subscribed, you silly fuck.";
    },
  };

  const handlerName = text.toLowerCase();
  let responseText = '';

  if (Object.hasOwn(messageHandlers, handlerName)) {
    responseText = await messageHandlers[handlerName]();
  } else {
    const abridgedText = text.length > 30 ? `${text.slice(0, 30)}...` : text;
    responseText = `The command "${abridgedText}" doesn't work`;
  }
  await KeyValueStore.set('lastUpdateID', update_id);
  await sendMessage(responseText, userID);
  logger.info({ responseText, userID }, 'responding to user');
};

const updateSubscribers = async (rentals: Rental[]) => {
  const subscriberIDs = (await TelegramSubscriber.find().toArray()).map(
    (s) => s.userID
  );
  const rentalsText = rentals
    .map(composeRentalText)
    .filter(Boolean)
    .join('\n\n');
  const messageText = `Here are some new listings:\n\n${rentalsText}`;
  await Promise.all(
    subscriberIDs.map((id) => {
      logger.info({ userID: id }, 'Updating subscriber with new listings');
      return sendMessage(messageText, id);
    })
  );
};

export const createTelegramBot = () => {
  let timeoutID: NodeJS.Timeout;

  const poll = (interval = 500) => {
    timeoutID = setTimeout(async () => {
      logger.info('checking for telegram updates');

      for (const update of await getUpdates()) {
        await handleUpdate(update);
      }

      poll(interval);
    }, interval);
  };

  const stopPolling = () => {
    clearTimeout(timeoutID);
  };

  return {
    startPolling: poll,
    stopPolling,
    getMe,
    sendMessage,
    getUpdates,
    updateSubscribers,
  };
};
