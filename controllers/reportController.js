import getToken from '../services/tokenService.js';
import axios from 'axios';
import ExcelJS from 'exceljs';

const pasarList = [
  { id: '170', name: 'Guntur' },
  { id: '171', name: 'Kadungora' },
  { id: '172', name: 'Wanaraja' },
  { id: '173', name: 'Pameungpeuk' },
];

function getYesterday(dateStr) {
  const date = new Date(dateStr);
  date.setDate(date.getDate() - 1);
  return date.toISOString().split('T')[0];
}

// eslint-disable-next-line camelcase
function getUnitByCommodityId(commodity_id) {
  const literIds = ['7', '26'];
  const butirIds = ['29'];
  const gr397Ids = ['30'];
  const bungkusIds = ['37'];
  const kalengIds = ['96'];
  const gr400Ids = ['106'];

  if (literIds.includes(commodity_id)) return 'liter';
  if (butirIds.includes(commodity_id)) return 'butir';
  if (gr397Ids.includes(commodity_id)) return '397 gr/kl';
  if (bungkusIds.includes(commodity_id)) return 'bungkus';
  if (kalengIds.includes(commodity_id)) return 'kaleng';
  if (gr400Ids.includes(commodity_id)) return '400 gr';
  return 'kg';
}

export const fetchReportHandler = async (req, res) => {
  let token;
  try {
    const { date } = req.body;
    if (!date) return res.status(400).json({ message: 'Tanggal diperlukan' });

    token = await getToken();

    const makeSilindaApiRequest = async (
      // eslint-disable-next-line camelcase
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
          { length: 1000, market_id, time, page: 1 },
          config
        );
        return response;
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(
          `Error in Silinda API request (isRetry: ${isRetry}):`,
          error.response?.status,
          error.message
        );

        if (error.response?.status === 401 && !isRetry) {
          // eslint-disable-next-line no-console
          console.warn(
            '401 detected, attempting to refresh token and retry...'
          );
          token = await getToken();
          return await makeSilindaApiRequest(market_id, time, token, true);
        }
        throw error;
      }
    };

    const yesterday = getYesterday(date);
    const dataToday = {};
    const dataYesterday = {};

    for (const pasar of pasarList) {
      try {
        dataToday[pasar.id] =
          (await makeSilindaApiRequest(pasar.id, date, token)).data.data || [];
        dataYesterday[pasar.id] =
          (await makeSilindaApiRequest(pasar.id, yesterday, token)).data.data ||
          [];
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(
          `Failed to fetch data for market ${pasar.name}:`,
          error.message
        );
        dataToday[pasar.id] = [];
        dataYesterday[pasar.id] = [];
      }
    }

    const reportMap = new Map();

    for (const pasar of pasarList) {
      const nowList = dataToday[pasar.id];
      const prevList = dataYesterday[pasar.id];

      nowList.forEach((item) => {
        let reportItem = reportMap.get(item.commodity_id);
        if (!reportItem) {
          reportItem = {
            commodity_id: item.commodity_id,
            commodity_name: item.commodity_name,
            unit: getUnitByCommodityId(item.commodity_id),
            prices: {},
            current_price: 0,
            previous_price: 0,
            difference: 0,
            percentage_difference: '0.00',
            status: 'Tetap',
          };
          reportMap.set(item.commodity_id, reportItem);
        }

        const nowValue = Number(item.value) || 0;
        reportItem.prices[pasar.id] = nowValue;
        reportItem.current_price += nowValue;

        const prevItem = prevList.find(
          (p) => p.commodity_id === item.commodity_id
        );
        const prevValue = prevItem ? Number(prevItem.value) : 0;
        reportItem.previous_price += prevValue;
      });
    }

    // Hitung rata-rata, selisih, status, dan persentase
    const pasarCount = pasarList.length;
    reportMap.forEach((item) => {
      item.current_price = item.current_price / pasarCount;
      item.previous_price = item.previous_price / pasarCount;
      item.difference = item.current_price - item.previous_price;

      let percentage = 0;
      if (item.previous_price !== 0) {
        percentage = (item.difference / item.previous_price) * 100;
      } else if (item.current_price !== 0) {
        percentage = 100;
      }
      item.percentage_difference = percentage.toFixed(2);

      if (item.difference > 0) item.status = 'Naik';
      else if (item.difference < 0) item.status = 'Turun';
      else item.status = 'Tetap';
    });

    res.json(Array.from(reportMap.values()));
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Gagal mengambil laporan:', error.message);
    res.status(500).json({ message: 'Gagal mengambil laporan' });
  }
};

// Handler export ke Excel
export const exportExcelHandler = async (req, res) => {
  try {
    const { reportData } = req.body;
    if (!reportData || !Array.isArray(reportData)) {
      return res.status(400).json({ message: 'Data laporan tidak valid' });
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Laporan Harga Komoditi');

    // Header kolom
    worksheet.columns = [
      { header: 'No', key: 'no', width: 5 },
      { header: 'Komoditi', key: 'commodity_name', width: 30 },
      { header: 'Satuan', key: 'unit', width: 12 },
      ...pasarList.map((p) => ({ header: p.name, key: p.id, width: 14 })),
      { header: 'Rata-rata Hari Ini', key: 'current_price', width: 18 },
      { header: 'Rata-rata Sebelumnya', key: 'previous_price', width: 20 },
      { header: 'Selisih', key: 'difference', width: 12 },
      { header: 'Selisih (%)', key: 'percentage_difference', width: 15 },
      { header: 'Keterangan', key: 'status', width: 14 },
    ];

    reportData.forEach((item, index) => {
      worksheet.addRow({
        no: index + 1,
        commodity_name: item.commodity_name,
        unit: item.unit,
        ...pasarList.reduce((acc, p) => {
          acc[p.id] = item.prices[p.id] || 0;
          return acc;
        }, {}),
        current_price: item.current_price,
        previous_price: item.previous_price,
        difference: item.difference,
        percentage_difference: item.percentage_difference,
        status: item.status,
      });
    });

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=Laporan-Komoditas.xlsx'
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Gagal export ke Excel:', error.message);
    res.status(500).json({ message: 'Gagal export ke Excel' });
  }
};