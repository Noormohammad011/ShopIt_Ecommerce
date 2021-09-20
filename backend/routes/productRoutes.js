import express from 'express'
import {
  getProducts,
  newProduct,
  getSingleProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/productController.js'
import {
  authorizeRoles,
  isAuthenticatedUser,
} from '../middlewares/authMiddleware.js'

const router = express.Router()

router.route('/products').get(getProducts)
router.route('/product/:id').get(getSingleProduct)
router
  .route('/admin/product/new')
  .post(isAuthenticatedUser, authorizeRoles('admin'), newProduct)
router
  .route('/admin/product/:id')
  .put(isAuthenticatedUser, authorizeRoles('admin'), updateProduct)
  .delete(isAuthenticatedUser, authorizeRoles('admin'), deleteProduct)

export default router
