import Product from '../models/productModel.js'
import asyncHandler from 'express-async-handler'
import APIFeatures from '../utils/apiFeatures.js'

// Create new product   =>   /api/v1/admin/product/new
const newProduct = asyncHandler(async (req, res) => {
  req.body.user = req.user.id
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
  apiFeatures.pagination(resPerPage) 
  let products = await apiFeatures.query
  let filteredProductsCount = products.length

  
  // products = await apiFeatures.query

  res.status(200).json({
    success: true,
    productsCount,
    resPerPage,
    filteredProductsCount,
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

// Create new review   =>   /api/v1/review
const createProductReview = asyncHandler(async (req, res, next) => {
  const { rating, comment, productId } = req.body

  const review = {
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment,
  }

  const product = await Product.findById(productId)

  const isReviewed = product.reviews.find(
    (r) => r.user.toString() === req.user._id.toString()
  )

  if (isReviewed) {
    product.reviews.forEach((review) => {
      if (review.user.toString() === req.user._id.toString()) {
        review.comment = comment
        review.rating = rating
      }
    })
  } else {
    product.reviews.push(review)
    product.numOfReviews = product.reviews.length
  }

  product.ratings =
    product.reviews.reduce((acc, item) => item.rating + acc, 0) /
    product.reviews.length

  await product.save({ validateBeforeSave: false })

  res.status(200).json({
    success: true,
  })
})

// Get Product Reviews   =>   /api/v1/reviews
const getProductReviews = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.query.id)

  res.status(200).json({
    success: true,
    reviews: product.reviews,
  })
})

// Delete Product Review   =>   /api/v1/reviews
const deleteReview = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.query.productId)

  const reviews = product.reviews.filter(
    (review) => review._id.toString() !== req.query.id.toString()
  )

  const numOfReviews = reviews.length

  const ratings =
    product.reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length

  await Product.findByIdAndUpdate(
    req.query.productId,
    {
      reviews,
      ratings,
      numOfReviews,
    },
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  )

  res.status(200).json({
    success: true,
  })
})

export {
  getProducts,
  newProduct,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
  getProductReviews,
  deleteReview,
}
