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
        let crmPluginControllers = [
            "activities", "activity", "activityassignee", 
            "activitytype", "activitytypes", "contact", 
            "contacts", "contacttag", "contacttags", 
            "crmplugin","tag"
        ];
        for(let plugin in permissions){
            if(!systemPlugins.includes(plugin)){
                newPermissions[plugin] = {"controllers":{},"information": {}};
                for(controller in permissions[plugin].controllers){
                    if(!systemControllers.includes(controller) && !crmPluginControllers.includes(controller)){
                        newPermissions[plugin].controllers[controller] = permissions[plugin].controllers[controller];
                        for(action in permissions[plugin].controllers[controller]){
                            newPermissions[plugin].controllers[controller][action].enabled = enabled;
                        }
                    }
                }
            }
        }
        return newPermissions;
    }
}