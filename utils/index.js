const isRowIdPresentInTable = async ({ tableName, rowId, strapi }) =>
  !!(await strapi.connections.default(tableName).where({ id: rowId })).length;

module.exports = {
  isRowIdPresentInTable,
};
