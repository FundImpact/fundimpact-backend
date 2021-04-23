'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

 const JSONStream = require("JSONStream");
 const { Transform } = require("json2csv");
const { importTable } = require('../../../services/importTable')

module.exports = {
    fund_recipet_values : async ctx => {
        try {
            const { query } = ctx;
            let data = await strapi.connections.default.raw(`select sum(amount) from workspaces ws 
            join projects on ws.id = projects.workspace 
            join project_donor on project_donor.project = projects.id
            join fund_receipt_project frp on project_donor.id = frp.project_donor
            where ws.organization = ${ctx.query.organization}
            and frp.deleted = false
            ${query.donor && query.donor.length ? "and project_donor.donor in (" + query.donor.join() + ")" : ''}
            `)
            
            return data.rows && data.rows.length > 0 && data.rows[0].sum != null ? data.rows[0].sum : 0;
        } catch (error) {
            console.log(error)
            return ctx.badRequest(null, error.message);
        }
    },
    exportTable : async (ctx) => {
      try {
        const { res, params } = ctx;
        if (
          !isProjectIdAvailableInUserProjects(ctx.locals.project_in, params.projectId)
        ) {
          throw new Error("Project not assigned to user");
        }
        const transformOpts = { highWaterMark: 16384, encoding: "utf-8" };
        const json2csv = new Transform(
          {
            fields: ["id", "date", "amount", "donor"],
          },
          transformOpts
        );
        ctx.set("Content-Disposition", `attachment; filename="budget.csv"`);
        ctx.body = ctx.req.pipe;
        ctx.set("Content-Type", "text/csv");
        const fundReceiptProjectStream = strapi.connections
          .default("fund_receipt_project")
          .join("project_donor", {
            [`fund_receipt_project.project_donor`]: "project_donor.id",
          })
          .join("donors", {
            [`project_donor.donor`]: "donors.id",
          })
          .column([
            "fund_receipt_project.id",
            "fund_receipt_project.reporting_date as date",
            "fund_receipt_project.amount",
            "donors.name as donor",
          ])
          .where({
            project: params.projectId,
            ["fund_receipt_project.deleted"]: false,
          })
          .stream();
        fundReceiptProjectStream.pipe(JSONStream.stringify()).pipe(json2csv).pipe(res);
        return await new Promise((resolve) => fundReceiptProjectStream.on("end", resolve));
      } catch (error) {
        console.log(error);
        return ctx.badRequest(null, error.message);
      }
    },
    createFundReceiptProjectFromCsv: async (ctx) => {
      try {
        const { params } = ctx;
        const columnsWhereValueCanBeInserted = [
          "amount",
          "reporting_date",
          "project_donor",
        ];
        const validateRowToBeInserted = async (rowObj) =>
          await validateRowToBeInsertedInFundReceiptProject(
            rowObj,
            params.projectId
          ); 
        const updateRowToBeInserted = async (rowObj) =>
          await updateFundReceiptProvidedInCsv(rowObj, params.projectId);
        await importTable({
          columnsWhereValueCanBeInserted,
          ctx,
          tableName: "fund_receipt_project",
          validateRowToBeInserted,
          updateRowToBeInserted
        });
        return { message: "Fund Receipt Created", done: true };

      } catch (error) {
        console.log(error);
        return ctx.badRequest(null, error.message);
      }
    }
};

const isProjectIdAvailableInUserProjects = (userProjects, projectId) =>
  userProjects.some((userProject) => userProject == projectId);

const validateRowToBeInsertedInFundReceiptProject = async (
  rowObj,
  projectId
) => {
  const areAllRequiredFieldsPresent = [
    "amount",
    "reporting_date",
    "project_donor",
  ].every((column) => !!rowObj[column]);

  if(!areAllRequiredFieldsPresent){
    return false;
  }
  const projectDonor = await strapi.connections
    .default("project_donor")
    .where({ donor: rowObj.project_donor, project: projectId });
  if (!projectDonor.length) {
    return false;
  }
  return true;
};

const  updateFundReceiptProvidedInCsv = async (rowObj, projectId) => {
  const projectDonor = await strapi.connections
    .default("project_donor")
    .where({ donor: rowObj.project_donor, project: projectId });
  return { ...rowObj, project_donor: projectDonor[0].id };
};
