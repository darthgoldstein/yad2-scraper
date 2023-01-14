import { KeyValue } from './db-client';

export const KeyValueStore = {
  get: async <T>(key: string): Promise<T> => {
    const entry = await KeyValue.findOne({ key });
    return entry ? entry.value : null;
  },

  getMany: async <T>(keys: string[]): Promise<T[]> => {
    return Promise.all(
      keys.map(async (key) => {
        const entry = await KeyValue.findOne({ key });
        return entry ? entry.value : null;
      })
    );
  },

  set: async <T>(key: string, value: T): Promise<void> => {
    await KeyValue.updateOne({ key }, { $set: { value } }, { upsert: true });
  },

  invalidate: async (key: string) => {
    await KeyValue.deleteOne({ key });
  },
};
