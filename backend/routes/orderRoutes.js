import express from 'express'
import {
  allOrders,
  deleteOrder,
  getSingleOrder,
  myOrders,
  newOrder,
  updateOrder,
} from '../controllers/orderController.js'

import {
  authorizeRoles,
  isAuthenticatedUser,
} from '../middlewares/authMiddleware.js'

const router = express.Router()

router.route('order/new').post(isAuthenticatedUser, newOrder)
router.route('/order/:id').get(isAuthenticatedUser, getSingleOrder)
router.route('/orders/me').get(isAuthenticatedUser, myOrders)
router
  .route('/admin/orders/')
  .get(isAuthenticatedUser, authorizeRoles('admin'), allOrders)
router
  .route('/admin/order/:id')
  .put(isAuthenticatedUser, authorizeRoles('admin'), updateOrder)
  .delete(isAuthenticatedUser, authorizeRoles('admin'), deleteOrder)

export default router
