import React, { useContext, useEffect, useReducer } from 'react'
import LoadingBox from '../component/LoadingBox'
import MessageBox from '../component/messageBox'
import { Helmet } from 'react-helmet-async'
import { Store } from '../Store'
import { useNavigate } from 'react-router-dom'
import { getError } from '../utils';
import axios from 'axios';
import Button from 'react-bootstrap/Button';
const reducer = (action, state) => {
    switch (action.type) {
        case "FATCH_REQUEST":
            return { ...state, loading: true };
        case "FATCH_SUCCESS":
            return { ...state, orders: action.payload, loading: false };
        case "FATCH_FAIL":
            return { ...state, loading: false, error: action.payload };
        default:
            return state;
    }
}
const OrderHistoryScreen = () => {
    const { state } = useContext(Store);
    const { userInfo } = state;
    const navigate = useNavigate();

    const [{ loading, error, orders }, dispatch] = useReducer(reducer, {
        loading: true,
        error: "",

    })

    useEffect(() => {
        const fatchData = async () => {
            dispatch({ type: "FATCH_REQUEST" });
            try {
                const { data } = await axios.get("/api/orders/mine", {
                    headers: { Authorization: `Bearer ${userInfo.token}` }
                });
                dispatch({ type: "FATCH_SUCCESS", payload: data });
            } catch (error) {
                dispatch({ type: "FATCH_FAIL", payload: getError(error) });

            }
        }
        fatchData();
    }, [userInfo])
    return (
        <div>
            {loading ? (<LoadingBox></LoadingBox>) :
                error ? (<MessageBox></MessageBox>) :
                    (<div>
                        <Helmet><title>Order History</title></Helmet>
                        <h1>Order History </h1>
                        <table className='table'>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>DATE</th>
                                    <th>TOTAL</th>
                                    <th>PAID </th>
                                    <th>DELEVRED</th>
                                    <th>ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map((order) => (
                                    <tr key={order._id}>
                                        <td>{order._id}</td>
                                        <td>{order.createdAt.substring(0, 10)}</td>
                                        <td>{order.totalPrice.toFixed(2)}</td>
                                        <td>{order.isPaid ? order.paidAt.substring(0, 10) : 'No'}</td>
                                        <td>{order.isDelivered ? order.isDeliveredAt.substring(0, 10) : 'No'}</td>
                                        <td><Button type="button" variant="light" onClick={() => { navigate(`/order/${order._id}`) }}>
                                            Details </Button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>)}

        </div>
    )
}

export default OrderHistoryScreen
