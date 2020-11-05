module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  url:env('URL',`http://localhost:${env.int('PORT', 1337)}`)
});
