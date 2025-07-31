import Admin from '../models/admin.js';
import jwt from 'jsonwebtoken';
// import nodemailer from 'nodemailer';
// import crypto from 'crypto';

const generateToken = (id, username, role) => {
  return jwt.sign({ id, username, role }, process.env.JWT_SECRET, {
    expiresIn: '1d',
  });
};

// @route   POST /api/auth/login
export const loginAdmin = async (req, res) => {
  const { username, password } = req.body;
  try {
    const admin = await Admin.findOne({ where: { username } });

    // Cek apakah admin ditemukan
    if (!admin) {
      return res.status(401).json({ message: 'Username tidak ditemukan' });
    }

    const isMatch = await admin.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Password salah' });
    }

    // Kirim response sukses dengan token dan info admin
    res.json({
      id: admin.id,
      username: admin.username,
      role: admin.role,
      token: generateToken(admin.id, admin.username, admin.role),
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Login error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan saat login' });
  }
};

// @desc    Request Password Reset
// @route   POST /api/auth/forgot-password
// export const forgotPassword = async (req, res) => {
//     const { email } = req.body;

//     try {
//         const admin = await Admin.findOne({ where: { email } });

//         if (!admin) {
//             return res.status(200).json({ message: 'Jika email terdaftar, link reset akan dikirim.' });
//         }

//         // Dapatkan token reset password dari model Admin
//         const resetToken = admin.getResetPasswordToken();

//         // Simpan token yang di-hash dan waktu kadaluarsa ke database
//         await admin.save();

//         // URL untuk reset password di frontend
//         const resetURL = `${req.protocol}://${req.get('host')}/reset-password?token=${resetToken}`;
//         // Jika Anda punya domain frontend terpisah, gunakan itu:
//         // const resetURL = `http://localhost:3000/reset-password?token=${resetToken}`; // Ganti dengan URL frontend React Anda

//         const message = `Anda menerima email ini karena Anda (atau orang lain) meminta reset password untuk akun Anda.\n\n` +
//                         `Silakan klik link berikut, atau salin dan tempel di browser Anda:\n\n${resetURL}\n\n` +
//                         `Link ini akan kadaluarsa dalam 15 menit.\n\n` +
//                         `Jika Anda tidak meminta ini, silakan abaikan email ini.`;

//         try {
//             // Buat transporter Nodemailer
//             const transporter = nodemailer.createTransport({
//                 service: 'gmail',
//                 auth: {
//                     user: process.env.EMAIL_USER,
//                     pass: process.env.EMAIL_PASS,
//                 },
//             });

//             // Opsi email
//             const mailOptions = {
//                 to: admin.email,
//                 from: process.env.EMAIL_USER,
//                 subject: 'Permintaan Reset Password',
//                 text: message,
//             };

//             // Kirim email
//             await transporter.sendMail(mailOptions);

//             res.status(200).json({ message: 'Link reset password berhasil dikirim ke email Anda.' });
//         } catch (mailError) {
//             console.error('Error sending email:', mailError);
//             // Jika ada masalah pengiriman email, hapus token dari DB agar bisa dicoba lagi
//             admin.resetPasswordToken = null;
//             admin.resetPasswordExpire = null;
//             await admin.save();
//             return res.status(500).json({ message: 'Terjadi kesalahan saat mengirim email reset password.' });
//         }

//     } catch (error) {
//         console.error('Forgot password error:', error);
//         res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
//     }
// };

// // @desc    Reset Password
// // @route   PUT /api/auth/reset-password/:token
// // @access  Public
// export const resetPassword = async (req, res) => {
//     // Hash token yang diterima dari URL dan bandingkan dengan yang di database
//     const resetPasswordToken = crypto
//         .createHash('sha256')
//         .update(req.params.token)
//         .digest('hex');

//     try {
//         const admin = await Admin.findOne({
//             where: {
//                 resetPasswordToken: resetPasswordToken,
//                 resetPasswordExpire: {
//                     [sequelize.Op.gt]: Date.now() // Pastikan token belum kadaluarsa
//                 }
//             },
//         });

//         if (!admin) {
//             return res.status(400).json({ message: 'Token reset password tidak valid atau sudah kadaluarsa.' });
//         }

//         // Pastikan password baru disediakan
//         if (!req.body.password) {
//             return res.status(400).json({ message: 'Mohon masukkan password baru.' });
//         }

//         // Set password baru
//         admin.password = req.body.password;
//         // Hapus token reset dan waktu kadaluarsa
//         admin.resetPasswordToken = null;
//         admin.resetPasswordExpire = null;

//         await admin.save();

//         res.status(200).json({ message: 'Password berhasil direset. Silakan login dengan password baru Anda.' });
//     } catch (error) {
//         console.error('Reset password error:', error);
//         res.status(500).json({ message: 'Terjadi kesalahan saat mereset password.' });
//     }
// };
