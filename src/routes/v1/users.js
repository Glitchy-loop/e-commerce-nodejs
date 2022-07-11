const express = require('express')
const mysql = require('mysql2/promise')
const { mysqlConfig, jwtSecret } = require('../../config')
const bcrypt = require('bcrypt')
const jsonwebtoken = require('jsonwebtoken')
const validation = require('../../middleware/validation')
const {
  loginSchema,
  registrationSchema
} = require('../../middleware/schemas/userSchemas')
const router = express.Router()

// Get all users
router.get('/', async (req, res) => {
  try {
    const connection = await mysql.createConnection(mysqlConfig)
    const [data] = await connection.execute(`
    SELECT name, email FROM users
    `)
    await connection.end()
    res.status(200).send(data)
  } catch (err) {
    return res.status(500).send({ err: 'Server issue. Try again later.' })
  }
})

// Register new user
router.post('/register', validation(registrationSchema), async (req, res) => {
  try {
    const hash = bcrypt.hashSync(req.body.password, 10)

    const connection = await mysql.createConnection(mysqlConfig)

    const [data1] = await connection.execute(`
    SELECT email FROM users
    WHERE email = ${mysql.escape(req.body.email)}
    `)

    if (data1.length > 0) {
      await connection.end()
      return res
        .status(400)
        .send({ err: 'User with such email already exist.' })
    }

    const [data] = await connection.execute(`
        INSERT INTO users (name, email, password, roles)
        VALUES (${mysql.escape(req.body.name)}, ${mysql.escape(
      req.body.email
    )}, '${hash}', ${mysql.escape(req.body.roles)})
        `)

    if (!data.insertId || data.affectedRows !== 1) {
      await connection.end()
      return res.status(500).send({ err: 'Server issue. Try again later.' })
    }

    await connection.end()
    return res.status(200).send({
      msg: 'Successfully created account',
      accountId: data.insertId
    })
  } catch (err) {
    return res.status(500).send({ err: 'Server issue. Try again later.' })
  }
})

// User login
router.post('/login', validation(loginSchema), async (req, res) => {
  try {
    const connection = await mysql.createConnection(mysqlConfig)
    const [data] = await connection.execute(`
        SELECT * from users
        WHERE email = ${mysql.escape(req.body.email)}
        `)

    if (data.length < 1) {
      await connection.end()
      return res.status(400).send({ err: 'User not found.' })
    }

    if (!bcrypt.compareSync(req.body.password, data[0].password)) {
      await connection.end()
      return res.status(400).send({ err: 'Wrong password.' })
    }

    const token = jsonwebtoken.sign({ accountId: data[0].id }, jwtSecret)

    await connection.end()
    return res.status(200).send({
      msg: 'Sucessfully logged in',
      token,
      roles: data[0].roles,
      accountId: data[0].id
    })
  } catch (err) {
    return res.status(500).send({ err: 'Server issue. Try again later.' })
  }
})

module.exports = router
