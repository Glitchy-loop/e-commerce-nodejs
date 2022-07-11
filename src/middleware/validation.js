const validation = schema => async (req, res, next) => {
  try {
    req.body = await schema.validateAsync(req.body)
    console.log(req.body)
    return next()
  } catch (err) {
    console.log(err)
    return res.status(400).send({ err: 'Incorrect data passed.' })
  }
}

module.exports = validation
