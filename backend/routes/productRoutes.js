import express from 'express'
import {
  getProducts,
  newProduct,
  getSingleProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/productController.js'
import { isAuthenticatedUser } from '../middlewares/authMiddleware.js'

const router = express.Router()

router.route('/products').get(getProducts)
router.route('/product/:id').get(getSingleProduct)
router.route('/admin/product/new').post(newProduct)
router.route('/admin/product/:id').put(updateProduct).delete(deleteProduct)

export default router
