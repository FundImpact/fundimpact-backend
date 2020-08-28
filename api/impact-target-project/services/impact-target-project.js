'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/services.html#core-services)
 * to customize this service
 */

module.exports = {
    totalImpactAmount: async ctx => {
        try {
            let sumData = await strapi.connections.default.raw(`SELECT SUM(target_value) FROM impact_target_project where project = (${ctx.params.where.project})`)
            return sumData.rows && sumData.rows.length > 0 && sumData.rows[0].sum != null ? sumData.rows[0].sum : 0;
        } catch (error) {
            console.log(error)
            return ctx.badRequest(null, error.message);

        }
    },
    successiveImpactList: async ctx => {
        try {
            let impactData = await strapi.connections.default.raw(`select  impact_target_project.id , impact_target_project.name ,impact_tracking_lineitem.value  from impact_tracking_lineitem 
            inner join impact_target_project ON impact_target_project.id = impact_tracking_lineitem.impact_target_project where impact_target_project.project = ${ctx.params.where.project}
            ORDER BY impact_tracking_lineitem.value desc
            `)
            let uniqueImpactArr = []
            if (impactData.rows.length > 0) {
                impactData = impactData.rows
                for (let i = 0; i < impactData.length; i++) {
                    if (uniqueImpactArr.length > 0) {
                        for (let j = 0; j < uniqueImpactArr.length; j++) {
                            if (uniqueImpactArr[j].id == impactData[i].id) {
                                uniqueImpactArr[j].value = uniqueImpactArr[j].value + impactData[i].value;
                                break;
                            } else {
                                uniqueImpactArr.push(impactData[i])
                                break;
                            }
                        }
                    }else{
                        uniqueImpactArr.push(impactData[i])
                    }
                }
                uniqueImpactArr = uniqueImpactArr.sort((a,b) => (a.value > b.value) ? -1 : ((b.value > a.value) ? 1 : 0));
            }
            return uniqueImpactArr.slice(0,3);
        } catch (error) {
            console.log(error)
            return ctx.badRequest(null, error.message);

        }
    }
};
