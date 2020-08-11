
strapi.role = {
    "authenticated": "1",
    "public": "2"
}

let permissionJson = {
    "type": "application",
    "enable": true,
    "controller": [
        {
            "role": strapi.role.public,
            "path": "organization-registration-type",
            "actions": ["find", "findOne"]
        },
        {
            "role": strapi.role.authenticated,
            "path": "organization",
            "actions": ["create", "update"]
        }
    ]
}



module.exports = async () => {
    strapi.role = {
        "authenticated": "1",
        "public": "2"
    }
    if(permissionJson.controller.length > 0){
        for(var m = 0 ; m < permissionJson.controller.length ; m++){
            for(let k = 0 ; k < permissionJson.controller[m].actions.length ; k++){
                let obj = {
                    "type": permissionJson.type,
                    "controller": permissionJson.controller[m].path,
                    "action": permissionJson.controller[m].actions[k],
                    "enabled": permissionJson.enable,
                    "role": permissionJson.controller[m].role
                }
                await strapi.query('permission', 'users-permissions').create(obj)
            }
        }
    }
    return;
}

