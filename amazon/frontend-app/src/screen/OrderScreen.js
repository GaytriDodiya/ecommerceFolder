import React, { useContext, useEffect, useReducer } from 'react';
import LodingBox from '../component/LoadingBox';
import MessageBox from '../component/messageBox';
import { useNavigate, useParams } from 'react-router-dom';
import { Store } from '../Store';
import axios from 'axios';
import { getError } from '../utils';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import ListGroup from 'react-bootstrap/ListGroup';
import Card from 'react-bootstrap/Card';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js';
import LoadingBox from '../component/LoadingBox';
import { toast } from 'react-toastify';
import Button from 'react-bootstrap/Button';
function reducer(state, action) {
    switch (action.type) {
        case "FATCH_REQUEST":
            return { ...state, loading: true, error: '' };
        case "FATCH_SUCCESS":
            console.log("FATCH_SUCCESS triggered with payload:", action.payload);
            return { ...state, loading: false, order: action.payload, error: '' };

        case "FATCH_FAIL":
            return { ...state, loading: false, error: action.payload };
        case "PAY_REQUEST":
            return { ...state, loadingPay: true };
        case "PAY_SUCCESS":
            return { ...state, loadingPay: false, successPay: true };
        case "PAY_FAIL":
            return { ...state, loadingPay: false };
        case "PAY_RESET":
            return { ...state, loadingPay: false, successPay: false };
        case "COD_REQUEST":
            return { ...state, loadingCod: true };
        case "COD_SUCCESS":
            return { ...state, loadingCod: false, successcod: true };
        case "COD_FAIL":
            return { ...state, loadingCod: false };
        case "COD_RESET":
            return { ...state, loadingCod: false, successcod: false };
        case "DELEVER_REQUEST":
            return { ...state, loadingDelever: true };
        case "DELEVER_SUCCESS":
            return { ...state, loadingDelever: false, successDelever: true };
        case "DELEVER_FAIL":
            return { ...state, loadingDelever: false };
        case "DELEVER_RESET":
            return { ...state, loadingDelever: false, successDelever: false };
        default:
            return state;
    }
}


const OrderScreen = () => {
    const { state } = useContext(Store);
    const { userInfo } = state;
    const navigate = useNavigate();
    const params = useParams();
    const { id: orderId } = params;
    console.log("id" + orderId);
    // loadingDelever, successDelever
    const [{ loading, error, order, successPay, successcod, loadingPay, loadingDelever, successDelever }, dispatch] = useReducer(reducer, {
        loading: true,
        order: {},
        error: '',
        loadingPay: false,
        successPay: false,
    });
    const [{ isPending }, paypalDispatch] = usePayPalScriptReducer();
    const createOrder = (data, actions) => {
        return actions.order
            .create({
                purchase_units: [
                    {
                        amount: { value: order.totalPrice },
                    },
                ],
            }).then((orderID) => {
                return orderID;
            });
    }

    const onApprove = (data, actions) => {
        return actions.order.capture().then(async function (details) {
            try {
                dispatch({ type: "PAY_REQUEST" });
                const { data } = await axios.put(`/api/orders/${order._id}/pay`, details, {
                    headers: { authorization: `Bearer ${userInfo.token}` },
                });
                dispatch({ type: 'PAY_SUCCESS', payload: data });
                toast.success("order is paid");
            }
            catch (err) {
                dispatch({ type: "PAY_FAIL", payload: getError(err) });
                toast.error(getError(err));
            }
        })
    }

    const onError = (err) => {
        toast.error(getError(err))
    }

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                dispatch({ type: 'FATCH_REQUEST' });
                const { data } = await axios.get(`/api/orders/${orderId}`, {
                    headers: { authorization: `Bearer ${userInfo.token}` },
                });
                dispatch({ type: 'FATCH_SUCCESS', payload: data });


            } catch (err) {
                dispatch({ type: 'FATCH_FAIL', payload: getError(err) });
            }
        };
        if (!userInfo) {
            return navigate('/login');
        }

        if (!order._id || successcod || successPay || successDelever || (order._id && order._id !== orderId)) {
            fetchOrder();
            if (successPay) {
                dispatch({ type: 'PAY_RESET' });
            }

            if (successDelever) {
                dispatch({ type: 'DELEVER_RESET' });
            }
            if (successcod) {
                dispatch({ type: 'COD_RESET' });
            }
        }
        else {
            const loadPaypalScript = async () => {
                const { data: clientId } = await axios.get('/api/keys/paypal', {
                    headers: { authorization: `Bearer ${userInfo.token}` },
                });
                paypalDispatch({
                    type: "resetOptions",
                    value: {
                        'client-id': clientId,
                        currency: 'USD',
                    }
                });
                paypalDispatch({ type: "setLoadingStatus", value: "pending" });
            }
            loadPaypalScript();
        }
    }, [order, userInfo, orderId, navigate, paypalDispatch, successPay, successDelever])
    // successDelever

    const DeliverOrderHandler = async () => {
        try {
            dispatch({ type: 'DELEVER_REQUEST' })
            const { data } = await axios.put(`/api/orders/${order._id}/deliver`, {}, { headers: { authorization: `Bearer ${userInfo.token}` } })
            dispatch({ type: 'DELEVER_SUCCESS', payload: data });
            toast.success('Order is delivered');
        } catch (error) {
            toast.error(getError(error));
            dispatch({ type: 'DELEVER_FAIL' })
        }
    }


    const handleCODPayment = async () => {
        try {
            dispatch({ type: "COD_REQUEST" });
            const { data } = await axios.put(`/api/orders/${order._id}/cod-confirmation`, {}, {
                headers: { authorization: `Bearer ${userInfo.token}` },
            });
            dispatch({ type: 'COD_SUCCESS', payload: data });
            toast.success("Cash on Delivery payment successful");
        } catch (err) {
            dispatch({ type: "COD_FAIL", payload: getError(err) });
            toast.error(getError(err));
        }

    };

    return loading ? (
        <LodingBox></LodingBox>
    ) : error ? (
        <MessageBox>{error}</MessageBox>
    ) : (

        <div>
            <Helmet>
                <title>Order {orderId}</title>
            </Helmet>
            <h1 className="my-3">Order {orderId}</h1>
            <Row>
                <Col md={8}>
                    <Card className="mb-3">
                        <Card.Body>
                            <Card.Title>Shipping</Card.Title>
                            <Card.Text>
                                <strong>Name:</strong> {order.shippingAddress.fullName} <br />
                                <strong>Address: </strong> {order.shippingAddress.address},
                                {order.shippingAddress.city}, {order.shippingAddress.postalCode}
                                ,{order.shippingAddress.country}
                                &nbsp;
                                {order.shippingAddress.location && order.shippingAddress.loading.lat
                                    && (<a target='_new' href={`https://maps.google.com?q=
                                ${order.shippingAddress.location.lat},${order.shippingAddress.location.lng}`}>
                                        Show On Map</a>)}

                            </Card.Text>
                            {order.isDelivered ? (
                                <MessageBox variant="success">
                                    Delivered at {order.deliveredAt}
                                </MessageBox>
                            ) : (
                                <MessageBox variant="danger">Not Delivered</MessageBox>
                            )}
                        </Card.Body>
                    </Card>
                    <Card className="mb-3">
                        <Card.Body>
                            <Card.Title>Payment</Card.Title>
                            <Card.Text>
                                <strong>Method:</strong> {order.paymentMethod}
                            </Card.Text>
                            {order.isPaid ? (
                                <MessageBox variant="success">
                                    Paid at {order.paidAt}
                                </MessageBox>
                            ) : (
                                <MessageBox variant="danger">Not Paid</MessageBox>
                            )}
                        </Card.Body>
                    </Card>

                    <Card className="mb-3">
                        <Card.Body>
                            <Card.Title>Items</Card.Title>
                            <ListGroup variant="flush">
                                {order.orderItems.map((item) => (
                                    <ListGroup.Item key={item._id}>
                                        <Row className="align-items-center">
                                            <Col md={6}>
                                                <img
                                                    src={item.image}
                                                    alt={item.name}
                                                    className="img-fluid rounded img-thumbnail"
                                                ></img>{' '}
                                                <Link to={`/product/${item.slug}`}>{item.name}</Link>
                                            </Col>
                                            <Col md={3}>
                                                <span>{item.quantity}</span>
                                            </Col>
                                            <Col md={3}>&#8377;{item.price}</Col>
                                        </Row>
                                    </ListGroup.Item>
                                ))}
                            </ListGroup>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card className="mb-3">
                        <Card.Body>
                            <Card.Title>Order Summary</Card.Title>
                            <ListGroup variant="flush">
                                <ListGroup.Item>
                                    <Row>
                                        <Col>Items</Col>
                                        <Col>&#8377;{order.itemsPrice.toFixed(2)}</Col>
                                    </Row>
                                </ListGroup.Item>
                                <ListGroup.Item>
                                    <Row>
                                        <Col>Shipping</Col>
                                        <Col>&#8377;{order.shippingPrice.toFixed(2)}</Col>
                                    </Row>
                                </ListGroup.Item>
                                <ListGroup.Item>
                                    <Row>
                                        <Col>Tax</Col>
                                        <Col>&#8377;{order.taxPrice.toFixed(2)}</Col>
                                    </Row>
                                </ListGroup.Item>
                                <ListGroup.Item>
                                    <Row>
                                        <Col>
                                            <strong> Order Total</strong>
                                        </Col>
                                        <Col>
                                            <strong>&#8377;{order.totalPrice.toFixed(2)}</strong>
                                        </Col>
                                    </Row>
                                </ListGroup.Item>
                                {!order.isPaid && order.paymentMethod === 'Paypal' && (
                                    <ListGroup.Item>
                                        {isPending ? (
                                            <LoadingBox />) :
                                            (
                                                <div>
                                                    <PayPalButtons createOrder={createOrder} onApprove={onApprove} onError={onError}>
                                                    </PayPalButtons>
                                                </div>

                                            )
                                        }


                                        {loadingPay && <LoadingBox></LoadingBox>}</ListGroup.Item>)}

                                {!order.isPaid && order.paymentMethod === "Stripe" && (

                                    <ListGroup.Item>
                                        <div className="d-grid">
                                            <Button type="button" onClick={handleCODPayment}>
                                                Cash on Delivery
                                            </Button>

                                        </div>
                                    </ListGroup.Item>

                                )}
                                {userInfo.isAdmin && order.isPaid && !order.isDelivered && (
                                    <ListGroup.Item>
                                        {loadingDelever && <LoadingBox></LoadingBox>}
                                        <div className="d-grid">
                                            <Button type="button" onClick={DeliverOrderHandler}>
                                                Deliver Order
                                            </Button>
                                        </div>
                                    </ListGroup.Item>
                                )}
                            </ListGroup>
                        </Card.Body >
                    </Card >
                </Col >
            </Row >
        </div >
    );
}

export default OrderScreen;
