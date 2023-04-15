import path from 'path';
import { config } from '../lib/config';
import { TelegramMethod, TELEGRAM_API_BASE_URL } from '../lib/constants';
import { logger } from '../lib/logger';
import { TelegramSubscriber } from '../mongo/db-client';
import { KeyValueStore } from '../mongo/key-value-store';
import { composeRentalText, getRentals } from '../yad2/yad2-scraper';

const composeRoute = (method: TelegramMethod) => {
  return path.join(
    TELEGRAM_API_BASE_URL,
    `bot${config.telegramBotToken}`,
    method
  );
};

const getMe = async (): Promise<User> => {
  const url = composeRoute(TelegramMethod.GetMe);
  const response: TelegramResponse<User> = await (await fetch(url)).json();
  return response.result;
};

const sendMessage = async ({
  message,
  userID,
  markdown,
}: SendMessageParams): Promise<Message> => {
  const url = composeRoute(TelegramMethod.SendMessage);
  const messageParts = message
    .match(/[^\n]{4096}|.{1,4095}\n|.{1,4096}$/gs)
    .map((part) => part.trim())
    .filter(Boolean);

  let result: any;
  for (const part of messageParts) {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: userID,
        text: part,
        parse_mode: markdown ? 'Markdown' : undefined,
        disable_web_page_preview: true,
      }),
    });
    const responseBody = await response.json();
    result = responseBody.result;
  }

  return result;
};

const getUpdates = async () => {
  const lastUpdateID = await KeyValueStore.get<number>('lastUpdateID');
  const url = composeRoute(TelegramMethod.GetUpdates);
  const body = lastUpdateID == null ? null : { offset: lastUpdateID + 1 };
  const response: TelegramResponse<Update[]> = await (
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      ...(body ? { body: JSON.stringify(body) } : {}),
    })
  ).json();
  return response.result;
};

const handleUpdate = async (update: Update) => {
  const { update_id, message } = update;
  const userID = message.from.id;

  const updateLog = logger.child({
    text: message.text,
    userID,
    name: 'handleUpdate',
  });
  updateLog.info('received message from user');

  const text = message.text?.trim() ?? '';

  const messageHandlers: Record<string, () => Promise<string>> = {
    '/start': async () =>
      'Hey there! What do you wanna do? Type "help" for a list of commands.',
    check: async () => {
      updateLog.info('Manual rentals check');
      checkForRentalUpdates(userID);
      return 'Checking for updates...';
    },
    hi: async () => 'Hello to you as well, dear.',
    hello: async () => 'Hello to you as well, dear.',
    help: async () =>
      '- Type "subscribe" to subscribe to updates.\n- Type "unsubscribe" to unsubscribe from updates.\n- Type "check" to look for new rentals right now.',
    subscribe: async () => {
      updateLog.info('attempting to subcribe');
      const result = await TelegramSubscriber.updateOne(
        { userID },
        { $set: { userID } },
        { upsert: true }
      );
      const success = result.upsertedCount > 0;
      updateLog.info({ success }, 'subscription attempt complete');
      return success
        ? 'You are now subscribed to receive yad2 rental listings.'
        : "You're already subscribed homie.";
    },
    unsubscribe: async () => {
      updateLog.info('attempting to unsubcribe');
      const deleted = await TelegramSubscriber.deleteOne({ userID });
      const success = deleted.deletedCount > 0;
      updateLog.info({ success }, 'unsubscribe attempt complete');
      return success
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
    responseText = `The command "${abridgedText}" doesn't work.`;
  }
  await KeyValueStore.set('lastUpdateID', update_id);
  await sendMessage({ message: responseText, userID });
  logger.info({ responseText, userID }, 'responding to user');
};

const updateSubscribers = async (rentals: Rental[]) => {
  if (!rentals.length) {
    return;
  }

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
      return sendMessage({ message: messageText, userID: id, markdown: true });
    })
  );
};

const checkForRentalUpdates = async (requesterID?: number) => {
  const newRentals = await getRentals();
  if (newRentals.length) {
    await updateSubscribers(newRentals);
  } else if (requesterID) {
    await sendMessage({
      message: `Didn't find shit unfortunately. Try changing your filters at ${config.homePageUrl}.`,
      userID: requesterID,
    });
  }
};

export const createTelegramBot = (): TelegramBot => {
  let timeoutID: NodeJS.Timeout = null;

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
    checkForRentalUpdates,
  };
};
