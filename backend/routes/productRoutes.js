import express from 'express'
import {
  getProducts,
  newProduct,
  getSingleProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/productController.js'

const router = express.Router()

router.route('/').get(getProducts)
router.route('/:id').get(getSingleProduct)
router.route('/admin/new').post(newProduct)
router.route('/admin/new/:id').put(updateProduct).delete(deleteProduct)

export default router
