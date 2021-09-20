import Order from '../models/orderModel.js'
import Product from '../models/productModel.js'
import asyncHandler from 'express-async-handler'

// Create a new order   =>  /api/v1/order/new
const newOrder = asyncHandler(async (req, res, next) => {
  const {
    orderItems,
    shippingInfo,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    paymentInfo,
  } = req.body

  const order = await Order.create({
    orderItems,
    shippingInfo,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    paymentInfo,
    paidAt: Date.now(),
    user: req.user._id,
  })

  res.status(200).json({
    success: true,
    order,
  })
})

// Get single order   =>   /api/v1/order/:id
const getSingleOrder = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id).populate(
    'user',
    'name email'
  )

  if (order) {
    res.status(200).json({
      success: true,
      order,
    })
  } else {
    res.status(404)
    throw new Error('No Order found with this ID')
  }
})

// Get logged in user orders   =>   /api/v1/orders/me
const myOrders = asyncHandler(async (req, res, next) => {
  const orders = await Order.find({ user: req.user.id })

  res.status(200).json({
    success: true,
    orders,
  })
})

// Get all orders - ADMIN  =>   /api/v1/admin/orders/
const allOrders = asyncHandler(async (req, res, next) => {
  const orders = await Order.find()

  let totalAmount = 0

  orders.forEach((order) => {
    totalAmount += order.totalPrice
  })

  res.status(200).json({
    success: true,
    totalAmount,
    orders,
  })
})

// Update / Process order - ADMIN  =>   /api/v1/admin/order/:id
const updateOrder = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id)

  if (order.orderStatus === 'Delivered') {
    res.status(400)
    throw new Error('You have already delivered this order')
  }

  order.orderItems.forEach(async (item) => {
    await updateStock(item.product, item.quantity)
  })

  order.orderStatus = req.body.status
  order.deliveredAt = Date.now()

  await order.save()

  res.status(200).json({
    success: true,
  })
})

async function updateStock(id, quantity) {
  const product = await Product.findById(id)

  product.stock = product.stock - quantity

  await product.save({ validateBeforeSave: false })
}

// Delete order   =>   /api/v1/admin/order/:id
const deleteOrder = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id)

  if (!order) {
    return next(new Error('No Order found with this ID'))
  }

  await order.remove()

  res.status(200).json({
    success: true,
  })
})

export {
  newOrder,
  getSingleOrder,
  myOrders,
  allOrders,
  updateOrder,
  deleteOrder,
}
