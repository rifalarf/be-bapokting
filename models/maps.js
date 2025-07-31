import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const Maps = sequelize.define(
  'Upt',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    namaPasar: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    wilayahPasar: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    namaUpt: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    kepalaUpt: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    alamatUpt: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    noHp: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    location: {
      type: DataTypes.GEOMETRY('Point', 4326),
      allowNull: false,
    },
  },
  {
    tableName: 'upts',
    timestamps: true,
  }
);

export default Maps;
