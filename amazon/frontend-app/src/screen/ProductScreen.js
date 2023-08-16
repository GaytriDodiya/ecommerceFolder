import React, { useEffect, useReducer, useContext, useRef, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import ListGroup from 'react-bootstrap/ListGroup';
import Rating from '../component/Rating';
import Card from 'react-bootstrap/Card';
import Badge from 'react-bootstrap/Badge';
import Button from 'react-bootstrap/Button';
import { Helmet } from 'react-helmet-async';
import { Store } from '../Store';
import { toast } from 'react-toastify';
import { getError } from '../utils';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import MessageBox from '../component/messageBox';
import Form from 'react-bootstrap/Form';
const reduser = (state, action) => {
    switch (action.type) {
        case "REFRESH_PRODUCT":
            return { ...state, product: action.payload };
        case "CREATE_REQUEST":
            return { ...state, loadingCreateReview: true };
        case "CREATE_SUCCESS":
            return { ...state, loadingCreateReview: false };
        case "CREATE_FALD":
            return { ...state, loadingCreateReview: false };
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
    let reviewRef = useRef();
    const [comment, setComment] = useState();
    const [rating, setRating] = useState(0);
    const [selectedImage, setSelectedImage] = useState([]);
    const navigation = useNavigate();
    const params = useParams();
    const { slug } = params;
    const [{ loading, product, error, loadingCreateReview }, dispatch] = useReducer(reduser, {
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
    const { cart, userInfo } = state;

    const submitHandler = async (e) => {
        e.preventDefault();
        if (!comment || !rating) {
            toast.error('plase enter comment and rating');
            return;
        }
        try {
            const { data } = await axios.post(`/api/products/${product._id}/reviews`,
                { rating, comment, name: userInfo.name },
                { headers: { authorization: `Bearer ${userInfo.token}` } });
            dispatch({ type: 'CREATE_SUCCESS' });
            toast.success('Review submitted Successfully');
            product.reviews.unshift(data.review);
            product.numReviews = data.numReviews;
            product.rating = data.rating;
            dispatch({ type: 'REFRESH_PRODUCT', payload: product });
            window.scrollTo({
                behavior: 'smooth',
                top: reviewRef.current.offsettop,
            });
        } catch (error) {
            toast.error(getError(error));
            dispatch({ type: 'CREATE_FALD' })
        }

    };


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
                    <img src={product.image || selectedImage} alt={product.slug} className='img-large' />
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
                            <Row xs={1} md={2} className='g-2'>
                                {[...product.images, product.image].map((x) => (
                                    <Col key={x}>
                                        <Card>
                                            <Button className="thumbnail"
                                                type="button"
                                                variant="light"
                                                onClick={() => setSelectedImage(x)}>
                                                <Card.Img variant="top" src={x} alt="product" />
                                            </Button>
                                        </Card>
                                    </Col>
                                ))}
                            </Row>
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
            <div className='my-3'>
                <h2 ref={reviewRef}>Reviews</h2>
                <div className="mb-3">
                    {product.reviews.length === 0 && (
                        <MessageBox>There is no review</MessageBox>
                    )}
                </div>
                <ListGroup>
                    {product.reviews.map((review) => (

                        <ListGroup.Item key={review._id}>
                            <strong>{review.name}</strong>
                            <Rating rating={review.rating} caption=" "></Rating>
                            <p>{review.createdAt.substring(0, 10)}</p>
                            <p>{review.comment}</p>
                        </ListGroup.Item>


                    ))}
                </ListGroup>
                <div className="my-3">
                    {userInfo ? (
                        <form onSubmit={submitHandler}>
                            <h2>Write a Customer Review</h2>
                            <Form.Group className="mb-3" controlId="rating">
                                <Form.Label>Rating</Form.Label>
                                <Form.Select aria-label="Rating"
                                    value={rating}
                                    onChange={(e) => setRating(e.target.value)}>
                                    <option value="">Select</option>
                                    <option value="1">1 - Poor</option>
                                    <option value="2">2 - Fair</option>
                                    <option value="3">3 - Good</option>
                                    <option value="4">4 - Very Good</option>
                                    <option value="5">5 - Excelent</option>
                                </Form.Select>
                            </Form.Group>
                            <FloatingLabel controlId="floatingTextArea" Label="Comment" className='mb-3' >
                                <Form.Control as='textarea' placeholder="Leave a comment Here" value={comment}
                                    onChange={(e) => setComment(e.target.value)} />

                            </FloatingLabel>
                            <div className="mb-3">
                                <Button disabled={loadingCreateReview} type='submit'>Submit</Button>
                                {loadingCreateReview && <loadingBox></loadingBox>}
                            </div>
                        </form>
                    ) : (
                        <MessageBox>
                            Please{' '}
                            <Link to={`/signin?redirect=/product/${product.slug}`}>
                                Sign In
                            </Link>{' '}
                            to write a review
                        </MessageBox>
                    )}
                </div>
            </div>
        </div>
    )
}


export default ProductScreen
