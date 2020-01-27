const User = require('../../models/users')

async function createUser (ctx) {
  const user = new User(ctx.request.body.user)

  // Enforce default value of 'user'
  user.type = 'user'

  try {
    await user.save()
  } catch (err) {
    ctx.throw(422, err.message)
  }

  const token = user.generateToken()
  const response = user.toJSON()

  delete response.password

  ctx.body = {
    user: response,
    token
  }
}

async function getUsers (ctx) {
  const users = await User.find({}, '-password')
  ctx.body = { users }
}

async function getUser (ctx, next) {
  try {
    const user = await User.findById(ctx.params.id, '-password')
    if (!user) {
      ctx.throw(404)
    }

    ctx.body = {
      user
    }
  } catch (err) {
    if (err === 404 || err.name === 'CastError') {
      ctx.throw(404)
    }

    ctx.throw(500)
  }

  if (next) {
    return next()
  }
}

async function updateUser (ctx) {
  const user = ctx.body.user

  // Save a copy of the original user type.
  const userType = user.type

  Object.assign(user, ctx.request.body.user)

  // Unless the calling user is an admin, they can not change the user type.
  if (userType !== 'admin') {
    user.type = userType
  }

  await user.save()

  ctx.body = {
    user
  }
}

async function deleteUser (ctx) {
  const user = ctx.body.user

  await user.remove()

  ctx.status = 200
  ctx.body = {
    success: true
  }
}

module.exports = {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser
}
