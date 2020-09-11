'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

module.exports = {
    project_count_budget_cat_by_org: async ctx => {
        try {
            console.log(ctx.query);
            let data = await strapi.connections.default.raw(`select budget_category_organizations.id, budget_category_organizations.name ,
            count(budget_targets_project.project) as project_count from budget_category_organizations INNER JOIN budget_targets_project
            ON budget_category_organizations.id = budget_targets_project.budget_category_organization 
            where budget_category_organizations.id = ${ctx.query.budget_category_organization} GROUP BY  budget_category_organizations.id`)
            return data.rows && data.rows.length > 0 ? data.rows : [];
        } catch (error) {
            console.log(error)
            return ctx.badRequest(null, error.message);
        }
    },
};
