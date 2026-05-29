'use strict';

module.exports = {
  async up(queryInterface) {
    // ลบ unique constraint เดิมที่ชื่อว่า roles_name_key (PostgreSQL default)
    await queryInterface.sequelize.query(
      `ALTER TABLE roles DROP CONSTRAINT IF EXISTS roles_name_key`
    );
    // เพิ่ม composite unique (name, company_id)
    await queryInterface.addIndex('roles', ['name', 'company_id'], {
      unique: true,
      name: 'roles_name_company_id_unique'
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('roles', 'roles_name_company_id_unique');
    await queryInterface.addIndex('roles', ['name'], {
      unique: true,
      name: 'roles_name_key'
    });
  }
};
