const repo = require('../repositories/product.repo');

exports.list = async (filter = {}) => {
  const products = await repo.findAll(filter);
  return products;
};

exports.getById = async (id) => {
  const product = await repo.findById(id);
  if (!product) throw { status: 404, message: 'ไม่พบสินค้านี้' };
  return product;
};

exports.create = async (payload) => {
  const { name, image_path, cycle_time, plc_address_output, plc_address_active, total_output, plc_address_complete , plc_address_reject} = payload;

  if (!name) {
    throw new Error('name is required');
  }

  const exists = await repo.findByName(name);
  if (exists) throw new Error(`ชื่อสินค้า "${name}" มีอยู่แล้ว`);

  const product = await repo.create({
    name,
    image_path,
    cycle_time,
    plc_address_output,
    plc_address_active,
    total_output,
    plc_address_complete,
    plc_address_reject
  });

  return product;
};

exports.update = async (id, payload) => {
  const product = await repo.findById(id);
  if (!product) throw { status: 404, message: 'ไม่พบสินค้านี้' };

  const { name, image_path, cycle_time, plc_address_output, plc_address_active, total_output, plc_address_complete, plc_address_reject } = payload;

  if (name && name !== product.name) {
    const exists = await repo.findByName(name);
    if (exists) throw new Error('ชื่อสินค้านี้มีอยู่แล้ว กรุณาใช้ชื่ออื่น');
  }

  const updateData = {};
  if (name !== undefined) updateData.name = name;
  if (image_path !== undefined) updateData.image_path = image_path;
  if (cycle_time !== undefined) updateData.cycle_time = cycle_time;
  if (plc_address_output !== undefined) updateData.plc_address_output = plc_address_output;
  if (plc_address_active !== undefined) updateData.plc_address_active = plc_address_active;
  if (total_output !== undefined) updateData.total_output = total_output;
  if (plc_address_complete !== undefined) updateData.plc_address_complete = plc_address_complete;
  if (plc_address_reject !== undefined) updateData.plc_address_reject = plc_address_reject;

  await repo.update(id, updateData);
  return await repo.findById(id);
};

exports.delete = async (id) => {
  const product = await repo.findById(id);
  if (!product) throw { status: 404, message: 'ไม่พบสินค้านี้' };

  await repo.delete(id);
  return { success: true, message: 'ลบสินค้าสำเร็จ' };
};

exports.updatePlcAddresses = async (payload) => {
  const { plc_address_output, plc_address_active, plc_address_complete , plc_address_reject } = payload;

  if (plc_address_output === undefined && plc_address_active === undefined && plc_address_complete === undefined && plc_address_reject === undefined) {
    throw new Error('plc_address_output, plc_address_active, plc_address_complete, or plc_address_reject is required');
  }

  const products = await repo.findAll({});
  const updateData = {};
  if (plc_address_output !== undefined) updateData.plc_address_output = plc_address_output;
  if (plc_address_active !== undefined) updateData.plc_address_active = plc_address_active;
  if (plc_address_complete !== undefined) updateData.plc_address_complete = plc_address_complete;
  if (plc_address_reject !== undefined) updateData.plc_address_reject = plc_address_reject;

  for (const product of products) {
    await repo.update(product.id, updateData);
  }

  return { success: true, message: 'อัพเดต PLC addresses สำเร็จ', updated: products.length };
};

exports.getPlcAddresses = async () => {
  const products = await repo.findAll({});

  if (products.length === 0) {
    return { plc_address_output: null, plc_address_active: null, plc_address_complete: null };
  }

  return {
    plc_address_output: products[0].plc_address_output,
    plc_address_active: products[0].plc_address_active,
    plc_address_complete: products[0].plc_address_complete,
    plc_address_reject: products[0].plc_address_reject
  };
};