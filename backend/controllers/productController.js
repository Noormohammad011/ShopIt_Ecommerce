import Product from '../models/product.js'

// Create new product   =>   /api/v1/admin/product/new

const newProduct = async (req, res) => {
  const product = await Product.create(req.body)

  res.status(201).json({
    success: true,
    product,
  })
}

const getProducts = async (req, res) => {
  const products = await Product.find()
  res.status(200).json({
    success: true,
    count: products.length,
    products,
  })
}

const getSingleProduct = async (req, res) => {
  const product = await Product.findById(req.params.id)

  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Product not found',
    })
  }
  res.status(200).json({
    success: true,
    product,
  })
}

const updateProduct = async (req, res) => {
  let product = await Product.findById(req.params.id)

  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Product not found',
    })
  }

  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  })
  res.status(200).json({
    success: true,
    product,
  })
}

const deleteProduct = async (req, res) => {
  const product = await Product.findById(req.params.id)

  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Product not found',
    })
  }
  await product.remove()

  res.status(200).json({
    success: true,
    message: 'Product is deleted',
  })
}

export {
  getProducts,
  newProduct,
  getSingleProduct,
  updateProduct,
  deleteProduct,
}
