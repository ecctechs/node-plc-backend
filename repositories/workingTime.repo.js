const { WorkingTime } = require('../models');

exports.findOne = async (companyId) => {
  return await WorkingTime.findOne({ where: { company_id: companyId } });
};

exports.upsert = async (data, companyId) => {
  const existing = await WorkingTime.findOne({ where: { company_id: companyId } });

  if (existing) {
    return await existing.update(data);
  }

  return await WorkingTime.create({ ...data, company_id: companyId });
};
