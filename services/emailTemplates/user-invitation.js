module.exports=async(payload)=>{
    return {
        to: payload.email,
        from: process.env.SMTP_USERNAME,
        replyTo: process.env.SMTP_USERNAME,
        subject: `FundImpact invitation`,
        text: `
            ${payload.link}
        `,
        html: `
            ${payload.link}
        `
    }
}