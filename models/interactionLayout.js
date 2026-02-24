module.exports = (sequelize, DataTypes) => {
  const InteractionLayout = sequelize.define('InteractionLayout', {
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      // ชื่อ layout เช่น "TPM Line 1"
    },
    machine_image: {
      type: DataTypes.STRING(500),
      allowNull: true,
      // path ของรูป background
    },
    aspect_ratio_width: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 16,
      // aspect ratio ส่วนกว้าง
    },
    aspect_ratio_height: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 9,
      // aspect ratio ส่วนสูง
    }
  }, {
    tableName: 'interaction_layouts',
    underscored: true,
    timestamps: true
  });

  InteractionLayout.associate = (models) => {
    InteractionLayout.hasMany(models.InteractionElement, {
      foreignKey: 'layout_id',
      as: 'elements',
      onDelete: 'CASCADE'
    });
  };

  return InteractionLayout;
};
