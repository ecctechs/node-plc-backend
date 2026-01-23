'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('device_alarm_rules', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },

      device_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'devices',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },

      name: {
        type: Sequelize.STRING,
        allowNull: false
      },

      data_type: {
        type: Sequelize.STRING, // onoff | number | level
        allowNull: false
      },

      condition_type: {
        type: Sequelize.STRING, // EXACT | MT | MTE | LT | LTE | BTW | LEVEL
        allowNull: false
      },

      min_value: {
        type: Sequelize.FLOAT,
        allowNull: true
      },

      max_value: {
        type: Sequelize.FLOAT,
        allowNull: true
      },

      level_index: {
        type: Sequelize.INTEGER,
        allowNull: true
      },

      duration_sec: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0   // debounce
      },

      repeat_interval_sec: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 900 // cooldown (15 นาที)
      },

      severity: {
        type: Sequelize.STRING, // info | warning | critical
        allowNull: false,
        defaultValue: 'warning'
      },

      notify_email: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },

      email_recipients: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: true
      },

      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },

      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('now')
      },

      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('now')
      }
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('device_alarm_rules');
  }
};
