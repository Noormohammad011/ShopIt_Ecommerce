import React, { useEffect, useState } from 'react'
import MetaData from './layout/MetaData'
import Pagination from 'react-js-pagination'
import { useDispatch, useSelector } from 'react-redux'
import { listProducts } from '../actions/productActions'
import Product from './product/Product'
import Loader from './layout/Loader'
import { useAlert } from 'react-alert'

const Home = () => {


  const [currentPage, setCurrentPage] = useState(1)
  // const [price, setPrice] = useState([1, 1000])
  // const [category, setCategory] = useState('')
  // const [rating, setRating] = useState(0)




  const dispatch = useDispatch()
  const alert = useAlert()
  const productList = useSelector((state) => state.productList)
  const { loading, error, products, productsCount, resPerPage } = productList



  useEffect(() => {
    if (error) {
      return alert.error(error)
    }
    dispatch(listProducts(currentPage))
  }, [dispatch, alert, error, currentPage])


  function setCurrentPageNo(pageNumber) {
    setCurrentPage(pageNumber)
  }


  return (
    <>
      <MetaData title={'Buy Best products online'} />
      <h1 id='products_heading'>Latest Products</h1>
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
      {resPerPage <= productsCount && (
        <div className='d-flex justify-content-center mt-5'>
          <Pagination
            activePage={currentPage}
            itemsCountPerPage={resPerPage}
            totalItemsCount={productsCount}
            onChange={setCurrentPageNo}
            nextPageText={'Next'}
            prevPageText={'Prev'}
            firstPageText={'First'}
            lastPageText={'Last'}
            itemClass='page-item'
            linkClass='page-link'
          />
        </div>
      )}
    </>
  )
}

export default Home


