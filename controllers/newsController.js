import News from '../models/news.js';
import Admin from '../models/admin.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads/news'); // Path ke folder uploads/news

    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `newsImage-${Date.now()}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Hanya file gambar yang diizinkan!'), false);
  }
};

export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

export const getNews = async (req, res) => {
  try {
    const news = await News.findAll({
      include: {
        model: Admin,
        attributes: ['id', 'username'],
      },
      order: [['createdAt', 'DESC']],
    });
    res.json(news);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error fetching news:', error);
    res.status(500).json({ message: 'Gagal mengambil daftar berita' });
  }
};

export const getNewsById = async (req, res) => {
  try {
    const newsItem = await News.findByPk(req.params.id, {
      include: {
        model: Admin,
        attributes: ['id', 'username'],
      },
    });
    if (newsItem) {
      res.json(newsItem);
    } else {
      res.status(404).json({ message: 'Berita tidak ditemukan' });
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error fetching single news:', error);
    res.status(500).json({ message: 'Gagal mengambil detail berita' });
  }
};

export const createNews = async (req, res) => {
  const { title, content } = req.body;

  const imageUrl = req.file ? `uploads/news/${req.file.filename}` : null; 

  if (!title || !content) {
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    return res
      .status(400)
      .json({ message: 'Judul dan konten berita wajib diisi.' });
  }

  if (!req.user || req.user.role !== 'admin') {
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    return res
      .status(403)
      .json({
        message: 'Tidak diizinkan. Hanya admin yang dapat membuat berita.',
      });
  }

  try {
    const newsItem = await News.create({
      title,
      content,
      imageUrl,
      userId: req.user.id,
    });

    // eslint-disable-next-line no-console
    console.log(
      'New news created by',
      req.user.username,
      ':',
      newsItem.toJSON()
    );
    res
      .status(201)
      .json({
        message: 'Berita berhasil ditambahkan',
        news: newsItem.toJSON(),
      });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error creating news:', error);
    res
      .status(500)
      .json({ message: 'Gagal menambahkan berita', error: error.message });
  }
};

export const updateNews = async (req, res) => {
  const { title, content } = req.body;
  const newsId = req.params.id;

  if (!req.user || req.user.role !== 'admin') {
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    return res
      .status(403)
      .json({
        message: 'Tidak diizinkan. Hanya admin yang dapat memperbarui berita.',
      });
  }
  if (!title || !content) {
    return res
      .status(400)
      .json({ message: 'Judul dan konten berita tidak boleh kosong.' });
  }

  try {
    const newsItem = await News.findByPk(newsId);

    if (!newsItem) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({ message: 'Berita tidak ditemukan' });
    }

    if (req.file && newsItem.imageUrl) {
      const oldImagePath = path.join(__dirname, '..', newsItem.imageUrl);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
        // eslint-disable-next-line no-console
        console.log('Old image deleted:', oldImagePath);
      }
    }

    newsItem.title = title;
    newsItem.content = content;
    newsItem.imageUrl = req.file ? `uploads/news/${req.file.filename}` : newsItem.imageUrl;

    const updatedNews = await newsItem.save();

    // eslint-disable-next-line no-console
    console.log('News updated:', updatedNews.toJSON());
    res.json({
      message: 'Berita berhasil diperbarui',
      news: updatedNews.toJSON(),
    });
  } catch (error) {
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    // eslint-disable-next-line no-console
    console.error('Error updating news:', error);
    res
      .status(500)
      .json({ message: 'Gagal memperbarui berita', error: error.message });
  }
};

export const deleteNews = async (req, res) => {
  if (!req.user || req.user.role !== 'admin') {
    return res
      .status(403)
      .json({
        message: 'Tidak diizinkan. Hanya admin yang dapat menghapus berita.',
      });
  }

  try {
    const newsItem = await News.findByPk(req.params.id);

    if (!newsItem) {
      return res.status(404).json({ message: 'Berita tidak ditemukan' });
    }

    if (newsItem.imageUrl) {
      const imagePathToDelete = path.join(__dirname, '..', newsItem.imageUrl);
      if (fs.existsSync(imagePathToDelete)) {
        fs.unlinkSync(imagePathToDelete);
        // eslint-disable-next-line no-console
        console.log('Associated image deleted:', imagePathToDelete);
      }
    }
        
    await newsItem.destroy();

    // eslint-disable-next-line no-console
    console.log('News deleted:', req.params.id);
    res.json({ message: 'Berita berhasil dihapus' });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error deleting news:', error);
    res
      .status(500)
      .json({ message: 'Gagal menghapus berita', error: error.message });
  }
};
