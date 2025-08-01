import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import News from '../models/news.js';
import Admin from '../models/admin.js';

// Konfigurasi Cloudinary akan otomatis dibaca dari Heroku Config Vars
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Konfigurasi penyimpanan ke Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'bapokting-news', // Nama folder di Cloudinary
    format: async (req, file) => 'png', // Mengubah semua gambar menjadi png
    public_id: (req, file) => `newsImage-${Date.now()}`,
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Hanya file gambar yang diizinkan!'), false);
  }
};

// Inisialisasi Multer dengan penyimpanan Cloudinary
export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

export const getNews = async (req, res) => {
  try {
    const news = await News.findAll({
      include: { model: Admin, attributes: ['id', 'username'] },
      order: [['createdAt', 'DESC']],
    });
    res.json(news);
  } catch (error) {
    console.error('Error fetching news:', error);
    res.status(500).json({ message: 'Gagal mengambil daftar berita' });
  }
};

export const getNewsById = async (req, res) => {
    try {
        const newsItem = await News.findByPk(req.params.id, {
        include: { model: Admin, attributes: ['id', 'username'] },
        });
        if (newsItem) {
        res.json(newsItem);
        } else {
        res.status(404).json({ message: 'Berita tidak ditemukan' });
        }
    } catch (error) {
        console.error('Error fetching single news:', error);
        res.status(500).json({ message: 'Gagal mengambil detail berita' });
    }
};

export const createNews = async (req, res) => {
  const { title, content } = req.body;
  const imageUrl = req.file ? req.file.path : null; // URL gambar sekarang dari Cloudinary

  if (!title || !content) {
    return res.status(400).json({ message: 'Judul dan konten berita wajib diisi.' });
  }

  try {
    const newsItem = await News.create({
      title,
      content,
      imageUrl, // Simpan URL dari Cloudinary
      userId: req.user.id,
    });
    res.status(201).json({ message: 'Berita berhasil ditambahkan', news: newsItem.toJSON() });
  } catch (error) {
    console.error('Error creating news:', error);
    res.status(500).json({ message: 'Gagal menambahkan berita', error: error.message });
  }
};

export const updateNews = async (req, res) => {
    const { title, content } = req.body;
    const newsId = req.params.id;

    try {
        const newsItem = await News.findByPk(newsId);
        if (!newsItem) {
            return res.status(404).json({ message: 'Berita tidak ditemukan' });
        }

        if (req.file) {
            newsItem.imageUrl = req.file.path;
        }

        newsItem.title = title || newsItem.title;
        newsItem.content = content || newsItem.content;

        const updatedNews = await newsItem.save();
        res.json({ message: 'Berita berhasil diperbarui', news: updatedNews.toJSON() });

    } catch (error) {
        console.error('Error updating news:', error);
        res.status(500).json({ message: 'Gagal memperbarui berita', error: error.message });
    }
};

export const deleteNews = async (req, res) => {
    try {
        const newsItem = await News.findByPk(req.params.id);
        if (!newsItem) {
            return res.status(404).json({ message: 'Berita tidak ditemukan' });
        }

        await newsItem.destroy();
        res.json({ message: 'Berita berhasil dihapus' });
    } catch (error) {
        console.error('Error deleting news:', error);
        res.status(500).json({ message: 'Gagal menghapus berita', error: error.message });
    }
};