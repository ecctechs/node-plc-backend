module.exports = (sequelize, DataTypes) => {
  const DeviceLog = sequelize.define('DeviceLog', {
    // 1. ค่าที่อ่านได้จริง (เก็บเป็น Float เพื่อรองรับทั้ง M และ D)
    value: {
      type: DataTypes.FLOAT,
      allowNull: true // เปลี่ยนเป็น true เพราะถ้าสถานะเป็น 0 ค่าอาจจะเป็น null
    },

    // 2. สถานะการเชื่อมต่อ (Quality Code): 1=Good, 0=Bad (Link Down)
    status: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      comment: "1=Good, 0=Bad/Link Down"
    },

    // 3. เวลาที่บันทึกข้อมูล (Precision Timestamp)
    // แนะนำให้ใช้ DATETIME(3) เพื่อเก็บระดับ Milliseconds
    created_at: {
      type: DataTypes.DATE(3),
      defaultValue: DataTypes.NOW,
      field: 'created_at'
    }
  }, {
    tableName: 'device_logs',
    underscored: true,
    timestamps: false, // เราคุมเองผ่าน createdAt ด้านบน
    indexes: [
      // สำคัญมาก: ต้องทำ Index ที่ address_id และ created_at เพื่อให้ดึงกราฟเร็ว
      {
        fields: ['address_id', 'created_at']
      }
    ]
  });

  DeviceLog.associate = (models) => {
    DeviceLog.belongsTo(models.DeviceAddress, { 
        foreignKey: 'address_id', 
        as: 'address' 
    });
  };

  return DeviceLog;
};