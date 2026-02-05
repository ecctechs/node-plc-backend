'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // 1. สร้างตาราง device_addresses (ถ้ายังไม่มี)
      const tables = await queryInterface.showAllTables();
      if (!tables.includes('device_addresses')) {
        await queryInterface.createTable('device_addresses', {
          id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
          device_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'devices', key: 'id' }, onDelete: 'CASCADE' },
          plc_address: { type: Sequelize.TEXT, allowNull: false },
          label: { type: Sequelize.TEXT, allowNull: true },
          data_type: { type: Sequelize.TEXT, defaultValue: 'onoff' },
          last_value: { type: Sequelize.FLOAT, allowNull: true },
          created_at: { type: Sequelize.DATE, allowNull: false },
          updated_at: { type: Sequelize.DATE, allowNull: false }
        }, { transaction });
      }

      // 2. ย้ายข้อมูลจากตาราง devices (ถ้ายังมีคอลัมน์ plc_address อยู่)
      const devTableInfo = await queryInterface.describeTable('devices');
      if (devTableInfo.plc_address) {
        const [devices] = await queryInterface.sequelize.query(
          'SELECT id, plc_address, data_display_type, last_value, created_at, updated_at FROM devices',
          { transaction }
        );

        for (const dev of devices) {
          await queryInterface.bulkInsert('device_addresses', [{
            device_id: dev.id,
            plc_address: dev.plc_address || 'M0',
            label: 'Default Address',
            data_type: dev.data_display_type || 'onoff',
            last_value: dev.last_value,
            created_at: dev.created_at,
            updated_at: dev.updated_at
          }], { transaction });
        }
      }

      // 3. ปรับปรุงตารางลูก
      const childTables = ['device_logs', 'device_number_configs', 'device_level_configs', 'device_alarm_rules', 'device_alarm_states'];
      for (const table of childTables) {
        const tableInfo = await queryInterface.describeTable(table);
        if (!tableInfo.address_id) {
          await queryInterface.addColumn(table, 'address_id', {
            type: Sequelize.INTEGER,
            references: { model: 'device_addresses', key: 'id' },
            onDelete: 'CASCADE',
            allowNull: true
          }, { transaction });
        }
        
        await queryInterface.sequelize.query(`
          UPDATE ${table} t
          SET address_id = (SELECT id FROM device_addresses WHERE device_id = t.device_id LIMIT 1)
          WHERE address_id IS NULL
        `, { transaction });

        if (tableInfo.device_id) {
          await queryInterface.removeColumn(table, 'device_id', { transaction });
        }
      }

      // 4. ลบคอลัมน์ออกจาก devices (เช็คก่อนลบ)
      if (devTableInfo.plc_address) await queryInterface.removeColumn('devices', 'plc_address', { transaction });
      if (devTableInfo.data_display_type) await queryInterface.removeColumn('devices', 'data_display_type', { transaction });
      if (devTableInfo.last_value) await queryInterface.removeColumn('devices', 'last_value', { transaction });

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // 1. กู้คืนคอลัมน์ใน devices
      const devTableInfo = await queryInterface.describeTable('devices');
      if (!devTableInfo.plc_address) await queryInterface.addColumn('devices', 'plc_address', { type: Sequelize.TEXT }, { transaction });
      if (!devTableInfo.data_display_type) await queryInterface.addColumn('devices', 'data_display_type', { type: Sequelize.TEXT, defaultValue: 'onoff' }, { transaction });
      if (!devTableInfo.last_value) await queryInterface.addColumn('devices', 'last_value', { type: Sequelize.FLOAT }, { transaction });

      // 2. ตรวจสอบว่ามีตาราง device_addresses ให้ดึงข้อมูลไหม
      const tables = await queryInterface.showAllTables();
      if (tables.includes('device_addresses')) {
        await queryInterface.sequelize.query(`
          UPDATE devices d
          SET 
            plc_address = da.plc_address,
            data_display_type = da.data_type,
            last_value = da.last_value
          FROM device_addresses da
          WHERE da.device_id = d.id
          AND da.id = (SELECT MIN(id) FROM device_addresses WHERE device_id = d.id)
        `, { transaction });
      }

      // 3. กู้คืน device_id ในตารางลูก
      const childTables = ['device_logs', 'device_number_configs', 'device_level_configs', 'device_alarm_rules', 'device_alarm_states'];
      for (const table of childTables) {
        const tableInfo = await queryInterface.describeTable(table);
        if (!tableInfo.device_id) {
          await queryInterface.addColumn(table, 'device_id', { type: Sequelize.INTEGER, references: { model: 'devices', key: 'id' }, onDelete: 'CASCADE', allowNull: true }, { transaction });
        }

        if (tables.includes('device_addresses') && tableInfo.address_id) {
          await queryInterface.sequelize.query(`
            UPDATE ${table} t
            SET device_id = da.device_id
            FROM device_addresses da
            WHERE t.address_id = da.id
          `, { transaction });
        }

        if (tableInfo.address_id) {
          await queryInterface.removeColumn(table, 'address_id', { transaction });
        }
      }

      if (tables.includes('device_addresses')) {
        await queryInterface.dropTable('device_addresses', { transaction });
      }
      
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
};