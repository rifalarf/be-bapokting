import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
import bcrypt from 'bcryptjs';
// import crypto from 'crypto';

const Admin = sequelize.define(
  'Admin',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    // email: {
    //     type: DataTypes.STRING,
    //     allowNull: true,
    //     unique: true,
    //     validate: {
    //         isEmail: true
    //     }
    // },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'admin',
    },
    // resetPasswordToken: {
    //     type: DataTypes.STRING,
    //     allowNull: true,
    // },
    // resetPasswordExpire: {
    //     type: DataTypes.DATE,
    //     allowNull: true,
    // },
  },
  {
    tableName: 'admins',
    timestamps: true,
    hooks: {
      beforeCreate: async (adminInstance) => {
        if (adminInstance.password) {
          const salt = await bcrypt.genSalt(10);
          adminInstance.password = await bcrypt.hash(
            adminInstance.password,
            salt
          );
        }
      },
      beforeUpdate: async (adminInstance) => {
        if (adminInstance.changed('password')) {
          const salt = await bcrypt.genSalt(10);
          adminInstance.password = await bcrypt.hash(
            adminInstance.password,
            salt
          );
        }
      },
    },
  }
);

Admin.prototype.matchPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

//menghasilkan dan menyimpan reset password
// Admin.prototype.getResetPasswordToken = function() {
//     const resetToken = crypto.randomBytes(20).toString('hex');
//     this.resetPasswordToken = crypto
//         .createHash('sha256')
//         .update(resetToken)
//         .digest('hex');
//     this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

//     return resetToken;
// }

export default Admin;
