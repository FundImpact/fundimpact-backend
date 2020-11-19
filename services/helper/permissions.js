let systemPlugins = ["content-manager", "content-type-builder","email","graphql"];
let systemControllers = [
    "proxy","userspermissions"
];
let writeActions = [
    "create","update"
];

let deleteActions = [
    "delete","destroy","destroyAll"
]
const createAdminPermissions = async(config={enabled: true, purpose:""})=>{
    const permissions = await strapi.plugins[
        'users-permissions'
    ].services.userspermissions.getActions();
    let newPermissions = {};   
    for(let plugin in permissions){
        if(!systemPlugins.includes(plugin)){
            newPermissions[plugin] = {"controllers":{},"information": {}};
            for(let controller in permissions[plugin].controllers){
                if(!systemControllers.includes(controller)){
                    newPermissions[plugin].controllers[controller] = {};//permissions[plugin].controllers[controller];
                    for(let action in permissions[plugin].controllers[controller]){
                        if(!writeActions.includes(action) && !deleteActions.includes(action)){
                            newPermissions[plugin].controllers[controller][action] = permissions[plugin].controllers[controller][action]; 
                        }
                        // newPermissions[plugin].controllers[controller][action].enabled = config.enabled;
                    }
                }
            }
        }
    }
    return newPermissions;
}
module.exports={
    createAdminPermissions:createAdminPermissions
}