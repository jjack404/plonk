import NodeCache from 'node-cache';
import axios from 'axios';

export const cache = new NodeCache({ stdTTL: 600 }); // Cache for 10 minutes

export const makeApiRequest = async (url: string, data: any) => {
  const cacheKey = `${url}-${JSON.stringify(data)}`;
  const cachedResponse = cache.get(cacheKey);
  
  if (cachedResponse) {
    return cachedResponse;
  }

  const maxRetries = 3;
  let attempt = 0;
  
  while (attempt < maxRetries) {
    try {
      const response = await axios.post(url, data);
      cache.set(cacheKey, response.data);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 429) {
        const retryAfter = error.response.headers['retry-after'] || 1;
        await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
        attempt++;
      } else {
        console.error('Error making API request:', error);
        throw error;
      }
    }
  }
  
  throw new Error('Max retries reached');
};