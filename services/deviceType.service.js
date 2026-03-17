const deviceTypeRepo = require('../repositories/deviceType.repo');
const deviceRepo = require('../repositories/device.repo');
const dashboardRepo = require('../repositories/dashboard.repository');

exports.getAll = async () => {
  return await deviceTypeRepo.findAll();
};

exports.getById = async (id) => {
  const deviceType = await deviceTypeRepo.findById(id);
  if (!deviceType) throw { status: 404, message: 'Device type not found' };
  return deviceType;
};

exports.create = async (data) => {
  const { name } = data;

  if (!name) {
    throw { status: 400, message: 'กรุณาระบุชื่อประเภทอุปกรณ์ (name)' };
  }

  // Check if name already exists
  const existing = await deviceTypeRepo.findByName(name);
  if (existing) {
    throw { status: 409, message: 'ชื่อประเภทอุปกรณ์นี้มีอยู่แล้ว กรุณาใช้ชื่ออื่น' };
  }

  return await deviceTypeRepo.create(data);
};

exports.update = async (id, data) => {
  const deviceType = await deviceTypeRepo.findById(id);
  if (!deviceType) {
    throw { status: 404, message: 'ไม่พบประเภทอุปกรณ์นี้' };
  }

  // Check if trying to disable (set is_active to false) and there are devices using this device type
  if (data.is_active !== undefined && data.is_active === false && deviceType.is_active === true) {
    const devices = await deviceRepo.findByDeviceTypeId(id);
    if (devices && devices.length > 0) {
      const deviceNames = devices.map(d => d.name).join(', ');
      throw { status: 409, message: 'ไม่สามารถปิดการใช้งานประเภทอุปกรณ์นี้ได้ เนื่องจากมีอุปกรณ์ที่ใช้งานอยู่: ' + deviceNames };
    }
  }

  // Check if there are devices using this device_type_id (only when changing display_types)
  if (data.display_types && JSON.stringify(data.display_types) !== JSON.stringify(deviceType.display_types)) {
    const currentTypes = deviceType.display_types || [];
    const newTypes = data.display_types || [];
    
    // Find display_types that are being removed
    const removedTypes = currentTypes.filter(type => !newTypes.includes(type));
    
    // Check if any device addresses have data_type matching the removed display_types
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

  // Check if name already exists (only if name is different from current)
  if (data.name && data.name !== deviceType.name) {
    const existing = await deviceTypeRepo.findByName(data.name);
    if (existing) {
      throw { status: 409, message: 'ชื่อประเภทอุปกรณ์นี้มีอยู่แล้ว กรุณาใช้ชื่ออื่น' };
    }
  }

  await deviceTypeRepo.update(id, data);
  return await deviceTypeRepo.findById(id);
};

exports.delete = async (id) => {
  const deviceType = await deviceTypeRepo.findById(id);
  if (!deviceType) {
    throw { status: 404, message: 'Device type not found' };
  }

  // Check if there are device addresses with data_type matching any display_type of this device type
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
