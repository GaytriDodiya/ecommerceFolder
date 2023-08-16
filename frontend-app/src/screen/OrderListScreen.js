import React, { useContext, useEffect, useReducer } from 'react';
import Row from 'react-bootstrap/esm/Row';
import Col from 'react-bootstrap/esm/Col';
import Table from 'react-bootstrap/esm/Table';
import Button from 'react-bootstrap/esm/Button';
import LoadingBox from '../component/LoadingBox';
import MessageBox from '../component/messageBox';
import axios from 'axios';
import { getError } from '../utils';
import { Store } from '../Store';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const reducer = (state, action) => {
    switch (action.type) {
        case "FATCH_REQUEST":
            return { ...state, loading: true };
        case "FATCH_SUCCESS":
            return {
                ...state, loading: false, orders: action.payload
            };
        case "FATCH_FAIL":
            return {
                ...state, loading: false, error: action.payload
            }
        case "DELETE_REQUEST":
            return { ...state, loadingDelete: true };
        case "DELETE_SUCCESS":
            return {
                ...state, loadingDelete: false, successDelete: true
            };
        case "DELETE_FAIL":
            return {
                ...state, loadingDelete: false
            }
        case 'DELETE_RESET':
            return {
                ...state, loadingDelete: false, successDelete: false
            }
        default:
            return state;
    }
}

export default function OrderListScreen() {
    const navigate = useNavigate();
    const { state } = useContext(Store);
    const { userInfo } = state;
    const [{ loading, error, orders, loadingDelete, successDelete }, dispatch] = useReducer(reducer, { loading: true, error: '' });


    useEffect(() => {
        const fatchOrder = async () => {
            try {
                dispatch({ type: "FATCH_REQUEST" });
                const { data } = await axios.get(`/api/orders/`,
                    { headers: { Authorization: `Bearer ${userInfo.token}` } });
                dispatch({ type: "FATCH_SUCCESS", payload: data })
            } catch (error) {
                dispatch({ type: "FATCH_FAIL", payload: getError(error) })
            }
        }
        if (successDelete) {
            dispatch({ type: 'DELETE_RESET' })
        }
        else {
            fatchOrder();
        }

    }, [userInfo, successDelete]);

    const OrderDeleteHandler = async (order) => {
        if (window.confirm('are you sure?')) {
            try {
                dispatch({ tyep: 'DELETE_REQUEST' });
                await axios.delete(`/api/orders/${order._id}`,
                    { headers: { Authorization: `Bearer ${userInfo.token}` } });
                toast.success('Order is delete successfully');
                dispatch({ type: 'DELETE_SUCCESS' });

            } catch (error) {
                toast.error(getError(error))
                dispatch({ type: 'DELETE_FAIL' })
            }
        }
    }

    return (
        <div>

            <Row>
                <Col>
                    <h1>Orders</h1>
                    {loadingDelete && <LoadingBox></LoadingBox>}
                </Col>
            </Row>
            {loading ? (<LoadingBox />) :
                error ? (<MessageBox variant="danger">{error}</MessageBox>)
                    : (
                        <>
                            <Table striped bordered hover size="sm" variant='dark'>
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>USER</th>
                                        <th>DATE</th>
                                        <th>TOTAL</th>
                                        <th>PAID</th>
                                        <th>DELIVERED</th>
                                        <th>ACTION</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map((order) => (
                                        <tr key={order._id}>
                                            <td>{order._id}</td>
                                            <td>{order.user ? order.user.name : 'DELETED USER'}</td>
                                            <td>{order.createdAt.substring(0, 10)}</td>
                                            <td>{order.totalPrice.toFixed(2)}</td>
                                            <td>{order.isPaid ? order.paidAt.substring(0, 10) : 'No'}</td>
                                            <td>
                                                {order.isDelivered
                                                    ? order.deliveredAt.substring(0, 10)
                                                    : 'No'}
                                            </td>
                                            <td>
                                                <Button className="mr-2" type='button' onClick={() => navigate(`/order/${order._id}`)} variant='light' >Details</Button>
                                                <Button variant='light' onClick={() => OrderDeleteHandler(order)} type='button' >Delete</Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </>
                    )}
        </div>
    )
}

