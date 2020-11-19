module.exports = {
    async createFileMorph(ctx){
        try {
            let {upload_file_id,related_id,related_type,field,order} = ctx.query;
            // check file status
            let queryFile = `SELECT * FROM upload_file WHERE id = ${upload_file_id}`;
            let {rowCount} = await strapi.connections.default.raw(queryFile)
            if(!rowCount){
                return ctx.badRequest(null, `File not found.`);
            }
            // Check morph status
            let queryFileMorph = `SELECT "order" FROM upload_file_morph WHERE upload_file_id=${upload_file_id} AND related_id = ${related_id} AND related_type = '${related_type}';`;
            let {rowCountMorph} = await strapi.connections.default.raw(queryFileMorph)
            if(rowCountMorph){
                return ctx.badRequest(null, `Already morph created.`);
            }
            // create morph
            let queryMorph = `INSERT INTO upload_file_morph (upload_file_id, related_id, related_type, field, "order") VALUES(${upload_file_id},${related_id},'${related_type}','${field}', ${order?order:1});`;
            let data = await strapi.connections.default.raw(queryMorph)
            return {file:data.rowCount};
        } catch (error) {
            console.log(error)
            return ctx.badRequest(null, error.message);
        }
    },
    async deleteFileMorph(ctx){
        try {
            let id = ctx.params.id;
            let queryMorph = `DELETE FROM upload_file_morph WHERE upload_file_id = ${id};`;
            let delMorph = await strapi.connections.default.raw(queryMorph)
            return {morph:delMorph.rowCount};
        } catch (error) {
            console.log(error)
            return ctx.badRequest(null, error.message);
        }
    }
}