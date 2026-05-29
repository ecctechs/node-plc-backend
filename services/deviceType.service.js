const deviceTypeRepo = require('../repositories/deviceType.repo');
const deviceRepo = require('../repositories/device.repo');
const dashboardRepo = require('../repositories/dashboard.repository');

exports.getAll = async (companyId) => {
  return await deviceTypeRepo.findAll(companyId);
};

exports.getById = async (id, companyId) => {
  const deviceType = await deviceTypeRepo.findById(id);
  if (!deviceType || deviceType.company_id !== companyId) throw { status: 404, message: 'Device type not found' };
  return deviceType;
};

exports.create = async (data, companyId) => {
  const { name } = data;

  if (!name) {
    throw { status: 400, message: 'กรุณาระบุชื่อประเภทอุปกรณ์ (name)' };
  }

  const existing = await deviceTypeRepo.findByName(name, companyId);
  if (existing) {
    throw { status: 409, message: 'ชื่อประเภทอุปกรณ์นี้มีอยู่แล้ว กรุณาใช้ชื่ออื่น' };
  }

  return await deviceTypeRepo.create({ ...data, company_id: companyId });
};

exports.update = async (id, companyId, data) => {
  const deviceType = await deviceTypeRepo.findById(id);
  if (!deviceType || deviceType.company_id !== companyId) {
    throw { status: 404, message: 'ไม่พบประเภทอุปกรณ์นี้' };
  }

  if (data.is_active !== undefined && data.is_active === false && deviceType.is_active === true) {
    const devices = await deviceRepo.findByDeviceTypeId(id);
    if (devices && devices.length > 0) {
      const deviceNames = devices.map(d => d.name).join(', ');
      throw { status: 409, message: 'ไม่สามารถปิดการใช้งานประเภทอุปกรณ์นี้ได้ เนื่องจากมีอุปกรณ์ที่ใช้งานอยู่: ' + deviceNames };
    }
  }

  if (data.display_types && JSON.stringify(data.display_types) !== JSON.stringify(deviceType.display_types)) {
    const currentTypes = deviceType.display_types || [];
    const newTypes = data.display_types || [];
    const removedTypes = currentTypes.filter(type => !newTypes.includes(type));

    if (removedTypes.length > 0) {
      const addresses = await dashboardRepo.findAddressesByDeviceTypeAndDisplayTypes(id, removedTypes);
      if (addresses && addresses.length > 0) {
        const errorMessages = addresses.map(addr =>
          addr.label + ' กำลังใช้งาน  ' + addr.data_type + ' อยู่ ไม่สามารถลบได้'
        ).join(', ');
        throw { status: 409, message: errorMessages };
      }
    }
  }

  if (data.name && data.name !== deviceType.name) {
    const existing = await deviceTypeRepo.findByName(data.name, companyId);
    if (existing) {
      throw { status: 409, message: 'ชื่อประเภทอุปกรณ์นี้มีอยู่แล้ว กรุณาใช้ชื่ออื่น' };
    }
  }

  await deviceTypeRepo.update(id, data);
  return await deviceTypeRepo.findById(id);
};

exports.delete = async (id, companyId) => {
  const deviceType = await deviceTypeRepo.findById(id);
  if (!deviceType || deviceType.company_id !== companyId) {
    throw { status: 404, message: 'Device type not found' };
  }

  const displayTypes = deviceType.display_types || [];
  if (displayTypes.length > 0) {
    const addresses = await dashboardRepo.findAddressesByDeviceTypeAndDisplayTypes(id, displayTypes);
    if (addresses && addresses.length > 0) {
      const errorMessages = addresses.map(addr =>
        addr.label + ' กำลังใช้งาน data_type ' + addr.data_type + ' อยู่ ไม่สามารถลบได้'
      ).join(', ');
      throw { status: 409, message: errorMessages };
    }
  }

  await deviceTypeRepo.delete(id);
  return { success: true, message: 'Device type deleted' };
};
