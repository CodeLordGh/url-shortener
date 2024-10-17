import Url from '../models/Url';
import axios from 'axios';

export async function incrementClicks(shortCode: string): Promise<void> {
  await Url.findOneAndUpdate({ shortCode }, { $inc: { clicks: 1 } });
}

export async function getGeographicData(ip: string): Promise<any> {
  try {
    const response = await axios.get(`https://ipapi.co/${ip}/json/`);
    return {
      country: response.data.country_name,
      city: response.data.city,
      region: response.data.region
    };
  } catch (error) {
    console.error('Error fetching geographic data:', error);
    return null;
  }
}