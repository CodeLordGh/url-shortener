import { Types } from 'mongoose';
import Url from '../models/Url';

export function scheduleUrlDeletion(urlId: Types.ObjectId, delay: number) {
  setTimeout(async () => {
    try {
      const url = await Url.findById(urlId);
      if (url && !url.userId) {
        await Url.findByIdAndDelete(urlId);
        console.log(`Deleted expired anonymous URL with ID: ${urlId}`);
      }
    } catch (error) {
      console.error(`Error deleting expired URL with ID: ${urlId}`, error);
    }
  }, delay);
}
