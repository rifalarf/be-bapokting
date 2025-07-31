const axios = require('axios');
const getToken = require('./getToken');
require('dotenv').config();

const getData = async ({ market_id, date }) => {
  const token = await getToken();

  const response = await axios.post(
    `${process.env.SILINDA_BASE}/api_v2/transaction/integration_find`,
    {
      length: 1000,
      page: 1,
      market_id,
      time: date,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );

  return response.data;
};

module.exports = getData;