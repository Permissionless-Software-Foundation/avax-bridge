const passport = require('koa-passport')

async function authUser (ctx, next) {
  return passport.authenticate('local', (err, user, info, status) => {
    if (err) throw err

    if (!user) {
      ctx.throw(401)
    }

    const token = user.generateToken()

    const response = user.toJSON()

    delete response.password

    ctx.body = {
      token,
      user: response
    }
  })(ctx, next)
}

module.exports.authUser = authUser
