import React, { useEffect, useReducer, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import ListGroup from 'react-bootstrap/ListGroup';
import Rating from '../component/rating';
import Card from 'react-bootstrap/Card';
import Badge from 'react-bootstrap/Badge';
import Button from 'react-bootstrap/Button';
import { Helmet } from 'react-helmet-async';
import { Store } from '../Store';

const reduser = (state, action) => {
    switch (action.type) {
        case "FETCH_REQUEST":
            return { ...state, loading: true };
        case "FETCH_SUCCESS":
            return { ...state, product: action.payload, loading: false };
        case "FETCH_FALD":
            return { ...state, loading: false, error: action.payload };
        default:
            return state;
    }
}

const ProductScreen = () => {
    const navigation = useNavigate();
    const params = useParams();
    const { slug } = params;
    const [{ loading, product, error }, dispatch] = useReducer(reduser, {
        loading: true,
        product: [],
        error: "",
    })

    useEffect(() => {
        const fetchData = async () => {
            // const result = await axios.get('/api/products');
            // setProduct(result.data);
            dispatch({ type: "FETCH_REQUEST" });
            try {
                const result = await axios.get(`/api/products/slug/${slug}`);

                dispatch({ type: "FETCH_SUCCESS", payload: result.data });
            } catch (err) {
                dispatch({ type: "FETCH_FALD", payload: err.message });
            }
        };
        fetchData();
    }, [slug]);

    const { state, dispatch: ctxDispatch } = useContext(Store);
    const { cart } = state;
    console.log(cart)
    const CartHandler = async () => {
        const existItem = cart.cartItem.find((x) => x._id === product._id);

        const quantity = existItem ? existItem.quantity + 1 : 1;

        const { data } = await axios.get(`/api/products/${product._id}`);

        if (data.countInStock < quantity) {
            window.alert('Sorry. Product is out of stock');
            return;
        }
        ctxDispatch({
            type: "ADD_TO_CART",
            payload: { ...product, quantity },
        });
        navigation('/cart')
    };

    return loading ? (
        <div>Loading...</div>
    ) : error ? (
        <div>{error}</div>
    ) : (
        <div>
            <Row>
                <Col md={6}>
                    <img src={product.image} alt={product.slug} className='img-large' />
                </Col>
                <Col md={3}>
                    <ListGroup variant="flush">
                        <ListGroup.Item>
                            <Helmet>
                                <title>{product.name}</title>
                            </Helmet>
                            <h1>{product.name}</h1>
                        </ListGroup.Item>
                        <ListGroup.Item>
                            <Rating
                                rating={product.rating}
                                numReviews={product.numReviews}>
                            </Rating>
                        </ListGroup.Item>
                        <ListGroup.Item>
                            price:&#8377;{product.price}
                        </ListGroup.Item>
                        <ListGroup.Item>
                            <p>Description:{product.description}</p>
                        </ListGroup.Item>
                    </ListGroup>
                </Col>
                <Col md={3}>
                    <Card>
                        <Card.Body>

                            <ListGroup variant='flush'>
                                <ListGroup.Item>
                                    <Row>
                                        <Col>Price</Col>
                                        <Col>&#8377;{product.price}</Col>
                                    </Row>
                                </ListGroup.Item>
                                <ListGroup.Item>
                                    <Row>
                                        <Col>Status</Col>
                                        <Col>{product.countInStock > 0 ?
                                            (<Badge bg="success">In Stock</Badge>
                                            ) : (
                                                <Badge bg="danger">Unavailable</Badge>
                                            )}</Col>
                                    </Row>
                                </ListGroup.Item>
                                {product.countInStock > 0 && (
                                    <ListGroup.Item>
                                        <div className="d-grid">
                                            <Button onClick={CartHandler} variant="primary">Add to Cart</Button>
                                        </div>
                                    </ListGroup.Item>
                                )}
                            </ListGroup>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    )
}


export default ProductScreen
