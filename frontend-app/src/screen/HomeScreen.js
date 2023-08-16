import React, { useEffect, useReducer } from 'react';
// import data from '../data';
import axios from 'axios';
import Product from '../component/product';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import { Helmet } from 'react-helmet-async';
const reduser = (state, action) => {
    switch (action.type) {
        case "FETCH_REQUEST":
            return { ...state, loading: true };
        case "FETCH_SUCCESS":
            return { ...state, products: action.payload, loading: false };
        case "FETCH_FALD":
            return { ...state, loading: false, error: action.payload };
        default:
            return state;
    }
}

const HomeScreen = () => {

    const [{ loading, products, error }, dispatch] = useReducer(reduser, {
        loading: true,
        products: [],
        error: "",
    })
    // const [products, setProduct] = useState([]);
    useEffect(() => {
        const fetchData = async () => {
            // const result = await axios.get('/api/products');
            // setProduct(result.data);
            dispatch({ type: "FETCH_REQUEST" });
            try {
                const result = await axios.get('/api/products');
                dispatch({ type: "FETCH_SUCCESS", payload: result.data });
            } catch (err) {
                dispatch({ type: "FETCH_FALD", payload: err.message });
            }
        };
        fetchData();
    }, []);
    return (
        <div>
            <Helmet><title>Amazone</title></Helmet>
            <h1>Featured Products</h1>
            <div className="productsContainer">
                {loading ? (
                    <div>Loading.....</div>
                )
                    : error ? (
                        <div>{error}</div>
                    ) : (
                        <Row>
                            {products.map(product => (
                                <Col key={product.slug} sm={6} md={4} lg={3} className="mb-3" >
                                    <Product product={product}></Product>
                                </Col>
                            ))}
                        </Row>

                    )}
            </div>
        </div>
    )
}

export default HomeScreen
