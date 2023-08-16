import React, { useEffect, useContext, useReducer } from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import MessageBox from '../component/messageBox';
import LoadingBox from '../component/LoadingBox';
import Chart from 'react-google-charts';
import axios from 'axios';
import { Store } from '../Store';

const reducer = (state, action) => {
    switch (action.type) {
        case "FATCH_REQUEST":
            return { ...state, loading: true };
        case "FATCH_SUCCESS":
            return {
                ...state, loading: false,
                summary: action.payload
            };
        case "FATCH_FAIL":
            return { ...state, loading: false, error: action.payload };
        default:
            return state;
    }
}
export default function DashbordScreen() {
    const { state } = useContext(Store);
    const { userInfo } = state;
    const [{ loading, summary, error }, dispatch] = useReducer(reducer, { loading: true, error: '' });

    useEffect(() => {
        const fatchProducts = async () => {
            try {
                const { data } = await axios.get(`/api/orders/summary`, {
                    headers: { Authorization: `Bearer ${userInfo.token}` },
                });
                dispatch({ type: "FATCH_SUCCESS", payload: data });
            } catch (error) {
            }
        }
        fatchProducts();
    }, [userInfo])

    return (
        <div>
            <h1>Deshbord</h1>
            {loading ? (<LoadingBox></LoadingBox>) :
                error ? (<MessageBox></MessageBox>) :
                    (
                        <>
                            <Row>
                                <Col md={4}>
                                    <Card>
                                        <Card.Body>
                                            <Card.Title>
                                                {summary.users && summary.users[0] ?
                                                    summary.users[0].numUsers : 0}
                                            </Card.Title>

                                            <Card.Text>Users</Card.Text>
                                        </Card.Body>
                                    </Card>
                                </Col>
                                <Col md={4}>
                                    < Card>
                                        <Card.Body>
                                            <Card.Title>
                                                {summary.orders[0] && summary.users[0] ?
                                                    (summary.orders[0].numOrders) : (0)}
                                            </Card.Title>
                                            <Card.Text>Orders</Card.Text>
                                        </Card.Body>
                                    </Card>
                                </Col>
                                <Col>
                                    <Card>
                                        <Card.Body>
                                            <Card.Title> {summary.orders && summary.orders[0] ? summary.orders[0].totalSales.toFixed(2) : 0}</Card.Title>
                                            <Card.Text>Orders</Card.Text>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            </Row>
                            <div className="my-3">
                                <h2>Sales</h2>
                                {summary.dailyOrders.length === 0 ? (
                                    <MessageBox>No Sale</MessageBox>
                                ) : (
                                    <Chart
                                        width="100%"
                                        height="400px"
                                        chartType="AreaChart"
                                        loader={<div>Loading Chart...</div>}
                                        data={[
                                            ['Date', 'Sales'],
                                            ...summary.dailyOrders.map((x) => [x._id, x.sales]),
                                        ]}
                                    ></Chart>
                                )}
                            </div>
                            <div className="my-3">
                                <h2>Categories</h2>
                                {summary.productCategories.length === 0 ? (
                                    <MessageBox>No Category</MessageBox>
                                ) : (
                                    <Chart
                                        width="100%"
                                        height="400px"
                                        chartType="PieChart"
                                        loader={<div>Loading Chart...</div>}
                                        data={[
                                            ['Category', 'Products'],
                                            ...summary.productCategories.map((x) => [x._id, x.count]),
                                        ]}
                                    ></Chart>
                                )}
                            </div>
                        </>
                    )}
        </div>
    )
}
