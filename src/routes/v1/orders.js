const express = require('express')
const mysql = require('mysql2/promise')
const { mysqlConfig } = require('../../config')
const isLoggedIn = require('../../middleware/auth')

const router = express.Router()

// Get all orders
router.get('/', async (req, res) => {
  try {
    const connection = await mysql.createConnection(mysqlConfig)
    const [data] = await connection.execute(`
    SELECT * FROM orders
    `)

    if (data.length === 0) {
      await connection.end()
      return res.status(400).send({ err: 'There are no orders.' })
    }

    await connection.end()
    res.status(200).send(data)
  } catch (err) {
    return res.status(500).send({ err: 'Server issue. Try again later.' })
  }
})

const createOrderForProduct = async (connection, productsInfos, orderId) => {
  for (let i = 0; i < productsInfos.length; i++) {
    let productInfo = productsInfos[i]

    await connection.execute(`
   INSERT INTO orderToProduct (orderId, productId, quantity)
   VALUES (
    ${mysql.escape(orderId)},
     ${mysql.escape(productInfo.product.id)},
      ${mysql.escape(productInfo.quantity)}
      )
    `)

    await connection.execute(`
    UPDATE products
    SET inStock = ${mysql.escape(
      productInfo.product.inStock - productInfo.quantity
    )}
    WHERE id = ${mysql.escape(productInfo.product.id)}
    `)
  }
}

// Add new order
router.post('/add', isLoggedIn, async (req, res) => {
  try {
    const connection = await mysql.createConnection(mysqlConfig)
    const [data] = await connection.execute(`
    INSERT INTO orders (userId)
    VALUES (${mysql.escape(req.body.userId)})
    `)

    const orderId = data.insertId

    await createOrderForProduct(connection, req.body.productsInfos, orderId)

    if (!data.insertId || data.affectedRows !== 1) {
      await connection.end()
      return res.status(500).send({ err: 'Server issue. Try again later.' })
    }

    await connection.end()
    res
      .status(200)
      .send({ msg: 'Successfully added an order.', orderId: data.insertId })
  } catch (err) {
    return res.status(500).send({ err: 'Server issue. Try again later.' })
  }
})

// Get order by id
router.get('/order/:id', isLoggedIn, async (req, res) => {
  try {
    const connection = await mysql.createConnection(mysqlConfig)
    const [data] = await connection.execute(`
    SELECT orders.id AS orderId, users.email, products.title, products.price, orderToProduct.quantity, orders.timestamp
    FROM orders
      INNER JOIN orderToProduct
        ON orders.id=orderToProduct.orderId
          INNER JOIN products
            ON orderToProduct.productId=products.id
              INNER JOIN users 
                ON orders.userId = users.id
    WHERE orders.id = ${mysql.escape(req.params.id)}
    `)

    if (data.length === 0) {
      await connection.end()
      return res
        .status(400)
        .send({ err: `No orders found with ID '${req.params.id}'.` })
    }

    await connection.end()
    return res.status(200).send(data)
  } catch (err) {
    return res.status(500).send({ err: 'Server issue... Try again later.' })
  }
})

// Get all orders for admin
router.get('/all', isLoggedIn, async (req, res) => {
  try {
    const connection = await mysql.createConnection(mysqlConfig)
    const [data] = await connection.execute(`
    SELECT orders.id as orderId, users.email, productId, products.title, products.price, quantity, orders.timestamp
    FROM orders
      INNER JOIN orderToProduct
        ON orders.id=orderToProduct.orderId
        	INNER JOIN products 
            	ON orderToProduct.productId=products.id
                	INNER JOIN users 
                      ON orders.userId = users.id
    `)

    if (data.length === 0) {
      await connection.end()
      return res.status(400).send({ err: 'There are no orders.' })
    }

    await connection.end()
    res.status(200).send(data)
  } catch (err) {
    return res.status(500).send({ err: 'Server issue. Try again later.' })
  }
})

// Get all orders for customer
router.get('/customer/:id', isLoggedIn, async (req, res) => {
  try {
    const connection = await mysql.createConnection(mysqlConfig)
    const [data] = await connection.execute(`
    SELECT orders.id as orderId, users.email, productId, products.title, products.price, quantity, orders.timestamp
    FROM orders
      INNER JOIN orderToProduct
        ON orders.id=orderToProduct.orderId
        	INNER JOIN products 
            	ON orderToProduct.productId=products.id
                	INNER JOIN users 
                      ON orders.userId = users.id
                      WHERE users.id=${mysql.escape(req.params.id)}
    `)

    if (data.length === 0) {
      await connection.end()
      return res
        .status(400)
        .send({ err: `No orders found with ID '${req.params.id}'.` })
    }

    await connection.end()
    res.status(200).send(data)
  } catch (err) {
    return res.status(500).send({ err: 'Server issue. Try again later.' })
  }
})

module.exports = router
