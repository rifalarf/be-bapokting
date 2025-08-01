import getToken, { clearCachedToken } from '../services/tokenService.js';
import axios from 'axios';

export const getCommodityList = async (req, res) => {
  try {
    const token = await getToken();
    const response = await axios.post(
      'https://api-splp.layanan.go.id/t/jabarprov.go.id/silinda/1/api_v2/commodity/find',
      {
        page: 1,
        length: 100,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const commodities = response.data.data.map((item) => ({
      id: item.id,
      name: item.name,
      unit: item.unit,
      image_path: item.image_path,
    }));

    res.json(commodities);
  } catch (error) {
    if (error.response?.status === 401) {
        try {
            console.warn('401 detected in getCommodityList, refreshing token...');
            clearCachedToken();
            const newToken = await getToken();
            const retryResponse = await axios.post(
                'https://api-splp.layanan.go.id/t/jabarprov.go.id/silinda/1/api_v2/commodity/find',
                { page: 1, length: 100 },
                {
                    headers: {
                        Authorization: `Bearer ${newToken}`,
                        'Content-Type': 'application/json',
                    },
                }
            );
            const commodities = retryResponse.data.data.map((item) => ({
                id: item.id,
                name: item.name,
                unit: item.unit,
                image_path: item.image_path,
            }));
            return res.json(commodities);
        } catch (retryError) {
             console.error('Gagal mengambil daftar komoditas setelah retry:', retryError.message);
        }
    }
    
    console.error('Gagal mengambil daftar komoditas:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
    res.status(500).json({ message: 'Gagal mengambil daftar komoditas' });
  }
};