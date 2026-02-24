const { InteractionLayout, InteractionElement } = require('../models');

// List all layouts
exports.getAllLayouts = async () => {
  return await InteractionLayout.findAll({
    order: [['created_at', 'DESC']]
  });
};

// Get layout by ID with elements
exports.getLayoutById = async (id) => {
  const layout = await InteractionLayout.findByPk(id, {
    include: [
      {
        model: InteractionElement,
        as: 'elements',
        order: [['display_order', 'ASC']]
      }
    ]
  });
  
  if (!layout) {
    throw new Error('Layout not found');
  }
  
  return layout;
};

// Create new layout
exports.createLayout = async (data) => {
  const { name, machine_image, aspect_ratio_width, aspect_ratio_height } = data;
  
  if (!name) {
    throw new Error('name is required');
  }
  
  return await InteractionLayout.create({
    name,
    machine_image,
    aspect_ratio_width: aspect_ratio_width || 16,
    aspect_ratio_height: aspect_ratio_height || 9
  });
};

// Create new element
exports.createElement = async (data) => {
  const {
    layout_id,
    element_type,
    name,
    x_percent,
    y_percent,
    size_width,
    size_height,
    font_size,
    bg_color,
    text_color,
    unit,
    precision,
    active_color,
    inactive_color,
    button_label,
    device_id,
    address_id,
    display_order,
    is_visible
  } = data;
  
  if (!layout_id) {
    throw new Error('layout_id is required');
  }
  
  if (!element_type) {
    throw new Error('element_type is required');
  }
  
  if (x_percent == null || y_percent == null) {
    throw new Error('x_percent and y_percent are required');
  }
  
  // Verify layout exists
  const layout = await InteractionLayout.findByPk(layout_id);
  if (!layout) {
    throw new Error('Layout not found');
  }
  
  // Verify device exists if provided
  if (device_id) {
    const { Device } = require('../models');
    const device = await Device.findByPk(device_id);
    if (!device) {
      throw new Error('Device not found');
    }
  }
  
  // Verify address exists if provided
  if (address_id) {
    const { DeviceAddress } = require('../models');
    const address = await DeviceAddress.findByPk(address_id);
    if (!address) {
      throw new Error('Address not found');
    }
  }
  
  return await InteractionElement.create({
    layout_id,
    element_type,
    name,
    x_percent,
    y_percent,
    size_width,
    size_height,
    font_size,
    bg_color,
    text_color,
    unit,
    precision: precision || 0,
    active_color,
    inactive_color,
    button_label,
    device_id: device_id || null,
    address_id: address_id || null,
    display_order: display_order || 0,
    is_visible: is_visible !== false
  });
};
