import getToken, { clearCachedToken } from '../services/tokenService.js';
import axios from 'axios';

function formatDate(date) {
  return date.toISOString().split('T')[0];
}

function getLast7Days(dateStr) {
  const days = [];
  const baseDate = new Date(dateStr);
  for (let i = 6; i >= 0; i--) {
    const d = new Date(baseDate);
    d.setDate(baseDate.getDate() - i);
    days.push(formatDate(d));
  }
  return days;
}

export const getPriceChart = async (req, res) => {
  let token;
  try {
    const { market_id, commodity_id, date } = req.body;
    if (!market_id || !commodity_id || !date) {
      return res
        .status(400)
        .json({ message: 'market_id, commodity_id, dan date wajib diisi' });
    }

    token = await getToken();

    const makeSilindaApiRequest = async (
      market_id,
      commodity_id,
      time,
      currentToken,
      isRetry = false
    ) => {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${currentToken}`,
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        };

        const response = await axios.post(
          'https://api-splp.layanan.go.id/t/jabarprov.go.id/silinda/1/api_v2/transaction/integration_find',
          {
            length: 1000,
            market_id,
            commodity_id,
            time,
            page: 1,
          },
          config
        );
        return response;
      } catch (error) {
        console.error(
          `Error in Silinda API request (isRetry: ${isRetry}):`,
          error.response?.status,
          error.message
        );

        if (error.response?.status === 401 && !isRetry) {
          console.warn(
            '401 detected, attempting to refresh token and retry...'
          );
          clearCachedToken();
          token = await getToken();
          return await makeSilindaApiRequest(
            market_id,
            commodity_id,
            time,
            token,
            true
          );
        }
        throw error;
      }
    };

    const dates = getLast7Days(date);
    const results = [];
    let commodityName = '';
    let marketName = '';

    for (const d of dates) {
      let response;
      try {
        response = await makeSilindaApiRequest(
          market_id,
          commodity_id,
          d,
          token
        );
      } catch (error) {
        console.error(`Failed to get data for date ${d}:`, error.message);
        results.push({
          date: d,
          price: null,
          market_name: 'Data Gagal Dimuat',
        });
        continue;
      }

      const found = response.data.data.find(
        (item) => item.commodity_id === commodity_id
      );

      if (found) {
        if (!commodityName) commodityName = found.commodity_name;
        if (!marketName) marketName = found.market_name;
      }

      results.push({
        date: d,
        price: found ? Number(found.value) : null,
      });
    }

    res.json({
      commodity_id,
      commodity_name: commodityName,
      market_id,
      market_name: marketName,
      prices: results,
    });
  } catch (error) {
    console.error(
      'Gagal mengambil data grafik (general catch):',
      error.message
    );
    res.status(500).json({ message: 'Gagal mengambil data grafik' });
  }
};