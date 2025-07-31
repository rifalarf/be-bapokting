import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
import Admin from './admin.js';

const News = sequelize.define(
  'News',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    // Relasi dengan User (Admin) yang mengunggah berita
    userId: {
      type: DataTypes.UUID,
      references: {
        model: Admin,
        key: 'id',
      },
      allowNull: false,
    },
  },
  {
    tableName: 'news',
    timestamps: true,
  }
);

// Definisikan relasi: 1 : M news
Admin.hasMany(News, { foreignKey: 'userId', onDelete: 'CASCADE' });
News.belongsTo(Admin, { foreignKey: 'userId' });

export default News;
