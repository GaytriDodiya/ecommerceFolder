import React, { useEffect, useReducer, useState } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { getError } from '../utils';
import { toast } from 'react-toastify';
import { Helmet } from 'react-helmet-async';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Rating from '../component/Rating';
import LodingBox from '../component/LoadingBox';
import MessageBox from '../component/messageBox';
import Button from 'react-bootstrap/Button';
import Product from '../component/product';
import LinkContainer from 'react-router-bootstrap/LinkContainer';
const reducer = (state, action) => {
    switch (action.type) {
        case "FATCH_REQUEST":
            return { ...state, loading: true };
        case "FATCH_SUCCESS":
            return {
                ...state,
                products: action.payload.products,
                page: action.payload.page,
                pages: action.payload.pages,
                countProducts: action.payload.countProducts,
                loading: false
            };
        case "FATCH_FAIL":
            return { ...state, loading: false, error: action.payload };
        default:
            return state;
    }
}

const prices = [
    {
        name: '1000 to 2000',
        value: '1000-2000',
    },
    {
        name: '2000 to 3000',
        value: '2000-3000',
    },
    {
        name: '4000 to 5000',
        value: '3000-4000',
    },
];

const ratings = [{
    name: '4stars & up',
    rating: 4,
},

{
    name: '3stars & up',
    rating: 3,
},

{
    name: '2stars & up',
    rating: 2,
},

{
    name: '1stars & up',
    rating: 1,
},];
export default function SearchScreen() {
    const navigate = useNavigate();
    const { search } = useLocation();
    const sp = new URLSearchParams(search);
    const category = sp.get("category") || "all";
    const query = sp.get("query") || "all";
    const price = sp.get("price") || "all";
    const rating = sp.get("rating") || "all";
    const order = sp.get("order" || "newest");
    const page = sp.get("page") || 1;
    const [{ error, products, pages, loading, countProducts }, dispatch] = useReducer(reducer, {
        loading: true,
        error: "",
    })

    useEffect(() => {
        const fatchData = async () => {
            try {
                const { data } = await axios.get(`/api/products/search?page=${page}&query=${query}&category=${category}&price=${price}&rating=${rating}&order=${order}`)
                dispatch({ type: "FATCH_SUCCESS", payload: data });
            } catch (error) {
                dispatch({ type: "FATCH_FAIL", payload: getError(error) })
            }
        }
        fatchData();

    }, [error, rating, category, price, query, order, page]);



    const [categories, setCategories] = useState([]);
    useEffect(() => {
        const fatchCategories = async () => {
            try {
                const { data } = await axios.get(`/api/products/categories`);
                setCategories(data)
            } catch (error) {
                toast.error(getError(error));
            }
        };
        fatchCategories();
    }, [dispatch]);

    const getFilterUrl = (filter) => {
        const filterCategory = filter.category || category;
        const filterQuery = filter.query || query;
        const filterPrice = filter.price || price;
        const filterRating = filter.rating || rating;
        const shortOrder = filter.order || order;
        const filterPage = filter.page || page;
        const searchurl = `/search?category=${filterCategory}&query=${filterQuery}&price=${filterPrice}&rating=${filterRating}&page=${filterPage}&order=${shortOrder}`;
        return searchurl
        // return `/search?page=${filterPage}&query=${filterQuery}&category=${filterCategory}&price=${filterPrice}&rating=${filterRating}&order=${shortOrder}`
        // return "";
    }
    return (
        <div>
            <Helmet>
                <title>Search Product</title>
            </Helmet>
            <Row>
                <Col className="md-3">
                    <h3>Department</h3>
                    <div>
                        <ul>
                            <li>
                                <Link className={'all' === category ? 'text-bold' : ''} to={getFilterUrl({ category: 'all' })}>Any</Link>
                            </li>
                            {categories.map((c) => (
                                <li key={c}>
                                    <Link className={c === category ? 'text-bold' : ''} to={getFilterUrl({ category: c })}>{c}</Link>
                                </li>
                            ))}
                        </ul>

                    </div>
                    <div><h3>Price</h3>
                        <ul>
                            <li>
                                <Link className={'all' === price ? 'text-bold' : ''} to={getFilterUrl({ price: 'all' })}>Any</Link>
                            </li>
                            {prices.map((p) => (
                                <li key={p.value}>
                                    <Link className={p.value === price ? 'text-bold' : ''} to={getFilterUrl({ price: p.value })} >{p.name}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h3>Avg. Customer Review</h3>
                        <ul>
                            {ratings.map((r) => (
                                <li key={r.name}>
                                    <Link to={getFilterUrl({ rating: r.rating })} className={`${r.rating}` === `${rating}` ? 'text-bold' : ''}>
                                        <Rating caption={'& up'} rating={r.rating}></Rating>
                                    </Link>
                                </li>
                            ))}
                            <li>
                                <Link className={rating ? 'text-bold' : ''} to={getFilterUrl({ rating: 'all' })}>
                                    <Rating caption={'& up'} rating={0}></Rating>
                                </Link>
                            </li>
                        </ul>
                    </div>
                </Col>
                <Col md={9}>
                    {loading ? (<LodingBox></LodingBox>) :
                        error ? (<MessageBox></MessageBox>)
                            : (<>
                                <Row className='justify-content-between mb-3'>
                                    <Col md={6}>
                                        <div>

                                            {countProducts === 0 ? 'No' : countProducts} Results
                                            {query !== 'all' && ': ' + query}
                                            {category !== 'all' && ': ' + category}
                                            {price !== 'all' && ':price ' + price}
                                            {rating !== 'all' && ':rating ' + rating + '& up'}
                                            {query !== 'all' ||
                                                category !== 'all' ||
                                                rating !== 'all' ||
                                                price !== 'all' ? (
                                                <Button variant="light" onClick={() => navigate('/search')}>
                                                    <i className='fas fa-times-circle'></i>
                                                </Button>) : null}
                                        </div>
                                    </Col>
                                    <Col className='text-end'>
                                        Sort by{''}
                                        <select value={order} onChange={(e) => navigate(getFilterUrl({ order: e.target.value }))}>
                                            <option value="newest">Newest Arrivels</option>
                                            <option value="lowest">Price:Low to High</option>
                                            <option value="highest">Price:High to Low</option>
                                            <option value="toprated">Avg. Customer Reviews</option>
                                        </select>
                                    </Col>
                                </Row>
                                {products.length === 0 && (
                                    <MessageBox>No Product Found</MessageBox>
                                )}
                                <Row>
                                    {products.map((product) => (
                                        <Col sm={6} lg={4} className='mb-3' key={product._id}>
                                            <Product product={product}></Product>
                                        </Col>
                                    ))}
                                </Row>
                                <div>
                                    {[...Array(pages).keys()].map((x) => (
                                        <LinkContainer key={x + 1} className='mx-1'
                                            to={{ pathname: '/search', search: getFilterUrl({ page: x + 1 }) }}
                                        >
                                            <Button
                                                className={Number(page) === x + 1 ? 'text-bold' : ''}
                                                variant='light'>{x + 1}
                                            </Button>
                                        </LinkContainer>
                                    ))}
                                </div>
                            </>)}
                </Col>
                {/*    // to={getFilterUrl({ page: x + 1 })} */}
            </Row>
        </div>
    )
}
