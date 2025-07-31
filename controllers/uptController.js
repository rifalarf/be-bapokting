import Upt from '../models/maps.js';

export const getUptLocations = async (req, res) => {
  try {
    const upts = await Upt.findAll();
    const formattedUpts = upts.map((upt) => ({
      id: upt.id,
      namaPasar: upt.namaPasar,
      wilayahPasar: upt.wilayahPasar,
      namaUpt: upt.namaUpt,
      kepalaUpt: upt.kepalaUpt,
      alamatUpt: upt.alamatUpt,
      noHp: upt.noHp,
      latitude: upt.location.coordinates[1],
      longitude: upt.location.coordinates[0],
    }));
    res.json(formattedUpts);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error fetching UPT locations:', error);
    res.status(500).json({ message: 'Gagal mengambil lokasi UPT' });
  }
};

export const getUptById = async (req, res) => {
  try {
    const upt = await Upt.findByPk(req.params.id);
    if (upt) {
      res.json({
        id: upt.id,
        namaPasar: upt.namaPasar,
        wilayahPasar: upt.wilayahPasar,
        namaUpt: upt.namaUpt,
        kepalaUpt: upt.kepalaUpt,
        alamatUpt: upt.alamatUpt,
        noHp: upt.noHp,
        latitude: upt.location.coordinates[1],
        longitude: upt.location.coordinates[0],
      });
    } else {
      res.status(404).json({ message: 'Lokasi UPT tidak ditemukan' });
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error fetching single UPT location:', error);
    res.status(500).json({ message: error.message });
  }
};

export const createUpt = async (req, res) => {
  const {
    namaPasar,
    wilayahPasar,
    namaUpt,
    kepalaUpt,
    alamatUpt,
    noHp,
    latitude,
    longitude,
  } = req.body;

  if (
    !namaPasar ||
    !wilayahPasar ||
    !namaUpt ||
    !alamatUpt ||
    !latitude ||
    !longitude
  ) {
    return res.status(400).json({
      message:
        'Mohon lengkapi semua data wajib (nama pasar, wilayah pasar, nama UPT, alamat, latitude, longitude).',
    });
  }

  try {
    const upt = await Upt.create({
      namaPasar,
      wilayahPasar,
      namaUpt,
      kepalaUpt,
      alamatUpt,
      noHp,
      location: {
        type: 'Point',
        coordinates: [longitude, latitude],
        crs: { type: 'name', properties: { name: 'EPSG:4326' } },
      },
    });

    // eslint-disable-next-line no-console
    console.log('New UPT created:', upt.toJSON());

    res
      .status(201)
      .json({ message: 'UPT berhasil ditambahkan', upt: upt.toJSON() });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error creating UPT:', error);
    res
      .status(500)
      .json({ message: 'Gagal menambahkan lokasi UPT', error: error.message });
  }
};

export const updateUpt = async (req, res) => {
  const {
    namaPasar,
    wilayahPasar,
    namaUpt,
    kepalaUpt,
    alamatUpt,
    noHp,
    latitude,
    longitude,
  } = req.body;

  try {
    const upt = await Upt.findByPk(req.params.id);

    if (!upt) {
      return res.status(404).json({ message: 'Lokasi UPT tidak ditemukan' });
    }

    upt.namaPasar = namaPasar || upt.namaPasar;
    upt.wilayahPasar = wilayahPasar || upt.wilayahPasar;
    upt.namaUpt = namaUpt || upt.namaUpt;
    upt.kepalaUpt = kepalaUpt || upt.kepalaUpt;
    upt.alamatUpt = alamatUpt || upt.alamatUpt;
    upt.noHp = noHp || upt.noHp;

    if (latitude !== undefined && longitude !== undefined) {
      upt.location = {
        type: 'Point',
        coordinates: [longitude, latitude],
        crs: { type: 'name', properties: { name: 'EPSG:4326' } },
      };
    }

    const updatedUpt = await upt.save();

    // eslint-disable-next-line no-console
    console.log('UPT updated:', updatedUpt.toJSON());
    res.json({ message: 'UPT berhasil diperbarui', upt: updatedUpt.toJSON() });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error updating UPT:', error);
    res
      .status(500)
      .json({ message: 'Gagal memperbarui lokasi UPT', error: error.message });
  }
};

export const deleteUpt = async (req, res) => {
  try {
    const upt = await Upt.findByPk(req.params.id);

    if (!upt) {
      return res.status(404).json({ message: 'Lokasi UPT tidak ditemukan' });
    }

    await upt.destroy();

    // eslint-disable-next-line no-console
    console.log('UPT deleted:', req.params.id);
    res.json({ message: 'UPT berhasil dihapus' });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error deleting UPT:', error);
    res
      .status(500)
      .json({ message: 'Gagal menghapus lokasi UPT', error: error.message });
  }
};
