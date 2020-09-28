module.exports={
    createAdminPermissions:async()=>{
        const permissions = await strapi.plugins[
            'users-permissions'
        ].services.userspermissions.getActions();
        let newPermissions = {};
        let systemPlugins = ["content-manager", "content-type-builder","email","graphql"];
        for(let plugin in permissions){
            if(!systemPlugins.includes(plugin)){
                newPermissions[plugin] = permissions[plugin];
                for(controller in newPermissions[plugin].controllers){
                    for(action in newPermissions[plugin].controllers[controller]){
                        newPermissions[plugin].controllers[controller][action].enabled = true;
                    }
                }
            }
        }
        return newPermissions;
    }
}