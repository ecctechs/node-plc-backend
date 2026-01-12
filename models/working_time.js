module.exports = (sequelize, DataTypes) => {
  const WorkingTime = sequelize.define('WorkingTime', {
    working_days: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
      allowNull: false
    },

    start_time: {
      type: DataTypes.TIME,
      allowNull: false
    },

    end_time: {
      type: DataTypes.TIME,
      allowNull: false
    },

    break_start: {
      type: DataTypes.TIME
    },

    break_end: {
      type: DataTypes.TIME
    }
  }, {
    tableName: 'working_time',
    underscored: true,
    timestamps: true
  });

  return WorkingTime;
};
