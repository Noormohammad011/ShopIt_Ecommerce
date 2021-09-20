import React, { useEffect } from 'react'
import MetaData from './layout/MetaData'
import { useDispatch, useSelector } from 'react-redux'
import { listProducts } from '../actions/productActions'
import Product from './product/Product'
import Loader from './layout/Loader'
import { useAlert } from 'react-alert'

const Home = () => {
  const dispatch = useDispatch()
  const alert = useAlert()
  const productList = useSelector((state) => state.productList)
  const { loading, error, products, productsCount } = productList

  useEffect(() => {
    if (error) {
      return alert.error(error)
    }
    dispatch(listProducts())
  }, [dispatch, alert, error])

  return (
    <>
      <MetaData title={'Buy Best products online'} />
      <h1 id='products_heading'>Latest Products {productsCount}</h1>
      <section id='products' className='container mt-5'>
        <div className='row'>
          {loading ? (
            <Loader />
          ) : (
            products &&
            products.map((product) => (
              <Product key={product._id} product={product} />
            ))
          )}
        </div>
      </section>
    </>
  )
}

export default Home


