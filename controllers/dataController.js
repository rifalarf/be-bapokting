import getToken, { clearCachedToken } from '../services/tokenService.js';
import axios from 'axios';

function getYesterday(dateStr) {
  const date = new Date(dateStr);
  date.setDate(date.getDate() - 1);
  return date.toISOString().split('T')[0];
}

export const fetchDataHandler = async (req, res) => {
  try {
    const { market_id, date } = req.body;

    if (!market_id || !date) {
      return res
        .status(400)
        .json({ message: 'market_id dan date wajib diisi' });
    }

    let token = await getToken();

    const makeSilindaApiRequest = async (
      market_id,
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
          return await makeSilindaApiRequest(market_id, time, token, true);
        }
        throw error;
      }
    };

    let currentResponse;
    try {
      currentResponse = await makeSilindaApiRequest(market_id, date, token);
    } catch (error) {
      console.error('Failed to get current data:', error.message);
      return res
        .status(500)
        .json({ message: 'Gagal mengambil data hari ini.' });
    }

    const yesterday = getYesterday(date);
    let previousResponse;
    try {
      previousResponse = await makeSilindaApiRequest(
        market_id,
        yesterday,
        token
      );
    } catch (error) {
      console.error('Failed to get previous day data:', error.message);
      return res
        .status(500)
        .json({ message: 'Gagal mengambil data hari kemarin.' });
    }

    const currentData = currentResponse.data.data;
    const previousData = previousResponse.data.data;

    const result = currentData.map((item) => {
      const previousItem = previousData.find(
        (p) => p.commodity_id === item.commodity_id
      );
      const currentPrice = Number(item.value);
      const prevPrice = previousItem
        ? Number(previousItem.value)
        : currentPrice;

      let status = 'Tetap';
      const difference = currentPrice - prevPrice;
      let percentageDifference = 0;

      if (currentPrice > prevPrice) status = 'Naik';
      else if (currentPrice < prevPrice) status = 'Turun';

      if (prevPrice !== 0) {
        percentageDifference = (difference / prevPrice) * 100;
      } else if (currentPrice !== 0) {
        percentageDifference = 100;
      }

      item.percentage_difference = percentageDifference.toFixed(2);

      return {
        commodity_id: item.commodity_id,
        commodity_name: item.commodity_name,
        commodity_image_path: item.commodity_image_path,
        market_id: item.market_id,
        market_name: item.market_name,
        current_price: currentPrice,
        previous_price: prevPrice,
        percentage_difference: item.percentage_difference,
        status: status,
        date: item.time,
      };
    });

    res.json(result);
  } catch (error) {
    console.error('Gagal mengambil data (general catch):', error.message);
    res.status(500).json({ message: 'Gagal mengambil data' });
  }
};