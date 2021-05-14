module.exports = {
  async createFileMorph(ctx) {
    try {
      let { upload_file_id, related_id, related_type, field, order } =
        ctx.query;
      // check file status
      let queryFile = `SELECT * FROM upload_file WHERE id = ${upload_file_id}`;
      let { rowCount } = await strapi.connections.default.raw(queryFile);
      if (!rowCount) {
        return ctx.badRequest(null, `File not found.`);
      }
      // Check morph status
      let queryFileMorph = `SELECT "order" FROM upload_file_morph WHERE upload_file_id=${upload_file_id} AND related_id = ${related_id} AND related_type = '${related_type}';`;
      let { rowCountMorph } = await strapi.connections.default.raw(
        queryFileMorph
      );
      if (rowCountMorph) {
        return ctx.badRequest(null, `Already morph created.`);
      }
      // create morph
      let queryMorph = `INSERT INTO upload_file_morph (upload_file_id, related_id, related_type, field, "order") VALUES(${upload_file_id},${related_id},'${related_type}','${field}', ${
        order ? order : 1
      });`;
      let data = await strapi.connections.default.raw(queryMorph);
      return { file: data.rowCount };
    } catch (error) {
      console.log(error);
      return ctx.badRequest(null, error.message);
    }
  },
  async deleteFileMorph(ctx) {
    try {
      let id = ctx.params.id;
      let queryMorph = `DELETE FROM upload_file_morph WHERE upload_file_id = ${id};`;
      let delMorph = await strapi.connections.default.raw(queryMorph);
      return { morph: delMorph.rowCount };
    } catch (error) {
      console.log(error);
      return ctx.badRequest(null, error.message);
    }
  },
  async getAttachmentsInProjectBudgetDeliverableAndImpact(ctx) {
    try {
      const {
        params: { project },
      } = ctx;
      const knex = strapi.connections.default;
      const budgetTargetLineItems = await knex("budget_targets_project")
        .select("budget_tracking_lineitem.id")
        .join("budget_tracking_lineitem", {
          "budget_tracking_lineitem.budget_targets_project":
            "budget_targets_project.id",
        })
        .where({
          "budget_targets_project.project": project,
          "budget_targets_project.deleted": false,
          "budget_tracking_lineitem.deleted": false,
        });
      const deliverableTargetLineItems = await knex(
        "deliverable_target_project"
      )
        .select("deliverable_tracking_lineitem.id")
        .join("deliverable_tracking_lineitem", {
          "deliverable_tracking_lineitem.deliverable_target_project":
            "deliverable_target_project.id",
        })
        .where({
          "deliverable_target_project.project": project,
          "deliverable_target_project.deleted": false,
          "deliverable_tracking_lineitem.deleted": false,
        });
      const impactTargetLineItems = await knex("impact_target_project")
        .select("impact_tracking_lineitem.id")
        .join("impact_tracking_lineitem", {
          "impact_tracking_lineitem.impact_target_project":
            "impact_target_project.id",
        })
        .where({
          "impact_target_project.project": project,
          "impact_target_project.deleted": false,
          "impact_tracking_lineitem.deleted": false,
        });
      const budgetTargetLineItemsTableNameAndId = budgetTargetLineItems.map(
        (budgetTargetLineItem) => [
          "budget_tracking_lineitem",
          budgetTargetLineItem.id,
        ]
      );
      const deliverableTargetLineItemsTableNameAndId =
        deliverableTargetLineItems.map((deliverableTargetLineItem) => [
          "deliverable_tracking_lineitem",
          deliverableTargetLineItem.id,
        ]);
      const impactTargetLineItemsTableNameAndId = impactTargetLineItems.map(
        (impactTargetLineItem) => [
          "impact_tracking_lineitem",
          impactTargetLineItem.id,
        ]
      );
      const attachments = await knex("upload_file")
        .select(
          "upload_file.id",
          "name",
          "size",
          "caption",
          "url",
          "ext",
          "created_at",
          knex.raw(
            `case 
              when related_type = 'budget_tracking_lineitem' then 'Budget Expenditure'
              when related_type = 'impact_tracking_lineitem' then 'Impact Achievements'
              when related_type = 'deliverable_tracking_lineitem' then 'Deliverable Achievements'
              when related_type = 'projects' then 'Project'
            end as related_type`
          ),
          "related_id"
        )
        .join("upload_file_morph", {
          "upload_file.id": "upload_file_morph.upload_file_id",
        })
        .where({
          "upload_file_morph.related_type": "projects",
          "upload_file_morph.related_id": project,
        })
        .orWhereIn(
          ["upload_file_morph.related_type", "upload_file_morph.related_id"],
          budgetTargetLineItemsTableNameAndId
        )
        .orWhereIn(
          ["upload_file_morph.related_type", "upload_file_morph.related_id"],
          deliverableTargetLineItemsTableNameAndId
        )
        .orWhereIn(
          ["upload_file_morph.related_type", "upload_file_morph.related_id"],
          impactTargetLineItemsTableNameAndId
        );
      return attachments;
    } catch (err) {
      console.error(err);
      return ctx.throw(400, err.message);
    }
  },
};
