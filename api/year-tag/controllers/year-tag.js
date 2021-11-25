'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

module.exports = {
    donerWiseYearTag: async (ctx) => {
        const { id } = ctx.params;
        let data = await strapi.connections.default.raw(`SELECT  DISTINCT yt.id,yt.name,type,start_date,end_date FROM donors d 
        inner join year_tags_countries ytc on d.country = ytc.country 
        inner join year_tags yt ON yt.id = ytc.year_tag
        where d.id=${id} and type !='annual'`)
        return data.rows && data.rows.length > 0 ? data.rows : [];
    },
    organizationWiseYearTag: async (ctx) => {
        const { id } = ctx.params;
        let data = await strapi.connections.default.raw(`SELECT DISTINCT yt.id,yt.name,type,start_date,end_date FROM organizations org
        inner join year_tags_countries ytc on org.country = ytc.country 
        inner join year_tags yt ON yt.id = ytc.year_tag
        where org.id=${id} and type !='annual'`)
        return data.rows && data.rows.length > 0 ? data.rows : [];
    },
    find: async (ctx)=>{
        const { id } = ctx.params;
        let data = await strapi.connections.default.raw(`select * from year_tags`)
        return data.rows && data.rows.length > 0 ? data.rows : [];
    }
};