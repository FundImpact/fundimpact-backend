const fs = require('fs')
const readSchemaFiles = async ()=>{
    let data = [];
    // Loop through all the files in the temp directory
    let files = await fs.readdirSync(`${process.cwd()}/extensions/crm-plugin/config/schemas`);
    for(file of files){
        if(file == 'load.js') continue;
        data.push(require(`./${file}`))
    }
    return data;
}
const mergeSchemas = async ()=>{
    let mainSchama = {
        type: {
            UsersPermissionsPermission: true, // Make this type NOT queriable.
        },
        definition: ``,
        query: ``,
        mutation: ``,
        resolver: {
            Query: {},
            Mutation: {},
        }
    }
    let schemas = await readSchemaFiles();
    for(schema of schemas){
        if(schema.definition && schema.definition.trim())
        mainSchama.definition += `${schema.definition.trim().replace(/\r?\n|\r/g, " ")}`;

        if(schema.query && schema.query.trim())
        mainSchama.query += `${schema.query.trim().replace(/\r?\n|\r/g, " ")}`;

        if(schema.resolver){
            if(schema.resolver.Query && Object.keys(schema.resolver.Query).length){
                Object.assign(mainSchama.resolver.Query,schema.resolver.Query);
            }
            if(schema.resolver.Mutation && Object.keys(schema.resolver.Mutation).length){
                Object.assign(mainSchama.resolver.Mutation,schema.resolver.Mutation);
            }
        }
        
    }
    return mainSchama;
}
module.exports = mergeSchemas;