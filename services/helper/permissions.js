let systemPlugins = ["content-manager", "content-type-builder","email","graphql"];
let systemControllers = [
    "proxy","userspermissions"
];
let publicPermissions =  {
    "application": {
        "controllers": {
            "annual-year": {
                "find": {
                    "enabled": true,
                    "policy": ""
                },
                "findOne": {
                    "enabled": true,
                    "policy": ""
                },
                "count": {
                    "enabled": true,
                    "policy": ""
                }
            },
            "financial-year": {
                "find": {
                    "enabled": true,
                    "policy": ""
                },
                "findOne": {
                    "enabled": true,
                    "policy": ""
                },
                "count": {
                    "enabled": true,
                    "policy": ""
                }
            },
            "currency": {
                "find": {
                    "enabled": true,
                    "policy": ""
                },
                "findOne": {
                    "enabled": true,
                    "policy": ""
                },
                "count": {
                    "enabled": true,
                    "policy": ""
                }
            },
            "organization-registration-type": {
                "find": {
                    "enabled": true,
                    "policy": ""
                },
                "findOne": {
                    "enabled": true,
                    "policy": ""
                },
                "count": {
                    "enabled": true,
                    "policy": ""
                }
            },
            "public-donor": {
                "find": {
                    "enabled": true,
                    "policy": ""
                },
                "findOne": {
                    "enabled": true,
                    "policy": ""
                },
                "count": {
                    "enabled": true,
                    "policy": ""
                }
            },
            "sustainable-development-goals": {
                "find": {
                    "enabled": true,
                    "policy": ""
                },
                "findOne": {
                    "enabled": true,
                    "policy": ""
                },
                "count": {
                    "enabled": true,
                    "policy": ""
                }
            },
            "category": {
                "find": {
                    "enabled": true,
                    "policy": ""
                },
                "findOne": {
                    "enabled": true,
                    "policy": ""
                },
                "count": {
                    "enabled": true,
                    "policy": ""
                }
            },
            "unit": {
                "find": {
                    "enabled": true,
                    "policy": ""
                },
                "findOne": {
                    "enabled": true,
                    "policy": ""
                },
                "count": {
                    "enabled": true,
                    "policy": ""
                }
            },
            "category-unit": {
                "find": {
                    "enabled": true,
                    "policy": ""
                },
                "findOne": {
                    "enabled": true,
                    "policy": ""
                },
                "count": {
                    "enabled": true,
                    "policy": ""
                }
            },
            "country": {
                "find": {
                    "enabled": true,
                    "policy": ""
                },
                "findOne": {
                    "enabled": true,
                    "policy": ""
                },
                "count": {
                    "enabled": true,
                    "policy": ""
                }
            },
            "state": {
                "find": {
                    "enabled": true,
                    "policy": ""
                },
                "findOne": {
                    "enabled": true,
                    "policy": ""
                },
                "count": {
                    "enabled": true,
                    "policy": ""
                }
            },
            "district": {
                "find": {
                    "enabled": true,
                    "policy": ""
                },
                "findOne": {
                    "enabled": true,
                    "policy": ""
                },
                "count": {
                    "enabled": true,
                    "policy": ""
                }
            },
            "block": {
                "find": {
                    "enabled": true,
                    "policy": ""
                },
                "findOne": {
                    "enabled": true,
                    "policy": ""
                },
                "count": {
                    "enabled": true,
                    "policy": ""
                }
            },
            "village": {
                "find": {
                    "enabled": true,
                    "policy": ""
                },
                "findOne": {
                    "enabled": true,
                    "policy": ""
                },
                "count": {
                    "enabled": true,
                    "policy": ""
                }
            }
        },
        "information": {}
    },
    "upload": {
        "controllers": {},
        "information": {}
    },
    "users-permissions": {
        "controllers": {},
        "information": {}
    }
};
let readAccess = [
    "find","findOne","count"
]
let writeActions = [
    "create","update"
];

let deleteActions = [
    "delete","destroy","destroyAll"
]
const defaultPermissions = {
    "application": {
        "controllers": {
            "account": {
                "find": {
                    "enabled": true,
                    "policy": ""
                },
                "findOne": {
                    "enabled": true,
                    "policy": ""
                },
                "count": {
                    "enabled": true,
                    "policy": ""
                }
            },
            "budget-category-organization": {
                "find": {
                    "enabled": true,
                    "policy": ""
                },
                "findOne": {
                    "enabled": true,
                    "policy": ""
                },
                "count": {
                    "enabled": true,
                    "policy": ""
                }
            },
            "deliverable-category-org": {
                "find": {
                    "enabled": true,
                    "policy": ""
                },
                "findOne": {
                    "enabled": true,
                    "policy": ""
                },
                "count": {
                    "enabled": true,
                    "policy": ""
                }
            },
            "deliverable-category-unit": {
                "find": {
                    "enabled": true,
                    "policy": ""
                },
                "findOne": {
                    "enabled": true,
                    "policy": ""
                },
                "count": {
                    "enabled": true,
                    "policy": ""
                }
            },
            "deliverable-units-org": {
                "find": {
                    "enabled": true,
                    "policy": ""
                },
                "findOne": {
                    "enabled": true,
                    "policy": ""
                },
                "count": {
                    "enabled": true,
                    "policy": ""
                }
            },
            "donor": {
                "find": {
                    "enabled": true,
                    "policy": ""
                },
                "findOne": {
                    "enabled": true,
                    "policy": ""
                },
                "count": {
                    "enabled": true,
                    "policy": ""
                }
            },
            "impact-category-org": {
                "find": {
                    "enabled": true,
                    "policy": ""
                },
                "findOne": {
                    "enabled": true,
                    "policy": ""
                },
                "count": {
                    "enabled": true,
                    "policy": ""
                }
            },
            "impact-category-unit": {
                "find": {
                    "enabled": true,
                    "policy": ""
                },
                "findOne": {
                    "enabled": true,
                    "policy": ""
                },
                "count": {
                    "enabled": true,
                    "policy": ""
                }
            },
            "impact-units-org": {
                "find": {
                    "enabled": true,
                    "policy": ""
                },
                "findOne": {
                    "enabled": true,
                    "policy": ""
                },
                "count": {
                    "enabled": true,
                    "policy": ""
                }
            },
            "workspace": {
                "find": {
                    "enabled": true,
                    "policy": ""
                },
                "findOne": {
                    "enabled": true,
                    "policy": ""
                },
                "count": {
                    "enabled": true,
                    "policy": ""
                }
            }
        },
        "information": {}
    },
    "upload": {
        "controllers": {
            "upload": {
                "find": {
                    "enabled": true,
                    "policy": ""
                },
                "findOne": {
                    "enabled": true,
                    "policy": ""
                },
                "count": {
                    "enabled": true,
                    "policy": ""
                }
            },
        },
        "information": {}
    },
    "users-permissions": {
        "controllers": {},
        "information": {}
    }
};
const getDefaultPermissions = async()=>{
    let permissions = Object.assign({},publicPermissions);
    let defPermissions = Object.assign({},defaultPermissions);
    for(plugin in permissions){
        if(defPermissions[plugin]){
            for(controller in permissions[plugin].controllers){
                if(defPermissions[plugin].controllers[controller]){
                    for(action in permissions[plugin].controllers[controller]){
                        if(!defPermissions[plugin].controllers[controller][action]){
                            defPermissions[plugin].controllers[controller][action] = permissions[plugin].controllers[controller][action];
                        }
                    }
                }else{
                    defPermissions[plugin].controllers[controller] = permissions[plugin].controllers[controller];
                }
            }
        }else{
            defPermissions[plugin] = permissions[plugin];
        }
    }
    for(plugin in defPermissions){
        if(permissions[plugin]){
            for(controller in defPermissions[plugin].controllers){
                if(permissions[plugin].controllers[controller]){
                    for(action in defPermissions[plugin].controllers[controller]){
                        if(!permissions[plugin].controllers[controller][action]){
                            permissions[plugin].controllers[controller][action] = defPermissions[plugin].controllers[controller][action];
                        }
                    }
                }else{
                    permissions[plugin].controllers[controller] = defPermissions[plugin].controllers[controller];
                }
            }
        }else{
            permissions[plugin] = defPermissions[plugin];
        }
    }
    return permissions;
}
const createAdminPermissions = async(config={enabled: true, purpose:""})=>{
    const permissions = await strapi.plugins[
        'users-permissions'
    ].services.userspermissions.getActions();
    let newPermissions = {};   
    for(let plugin in permissions){
        if(!systemPlugins.includes(plugin)){
            newPermissions[plugin] = {"controllers":{},"information": {}};
            for(controller in permissions[plugin].controllers){
                if(!systemControllers.includes(controller)){
                    newPermissions[plugin].controllers[controller] = {};//permissions[plugin].controllers[controller];
                    for(action in permissions[plugin].controllers[controller]){
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
    getDefaultPermissions:getDefaultPermissions,
    createAdminPermissions:createAdminPermissions
}