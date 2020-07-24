module.exports = async (ctx, next) => {
    try{
        Object.assign(ctx.query, {
            account: ctx.state.user.account
        });
        return await next();
    }catch(err){
        ctx.badRequest(`Error occured - ${err.message}`);
    }
};