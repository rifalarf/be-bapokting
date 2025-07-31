const axios = require('axios');
require('dotenv').config();

const getToken = async () => {
  try {
    const response = await axios.post(
      `${process.env.TOKEN_URL}/oauth2/token`,
      new URLSearchParams({

        grant_type: 'client_credentials',
        scope: process.env.SCOPE,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${process.env.CLIENT_CREDENTIAL}`,
        },
      }
    );

    return response.data.access_token;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Gagal mengambil token:', error.response?.data || error.message);
    throw error;
  }
};

module.exports = getToken;