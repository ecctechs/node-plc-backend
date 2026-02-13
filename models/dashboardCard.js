module.exports = (sequelize, DataTypes) => {
  const DashboardCard = sequelize.define('DashboardCard', {
    user_id: DataTypes.INTEGER,
    device_id: DataTypes.INTEGER,
    address_id: DataTypes.INTEGER,
    display_type: DataTypes.STRING,
    position: DataTypes.INTEGER,
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'dashboard_cards',
    underscored: true,
    timestamps: true
  });

  DashboardCard.associate = (models) => {
    DashboardCard.belongsTo(models.DeviceAddress, {
      foreignKey: 'address_id',
      as: 'address',
      onDelete: 'CASCADE'
    });
    
  };
  

  return DashboardCard;
};
