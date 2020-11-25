'use strict'
const crypto = require('crypto');
const _ = require('lodash');
const uuidService = require('../../../services/helper/uuid');
const permissionsService = require('../../../services/helper/permissions');
const emailTemplates = require('../../../services/emailTemplates/index');
const {
  sanitizeEntity,
  getAbsoluteServerUrl
} = require('strapi-utils');
const emailRegExp = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const formatError = error => [{
  messages: [{
    id: error.id,
    message: error.message,
    field: error.field
  }]
},];
module.exports = {
  async callback(ctx) {
    const provider = ctx.params.provider || 'local';
    const params = ctx.request.body;

    const store = await strapi.store({
      environment: '',
      type: 'plugin',
      name: 'users-permissions',
    });

    if (provider === 'local') {
      if (!_.get(await store.get({ key: 'grant' }), 'email.enabled')) {
        return ctx.badRequest(null, 'This provider is disabled.');
      }

      // The identifier is required.
      if (!params.email) {
        return ctx.badRequest(
          null,
          formatError({
            id: 'Auth.form.error.email.provide',
            message: 'Please provide your e-mail.',
          })
        );
      }

      // The password is required.
      if (!params.password) {
        return ctx.badRequest(
          null,
          formatError({
            id: 'Auth.form.error.password.provide',
            message: 'Please provide your password.',
          })
        );
      }

      const query = { provider };

      // Check if the provided identifier is an email or not.
      const isEmail = emailRegExp.test(params.email);

      // Set the identifier to the appropriate query field.
      query.email = params.email.toLowerCase();

      // Check if the user exists.
      const user = await strapi.query('user', 'users-permissions').findOne(query);
      if (!user) {
        return ctx.badRequest(
          null,
          formatError({
            id: 'Auth.form.error.invalid',
            message: 'User not found',
          })
        );
      }

      if (
        _.get(await store.get({ key: 'advanced' }), 'email_confirmation') &&
        user.confirmed !== true
      ) {
        return ctx.badRequest(
          null,
          formatError({
            id: 'Auth.form.error.confirmed',
            message: 'Your account email is not confirmed',
          })
        );
      }

      if (user.blocked === true) {
        return ctx.badRequest(
          null,
          formatError({
            id: 'Auth.form.error.blocked',
            message: 'Your account has been blocked by an administrator',
          })
        );
      }

      // The user never authenticated with the `local` provider.
      if (!user.password) {
        return ctx.badRequest(
          null,
          formatError({
            id: 'Auth.form.error.password.local',
            message:
              'This user never set a local password, please login with the provider used during account creation.',
          })
        );
      }

      const validPassword = strapi.plugins['users-permissions'].services.user.validatePassword(
        params.password,
        user.password
      );
      if (!validPassword) {
        return ctx.badRequest(
          null,
          formatError({
            id: 'Auth.form.error.invalid',
            message: 'email or password invalid.',
          })
        );
      } else {
        ctx.send({
          jwt: strapi.plugins['users-permissions'].services.jwt.issue({
            id: user.id,
          }),
          user: sanitizeEntity(user.toJSON ? user.toJSON() : user, {
            model: strapi.query('user', 'users-permissions').model,
          }),
        });
      }
    } else {
      if (!_.get(await store.get({ key: 'grant' }), [provider, 'enabled'])) {
        return ctx.badRequest(
          null,
          formatError({
            id: 'provider.disabled',
            message: 'This provider is disabled.',
          })
        );
      }

      // Connect the user with the third-party provider.
      let user, error;
      try {
        [user, error] = await strapi.plugins['users-permissions'].services.providers.connect(
          provider,
          ctx.query
        );
      } catch ([user, error]) {
        return ctx.badRequest(null, error === 'array' ? error[0] : error);
      }

      if (!user) {
        return ctx.badRequest(null, error === 'array' ? error[0] : error);
      }

      ctx.send({
        jwt: strapi.plugins['users-permissions'].services.jwt.issue({
          id: user.id,
        }),
        user: sanitizeEntity(user.toJSON ? user.toJSON() : user, {
          model: strapi.query('user', 'users-permissions').model,
        }),
      });
    }
  },
  async register(ctx) {

    const pluginStore = await strapi.store({
      environment: '',
      type: 'plugin',
      name: 'users-permissions',
    });

    const settings = await pluginStore.get({
      key: 'advanced',
    });

    if (!settings.allow_register) {
      return ctx.badRequest(
        null,
        formatError({
          id: 'Auth.advanced.allow_register',
          message: 'Register action is currently disabled.',
        })
      );
    }

    const params = {
      ..._.omit(ctx.request.body, ['confirmed', 'resetPasswordToken']),
      provider: 'local',
    };

    // Password is required.
    if (!params.password) {
      return ctx.badRequest(
        null,
        formatError({
          id: 'Auth.form.error.password.provide',
          message: 'Please provide your password.',
        })
      );
    }

    // Email is required.
    if (!params.email) {
      return ctx.badRequest(
        null,
        formatError({
          id: 'Auth.form.error.email.provide',
          message: 'Please provide your email.',
        })
      );
    }

    // Throw an error if the password selected by the user
    // contains more than two times the symbol '$'.
    if (strapi.plugins['users-permissions'].services.user.isHashed(params.password)) {
      return ctx.badRequest(
        null,
        formatError({
          id: 'Auth.form.error.password.format',
          message: 'Your password cannot contain more than three times the symbol `$`.',
        })
      );
    }
    // Check if the provided email is valid or not.
    const isEmail = emailRegExp.test(params.email);

    if (isEmail) {
      params.email = params.email.toLowerCase();
    } else {
      return ctx.badRequest(
        null,
        formatError({
          id: 'Auth.form.error.email.format',
          message: 'Please provide valid email address.',
        })
      );
    }

    params.password = await strapi.plugins['users-permissions'].services.user.hashPassword(params);

    const user = await strapi.query('user', 'users-permissions').findOne({
      email: params.email,
    });

    if (user && user.provider === params.provider) {
      return ctx.badRequest(
        null,
        formatError({
          id: 'Auth.form.error.email.taken',
          message: 'Email is already taken.',
        })
      );
    }

    if (user && user.provider !== params.provider && settings.unique_email) {
      return ctx.badRequest(
        null,
        formatError({
          id: 'Auth.form.error.email.taken',
          message: 'Email is already taken.',
        })
      );
    }

    try {
      if (!settings.email_confirmation) {
        params.confirmed = true;
      }

      let uuid = await uuidService.generateUuid();

      const account = await strapi.query('account').create({
        name: params.email,
        account_no: uuid
      });
      params.account = account.id;
      params.organization.account = params.account;

      const organization = await strapi.query('organization').create(params.organization);
      params.organization = organization.id;
    /* 
      // Create role
      const permissions = await permissionsService.createAdminPermissions();
      const roleParams = {
        name: "Owner",
        type: `owner-org-${organization.id}`,
        users: [],
        organization: organization.id,
        description: `This is default role.`,
        permissions: permissions
      };
      await strapi.plugins['users-permissions'].services.userspermissions.createRole(
        roleParams
      );
      const role = await strapi.query('role', 'users-permissions').findOne({
        type: roleParams.type, organization: roleParams.organization
      },[]);
    */
      const role = await strapi.query('role', 'users-permissions').findOne({
        type: `owner`
      },[]);
      params.role = role.id;
      const user = await strapi.query('user', 'users-permissions').create(params);
      user.organization = organization;

      let workSpaceParams = {
        organization: organization.id,
        name: "DEFAULT",
        short_name: "DEFAULT"
      };
      const workspace = await strapi.query('workspace').create(workSpaceParams);
      user.organization.workspace = workspace;

      const jwt = strapi.plugins['users-permissions'].services.jwt.issue(
        _.pick(user.toJSON ? user.toJSON() : user, ['id'])
      );

      if (settings.email_confirmation) {
        const settings = await pluginStore.get({
          key: 'email'
        }).then(storeEmail => {
          try {
            return storeEmail['email_confirmation'].options;
          } catch (error) {
            return {};
          }
        });

        settings.message = await strapi.plugins[
          'users-permissions'
        ].services.userspermissions.template(settings.message, {
          URL: `${strapi.config.server.url}/auth/email-confirmation`,
          USER: _.omit(user.toJSON ? user.toJSON() : user, [
            'password',
            'resetPasswordToken',
            'role',
            'provider',
          ]),
          CODE: jwt,
        });

        settings.object = await strapi.plugins[
          'users-permissions'
        ].services.userspermissions.template(settings.object, {
          USER: _.omit(user.toJSON ? user.toJSON() : user, [
            'password',
            'resetPasswordToken',
            'role',
            'provider',
          ]),
        });

        try {
          // Send an email to the user.
          await strapi.plugins['email'].services.email.send({
            to: (user.toJSON ? user.toJSON() : user).email,
            from: settings.from.email && settings.from.name ?
              `${settings.from.name} <${settings.from.email}>` :
              undefined,
            replyTo: settings.response_email,
            subject: settings.object,
            text: settings.message,
            html: settings.message,
          });
        } catch (err) {
          return ctx.badRequest(null, err);
        }
      }

      const sanitizedUser = sanitizeEntity(user.toJSON ? user.toJSON() : user, {
        model: strapi.query('user', 'users-permissions').model,
      });
      if (settings.email_confirmation) {
        ctx.send({
          user: sanitizedUser,
        });
      } else {
        ctx.send({
          jwt,
          user: sanitizedUser,
        });
      }
    } catch (err) {
      const adminError = _.includes({
        id: 'Auth.form.error.email.taken',
        message: 'Email already taken'
      });
      ctx.badRequest(null, formatError(adminError));
    }
  },
  async update(ctx) {
    try {
      
      if(ctx.request.body && ctx.request.body.password){
        const password = await strapi.plugins['users-permissions'].services.user.hashPassword({
          password: ctx.request.body.password,
        });
        ctx.request.body.password = password
      }
      const user = await strapi.query('user', 'users-permissions').findOne({ id: ctx.params.id });

      if (!user) {
        return ctx.badRequest(
          null,
          formatError({
            id: 'Auth.form.error.invalid',
            message: 'user not found!',
          })
        );
      }
      return await strapi
        .query("user", "users-permissions")
        .update({ id: ctx.params.id }, ctx.request.body);
    } catch (error) {
      return ctx.badRequest(null, error.message);
    }
  },
  async resetPassword(ctx) {

    const params = _.assign({}, ctx.request.body, ctx.params);
    if (
      params.password &&
      params.passwordConfirmation &&
      params.password === params.passwordConfirmation
    ) {
      const user = await strapi
        .query('user', 'users-permissions')
        .findOne({ id: params.id });

      if (!user) {
        return ctx.badRequest(
          null,
          formatError({
            id: 'Auth.form.error.user.provide',
            message: 'Incorrect user provided.',
          })
        );
      }

      const password = await strapi.plugins['users-permissions'].services.user.hashPassword({
        password: params.password,
      });

      // Update the user.
      return await strapi
        .query('user', 'users-permissions')
        .update({ id: user.id }, { password: password });

    } else if (
      params.password &&
      params.passwordConfirmation &&
      params.password !== params.passwordConfirmation
    ) {
      return ctx.badRequest(
        null,
        formatError({
          id: 'Auth.form.error.password.matching',
          message: 'Passwords do not match.',
        })
      );
    } else {
      return ctx.badRequest(
        null,
        formatError({
          id: 'Auth.form.error.params.provide',
          message: 'Incorrect params provided.',
        })
      );
    }
  },
  async inviteUser(ctx) {
    let payload = ctx.request.body.input;
    let roleQuery = {
      id: payload.role,
      organization: ctx.state.user.organization
    };
    const role = await strapi.query('role', 'users-permissions').findOne(roleQuery);
    if (!role) {
      let roleError = {
        id: 'Auth.form.error.role.notfound',
        email: payload.email,
        message: 'Role not found'
      };
      return ctx.throw(400, roleError);
    }
    let params = {
      email: payload.email,
      role: payload.role,
      confirmed: false,
      organization: ctx.state.user.organization,
      account: ctx.state.user.account,
      provider: 'local'
    }
    const userExists = await strapi.query('user', 'users-permissions').findOne({ email: params.email });
    if (userExists) {
      let userError = {
        id: 'Auth.form.error.user.email.taken',
        email: payload.email,
        message: 'Email already taken.'
      };
      return ctx.throw(400, userError);
    }
    const user = await strapi.query('user', 'users-permissions').create(params);
    const jwt = strapi.plugins['users-permissions'].services.jwt.issue(
      _.pick(user.toJSON ? user.toJSON() : user, ['id'])
    );

    // send email
    try {
      let redirectToUrl = payload.redirectTo ? payload.redirectTo :`${ctx.request.host.includes('localhost') ? 'http':'https'}://${ctx.request.host+process.env.REDIRECT_TO_URL}`;
      let emailInfo = {
        email:user.email,
        link:`${process.env.ServerUrl?process.env.ServerUrl:getAbsoluteServerUrl(strapi.config)}/auth/email-confirmation?confirmation=${jwt}&redirectTo=${redirectToUrl}`
      }
      let template = await emailTemplates.userInvitation(emailInfo)

      await strapi.plugins.email.services.email.send(template)
      return ctx.send({ id:user.id, email: user.email, message: `Invitation sent to email address.` })

    } catch (error) {
      return ctx.throw(400, error)
    }
  },
  async emailConfirmation(ctx, next, returnUser) {
    const params = ctx.query;

    const decodedToken = await strapi.plugins['users-permissions'].services.jwt.verify(
      params.confirmation
    );

    let user = await strapi.plugins['users-permissions'].services.user.edit(
      { id: decodedToken.id },
      { confirmed: true }
    );

    if (returnUser) {
      ctx.send({
        jwt: strapi.plugins['users-permissions'].services.jwt.issue({
          id: user.id,
        }),
        user: sanitizeEntity(user.toJSON ? user.toJSON() : user, {
          model: strapi.query('user', 'users-permissions').model,
        }),
      });
    } else {
      const settings = await strapi
        .store({
          environment: '',
          type: 'plugin',
          name: 'users-permissions',
          key: 'advanced',
        })
        .get();
      let url = params.redirectTo || settings.email_confirmation_redirection || '/';

      ctx.redirect(`${url}?token=${params.confirmation}`);
    }
  },
  async list(ctx) {
    try {
      const params = { ...ctx.query }
      return await strapi.query('user', 'users-permissions').find(params);
       
    } catch (error) {
      return ctx.badRequest(null, error.message);
    }
  },
  async count(ctx){
    try {
      const params = { ...ctx.query }
      return await strapi.query('user', 'users-permissions').count(params);
    } catch (error) {
      return ctx.badRequest(null, error.message);
    }
  }
};
