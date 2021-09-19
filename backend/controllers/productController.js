import Product from '../models/productModel.js'
import asyncHandler from 'express-async-handler'
import APIFeatures from '../utils/apiFeatures.js'

// Create new product   =>   /api/v1/admin/product/new
const newProduct = asyncHandler(async (req, res) => {
  const product = await Product.create(req.body)

  res.status(201).json({
    success: true,
    product,
  })
})

// Get all products   =>   /api/v1/products?keyword=apple
const getProducts = asyncHandler(async (req, res) => {
  const resPerPage = 4
  const productsCount = await Product.countDocuments()

  const apiFeatures = new APIFeatures(Product.find(), req.query)
    .search()
    .filter()
    .pagination(resPerPage)

  const products = await apiFeatures.query

  res.status(200).json({
    success: true,
    count: products.length,
    productsCount,
    products,
  })
})

// Get single product details   =>   /api/v1/product/:id
const getSingleProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id)

  if (product) {
    res.json(product)
  } else {
    res.status(404)
    throw new Error('Product not found')
  }
})

// Update Product   =>   /api/v1/admin/product/:id
const updateProduct = asyncHandler(async (req, res) => {
  let product = await Product.findById(req.params.id)
  if (product) {
    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    })
    const updatedProduct = await product.save()
    res.status(201).json(updatedProduct)
  } else {
    res.status(404)
    throw new Error('Product not found')
  }
})

// Delete Product   =>   /api/v1/admin/product/:id
const deleteProduct = async (req, res) => {
  const product = await Product.findById(req.params.id)
  if (product) {
    await product.remove()
    res.json({ message: 'Product is removed' })
  } else {
    res.status(404)
    throw new Error('Product not found')
  }
}

export {
  getProducts,
  newProduct,
  getSingleProduct,
  updateProduct,
  deleteProduct,
}
