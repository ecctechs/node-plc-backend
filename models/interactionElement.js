module.exports = (sequelize, DataTypes) => {
  const InteractionElement = sequelize.define('InteractionElement', {
    layout_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    element_type: {
      type: DataTypes.STRING(50),
      allowNull: false
      // 'status_lamp', 'number_display', 'control_button'
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: true
      // ชื่อ element เช่น "Motor Status"
    },
    // Position (%)
    x_percent: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false
      // 0-100
    },
    y_percent: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false
      // 0-100
    },
    // Size & Style
    size_width: {
      type: DataTypes.INTEGER,
      allowNull: true
      // ขนาด width
    },
    size_height: {
      type: DataTypes.INTEGER,
      allowNull: true
      // ขนาด height
    },
    font_size: {
      type: DataTypes.INTEGER,
      allowNull: true
      // สำหรับ text
    },
    bg_color: {
      type: DataTypes.STRING(20),
      allowNull: true
      // background color
    },
    text_color: {
      type: DataTypes.STRING(20),
      allowNull: true
      // text color
    },
    // Element Specific
    unit: {
      type: DataTypes.STRING(20),
      allowNull: true
      // สำหรับ number display
    },
    precision: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
      // ทศนิยม
    },
    // Control Button Specific
    active_color: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    inactive_color: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    button_label: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    // PLC Link
    device_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    address_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    display_order: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    is_visible: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  }, {
    tableName: 'interaction_elements',
    underscored: true,
    timestamps: true
  });

  InteractionElement.associate = (models) => {
    InteractionElement.belongsTo(models.InteractionLayout, {
      foreignKey: 'layout_id',
      as: 'layout',
      onDelete: 'CASCADE'
    });
    
    InteractionElement.belongsTo(models.Device, {
      foreignKey: 'device_id',
      as: 'device',
      onDelete: 'SET NULL'
    });
    
    InteractionElement.belongsTo(models.DeviceAddress, {
      foreignKey: 'address_id',
      as: 'address',
      onDelete: 'SET NULL'
    });
  };

  return InteractionElement;
};
