'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

module.exports = {
    // find: async (ctx) => {
    //     const { query } = ctx;
    //     let bsTarget = await strapi.query("budget-sub-target").find(query);
    //     let mainArry = []
    //     if (bsTarget.length > 0) {
    //         let ids = bsTarget.map(e => e.id);
    //         let btLineItem = await strapi.connections.default.raw(`SELECT budget_sub_target,SUM(amount) as total FROM budget_tracking_lineitem WHERE budget_sub_target IN (${ids}) group by budget_sub_target`);
    //         let btnLineData = btLineItem.rows && btLineItem.rows.length > 0 ? btLineItem.rows : [];
    //         for (const pf of bsTarget) {
    //             let amountData = btnLineData.length > 0 ? btnLineData.find(e => e.budget_sub_target == pf.id) : {};
    //             // pf['btLineItemAmount'] = amountData ? amountData.total : 0;
    //             mainArry.push({
    //                 ...pf,
    //                 btlAmount : amountData ? amountData.total : 0
    //             });
    //         }
    //     }
    //     return mainArry;
    // }
};
