import axios from 'axios';
import qs from 'qs';

let cachedToken = null;
let tokenExpiryTime = 0;

export const clearCachedToken = () => {
  cachedToken = null;
  tokenExpiryTime = 0;
  console.log('Cached token cleared.');
};

const getToken = async () => {
  if (cachedToken && Date.now() < tokenExpiryTime - (10 * 60 * 1000)) {
    // eslint-disable-next-line no-console
    console.log('Using cached token.');
    return cachedToken;
  }

  try {
    const response = await axios.post(
      process.env.TOKEN_URL,
      qs.stringify({
        grant_type: 'client_credentials',
        scope: process.env.SCOPE,
      }),
      {
        headers: {
          Authorization: process.env.CLIENT_CREDENTIAL,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    cachedToken = response.data.access_token;
    tokenExpiryTime = Date.now() + (response.data.expires_in * 1000);
    // eslint-disable-next-line no-console
    console.log('New token obtained. Expires in:', response.data.expires_in, 'seconds.');
    return cachedToken;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Gagal mengambil token:',  error.response?.data || error.message);
    // eslint-disable-next-line no-console
    console.error('Error config:', error.config);
    // eslint-disable-next-line no-console
    console.error('Error response data:', error.response?.data);
    throw error;
  }
};

export default getToken;