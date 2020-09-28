module.exports = ({ env }) => ({
  graphql: {
    endpoint: '/graphql',
    tracing: true,
    shadowCRUD: true,
    playgroundAlways: false,
    depthLimit: 7,
    amountLimit: 100,
  },
  email: {
    provider: 'nodemailer',
    providerOptions: {
      host: env('SMTP_HOST', 'smtp.gmail.com'),
      port: env('SMTP_PORT', 587),
      auth: {
        user: env('SMTP_USERNAME'),
        pass: env('SMTP_PASSWORD'),
      }
      // ... any custom nodemailer options
    },
    settings: {
      defaultFrom: env('SMTP_USERNAME'),
      defaultReplyTo: env('SMTP_USERNAME'),
    }
  }
});