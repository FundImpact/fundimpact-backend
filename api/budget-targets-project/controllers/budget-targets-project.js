'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

const JSONStream = require("JSONStream");
const { Transform } = require("json2csv");
const { importTable } = require("../../../services/importTable");
const { isRowIdPresentInTable } = require("../../../utils");

module.exports = {
  create: async (ctx) => {
    try {
      const { request: { body }, params, } = ctx;
      let entity = await strapi.services["budget-targets-project"].create(body);
      // let data = sanitizeEntity(entity, { model: strapi.models['budget-targets-project'] });
      if (entity.id) {
        let object = {
          budget_targets_project: entity.id,
          project: body.project
        }
        let pwbt = await strapi.services["project-with-budget-target"].create(object);
      }
      return { message: "Budget Target Created", done: true };
    } catch (err) {
      strapi.log.error(err);
      return ctx.throw(400, err);
    }
  },
  update: async (ctx) => {
    try {
      const { request: { body }, params, } = ctx;
      const { id } = params;
      let lData = await strapi.services["budget-targets-project"].findOne({ id });
      if (lData && lData.id) {
        let btProject = await strapi.services["budget-targets-project"].update({ id }, body);
        if (btProject && btProject.id) {
          let object = {
            project: body.project
          }
          let pwbt = await strapi.services["project-with-budget-target"].update({ "budget_targets_project": btProject.id }, object);
          return { message: "Budget Target Updated", done: true };
        }else{
            return ctx.unauthorized(`You can't update this entry`);
        }
      } else {
        return ctx.unauthorized(`You can't update this entry`);
      }
      
      // strapi.services["budget-targets-project"].findOne({
      //   id
      // }).then(async (res) => {
      //   try {
      //     if (res) {
      //       let btProject = await strapi.services["budget-targets-project"].update({ id }, body);
      //       if (btProject && btProject.id) {
      //         let object = {
      //           project: body.project
      //         }
      //         let pwbt = await strapi.services["project-with-budget-target"].update({ "budget_targets_project": btProject.id }, object);
      //         console.log("pwbt",pwbt)
      //         return { message: "Budget Target Updated", done: true };
      //       }else{
      //         return { message: "Budget Target Updated", done: true };
      //       }
      //     } else {
      //       console.log("suresh")
      //       return ctx.unauthorized(`You can't update this entry`);
      //     }
      //   } catch (error) {
      //      console.log("err",error) 
      //   }

      // }).catch(err => {
      //   console.log("catch err", err)
      //   return ctx.unauthorized("Catch Error");
      // });
    } catch (err) {
      strapi.log.error(err);
      return ctx.throw(400, err);
    }
  },
  project_expenditure_value: async ctx => {
    try {
      let data = await strapi.connections.default.raw(` WITH btp AS ( select projects.id , projects.name,  sum(btp.total_target_amount)
            from budget_category_organizations bco 
            JOIN budget_targets_project btp ON btp.budget_category_organization = bco.id 
            JOIN projects ON projects.id = btp.project
            where bco.organization = ${ctx.query.organization}
            and btp.deleted = false
            ${ctx.query.donor && ctx.query.donor.length ? `and btp.donor in (${ctx.query.donor.join()})` : ''}
            group by projects.id) , 
            btl AS (select btp.project ,  sum(btl.amount)  
            from budget_category_organizations bco 
            JOIN budget_targets_project btp ON bco.id = btp.budget_category_organization 
            JOIN budget_tracking_lineitem btl ON btp.id = btl.budget_targets_project
            LEFT JOIN financial_year fy_org ON btl.fy_org = fy_org.id
            LEFT JOIN financial_year fy_donor ON btl.fy_donor = fy_donor.id
            LEFT JOIN annual_year ay ON btl.annual_year = ay.id
            where bco.organization = ${ctx.query.organization}
            and btp.deleted = false
            and btl.deleted = false
            ${ctx.query.donor && ctx.query.donor.length ? "and btp.donor in (" + ctx.query.donor.join() + ")" : ''}
            ${ctx.query.financial_year && ctx.query.financial_year.length ? "and fy_org.id in (" + ctx.query.financial_year.join() + ")" : ''}
            ${ctx.query.financial_year && ctx.query.financial_year.length ? "and fy_donor.id in (" + ctx.query.financial_year.join() + ")" : ''}
            ${ctx.query.annual_year && ctx.query.annual_year.length ? "and ay.id in (" + ctx.query.annual_year.join() + ")" : ''}
            group by btp.project) 
            select btl.project as project_id, btp.name, ROUND((btl.sum * 100.0)/ btp.sum) as avg_value 
            from btp 
            JOIN btl ON btp.id = btl.project 
            ORDER BY avg_value desc`)

      return data.rows && data.rows.length > 0 ? data.rows : [];
    } catch (error) {
      console.log(error)
      return ctx.badRequest(null, error.message);
    }
  },
  project_allocation_value: async ctx => {
    try {
      let data = await strapi.connections.default.raw(`WITH btp AS ( 
            select btp.project,  sum(btp.total_target_amount)
            from budget_category_organizations bco 
            JOIN budget_targets_project btp ON btp.budget_category_organization = bco.id
            JOIN donors on donors.id = btp.donor
            where bco.organization = ${ctx.query.organization} 
            and btp.deleted = false
            ${ctx.query.donor && ctx.query.donor.length ? "and donors.id in (" + ctx.query.donor.join() + ")" : ''}
            group by btp.project), 
            frp AS (select projects.id , projects.name ,sum(frp.amount)
            from workspaces 
            JOIN projects ON projects.workspace = workspaces.id 
            JOIN project_donor pd ON pd.project = projects.id 
            JOIN fund_receipt_project frp ON frp.project_donor = pd.id 
            where workspaces.organization = ${ctx.query.organization}
            and frp.deleted = false 
            ${ctx.query.donor && ctx.query.donor.length ? "and pd.donor in (" + ctx.query.donor.join() + ")" : ''}
            group by projects.id)
            select frp.id as project_id , frp.name as name,  ROUND((frp.sum * 100.0)/ btp.sum) as avg_value  
            from btp 
            JOIN frp ON btp.project = frp.id 
            ORDER BY avg_value desc`)

      return data.rows && data.rows.length > 0 ? data.rows : [];
    } catch (error) {
      console.log(error)
      return ctx.badRequest(null, error.message);
    }
  },
  completed_project_count: async ctx => {
    try {
      let data = await strapi.connections.default.raw(`
            WITH btp AS ( select btp.project,  sum(btp.total_target_amount)
                        from budget_category_organizations bco 
                        JOIN budget_targets_project btp ON btp.budget_category_organization = bco.id 
                        where bco.organization = ${ctx.query.organization}
                        and btp.deleted = false
                        ${ctx.query.donor && ctx.query.donor.length ? "and btp.donor in (" + ctx.query.donor.join() + ")" : ''}
                        group by btp.project),
                        frp AS (select projects.id ,sum(frp.amount) 
                        from workspaces 
                        JOIN projects ON projects.workspace = workspaces.id 
                        JOIN project_donor pd ON pd.project = projects.id 
                        JOIN fund_receipt_project frp ON frp.project_donor = pd.id
                        where workspaces.organization = ${ctx.query.organization} 
                        and frp.deleted = false
                        ${ctx.query.donor && ctx.query.donor.length ? "and pd.donor in (" + ctx.query.donor.join() + ")" : ''}
                        group by projects.id)
                        select count(btp.project) from btp JOIN frp ON btp.sum = frp.sum;`)
      return data.rows && data.rows.length > 0 && data.rows[0].count ? data.rows[0].count : 0;
    } catch (error) {
      console.log(error)
      return ctx.badRequest(null, error.message);
    }
  },
  donors_allocation_value: async ctx => {
    try {
      let data = await strapi.connections.default.raw(`select donors.id , donors.name , sum(btp.total_target_amount) from workspaces 
            JOIN projects ON projects.workspace = workspaces.id JOIN project_donor pd ON projects.id = pd.project 
            JOIN donors ON donors.id = pd.donor 
            JOIN budget_targets_project btp ON btp.project = projects.id 
            where workspaces.organization = ${ctx.query.organization}
            and btp.deleted = false
            ${ctx.query.donor && ctx.query.donor.length ? "and donors.id in (" + ctx.query.donor.join() + ")" : ''}
            group by donors.id ORDER BY sum desc`)

      return data.rows && data.rows.length > 0 ? data.rows : [];
    } catch (error) {
      console.log(error)
      return ctx.badRequest(null, error.message);
    }
  },
  donors_recieved_value: async ctx => {
    try {
      let data = await strapi.connections.default.raw(`select donors.id , donors.name , sum(frp.amount) 
            from workspaces 
            JOIN projects ON projects.workspace = workspaces.id 
            JOIN project_donor pd ON projects.id = pd.project 
            JOIN donors ON donors.id = pd.donor 
            JOIN fund_receipt_project frp ON frp.project_donor = pd.id
            where workspaces.organization = ${ctx.query.organization} 
            and frp.deleted = false
            ${ctx.query.donor && ctx.query.donor.length ? "and donors.id in (" + ctx.query.donor.join() + ")" : ''}
            group by donors.id ORDER BY sum desc`)
      return data.rows && data.rows.length > 0 ? data.rows : [];
    } catch (error) {
      console.log(error)
      return ctx.badRequest(null, error.message);
    }
  },
  exportTable: async (ctx) => {
    try {
      const { res, params, query } = ctx;
      const sendHeaderWhereValuesCanBeWritten = query.header;
      const tableColumns = !sendHeaderWhereValuesCanBeWritten
        ? [
          "id",
          "name",
          "description",
          "budget category",
          "total target amount",
          "spent",
          "progress",
        ]
        : [
          "name *",
          "description",
          "total_target_amount *",
          "budget_category_organization *",
          "donor *",
        ];
      if (
        !isProjectIdAvailableInUserProjects(
          query.project_in,
          params.projectId
        )
      ) {
        throw new Error("Project not assigned to user");
      }
      const transformOpt = { highWaterMark: 16384, encoding: "utf-8" };
      const json2csv = new Transform(
        {
          fields: tableColumns,
        },
        transformOpt
      );
      ctx.body = ctx.req.pipe;
      ctx.set("Content-Type", "text/csv");
      ctx.set("Content-Disposition", `attachment; filename="budget.csv"`);
      const budgetTargetsProjectStream = strapi.connections
        .default("budget_targets_project")
        .join("budget_category_organizations", {
          [`budget_targets_project.budget_category_organization`]: "budget_category_organizations.id",
        })
        .leftJoin("budget_tracking_lineitem", {
          [`budget_tracking_lineitem.budget_targets_project`]: "budget_targets_project.id",
        })
        .groupBy("budget_targets_project.id")
        .groupBy("budget_category_organizations.id")
        .column([
          "budget_targets_project.id",
          "budget_targets_project.name as name",
          "budget_targets_project.description",
          "budget_category_organizations.name as budget category",
          "budget_targets_project.total_target_amount as total target amount",
          strapi.connections.default.raw(
            `sum(case when COALESCE(budget_tracking_lineitem.deleted, false) <> true then budget_tracking_lineitem.amount else 0 end) as spent`
          ),
          strapi.connections.default.raw(
            `sum(case when COALESCE(budget_tracking_lineitem.deleted, false) <> true then budget_tracking_lineitem.amount else 0 end) / budget_targets_project.total_target_amount * 100 as progress`
          ),
        ])
        .where(
          sendHeaderWhereValuesCanBeWritten
            ? false
            : {
              project: params.projectId,
              ["budget_targets_project.deleted"]: false,
            }
        )
        .stream();
      budgetTargetsProjectStream
        .pipe(JSONStream.stringify())
        .pipe(json2csv)
        .pipe(res);
      return await new Promise((resolve) =>
        budgetTargetsProjectStream.on("end", resolve)
      );
    } catch (error) {
      console.log(error);
      return ctx.badRequest(null, error.message);
    }
  },
  createBudgetTargetProjectFromCsv: async (ctx) => {
    try {
      const { query, params } = ctx;
      const projectBelongToUser = checkIfProjectBelongToUser(
        query.project_in,
        params.projectId
      );
      if (!projectBelongToUser) {
        throw new Error("Project is not assigned to user");
      }
      const columnsWhereValueCanBeInserted = [
        "name",
        "description",
        "total_target_amount",
        "budget_category_organization",
        "donor",
      ];
      const validateRowToBeInserted = async (rowObj) =>
        await validateRowToBeInsertedInBudgetTargetProject(
          rowObj,
          params.projectId,
          ctx.locals.organizationId
        );

      await importTable({
        columnsWhereValueCanBeInserted,
        ctx,
        tableName: "budget_targets_project",
        defaultFieldsToInsert: { project: params.projectId, deleted: false },
        validateRowToBeInserted,
      });
      return { message: "Budget Target Created", done: true };
    } catch (error) {
      console.log(error);
      return ctx.badRequest(null, error.message);
    }
  }
};

const isProjectIdAvailableInUserProjects = (userProjects, projectId) =>
  userProjects.some((userProject) => userProject == projectId);

const validateRowToBeInsertedInBudgetTargetProject = async (
  rowObj,
  projectId,
  organizationId
) => {
  const requiredColumns = [
    "name",
    "total_target_amount",
    "budget_category_organization",
    "donor",
  ];
  for (let column of requiredColumns) {
    if (!rowObj[column]) {
      return { valid: false, errorMessage: `${column} not present` };
    }
  }
  if (isNaN(rowObj.total_target_amount)) {
    return {
      valid: false,
      errorMessage: "total_target_amount is not a number",
    };
  }
  if (
    !(await isRowIdPresentInTable({
      rowId: rowObj.budget_category_organization,
      strapi,
      tableName: "budget_category_organizations",
      where: { organization: organizationId, deleted: false },
    }))
  ) {
    return {
      valid: false,
      errorMessage: "budget_category_organization not valid",
    };
  }
  const projectDonor = await strapi.connections
    .default("project_donor")
    .join("donors", { "donors.id": "project_donor.donor" })
    .where({
      donor: rowObj.donor,
      project: projectId,
      "donors.deleted": false,
    });
  if (!projectDonor.length) {
    return {
      valid: false,
      errorMessage: "donor not valid",
    };
  }
  return { valid: true };
};


const checkIfProjectBelongToUser = (userProjects, projectId) =>
  !!userProjects.find((userProject) => userProject == projectId);
