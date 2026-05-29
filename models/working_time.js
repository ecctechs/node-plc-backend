module.exports = (sequelize, DataTypes) => {
  const WorkingTime = sequelize.define('WorkingTime', {
    schedule: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {
        monday: { working_hours: [], break_times: [] },
        tuesday: { working_hours: [], break_times: [] },
        wednesday: { working_hours: [], break_times: [] },
        thursday: { working_hours: [], break_times: [] },
        friday: { working_hours: [], break_times: [] },
        saturday: { working_hours: [], break_times: [] },
        sunday: { working_hours: [], break_times: [] }
      }
    },
    company_id: { type: DataTypes.INTEGER, allowNull: false }
  }, {
    tableName: 'working_time',
    underscored: true,
    timestamps: true
  });

  WorkingTime.associate = (models) => {
    WorkingTime.belongsTo(models.Company, { foreignKey: 'company_id', as: 'company' });
  };

  return WorkingTime;
};
