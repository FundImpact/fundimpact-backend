const isRowIdPresentInTable = async ({ tableName, rowId, strapi, where = {} }) =>
  !!(await strapi.connections.default(tableName).where({ id: rowId, ...where })).length;

module.exports = {
  isRowIdPresentInTable,
};
