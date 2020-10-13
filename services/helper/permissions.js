module.exports={
    createAdminPermissions:async(enabled = true)=>{
        const permissions = await strapi.plugins[
            'users-permissions'
        ].services.userspermissions.getActions();
        let newPermissions = {};
        let systemPlugins = ["content-manager", "content-type-builder","email","graphql"];
        let systemControllers = [
            "account","annual-year","category",
            "category","category-unit","unit",
            "country","currency","organization-registration-type",
            "public-donor","sustainable-development-goals",
            "proxy"
        ];
        for(let plugin in permissions){
            if(!systemPlugins.includes(plugin)){
                newPermissions[plugin] = permissions[plugin];
                for(controller in newPermissions[plugin].controllers){
                    for(action in newPermissions[plugin].controllers[controller]){
                        newPermissions[plugin].controllers[controller][action].enabled = enabled;
                    }
                }
            }
        }
        return newPermissions;
    }
}