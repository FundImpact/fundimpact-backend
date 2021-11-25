module.exports = async (ctx, next) => {
    try{
        Object.assign(ctx.query, {
            id: ctx.state.user.organization
        });
        return await next();
    }catch(err){
        ctx.badRequest(`Error occured - ${err.message}`);
    }
};
