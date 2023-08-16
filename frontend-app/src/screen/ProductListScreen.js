import React, { useContext, useEffect, useReducer } from 'react';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/esm/Button';
import { Store } from '../Store';
import axios from 'axios';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import LoadingBox from '../component/LoadingBox';
import MessageBox from '../component/messageBox';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import { toast } from 'react-toastify';
import { getError } from '../utils';
import AdminSideSearchBox from '../component/AdminSideSearchBox';

// import Form from 'react-bootstrap/Form';
// import InputGroup from 'react-bootstrap/InputGroup';
const reducer = (state, action) => {
    switch (action.type) {
        case "FATCH_REQUEST":
            return { ...state, loading: true };
        case "FATCH_SUCCESS":
            return {
                ...state, loading: false,
                products: action.payload.products,
                page: action.payload.page,
                pages: action.payload.pages
            };
        case "FATCH_FAIL":
            return { ...state, loading: false, error: action.payload };
        case "CREATE_REQUEST":
            return { ...state, loadingCreate: true };
        case "CREATE_SUCCESS":
            return {
                ...state, loadingCreate: false,
            };
        case "CREATE_FAIL":
            return { ...state, loadingCreate: false };

        case "DELETE_REQUEST":
            return { ...state, successDelete: false, loadingDelete: true };
        case "DELETE_SUCCESS":
            return {
                ...state, successDelete: false, loadingDelete: false,
            };
        case "DELETE_FAIL":
            return { ...state, successDelete: false, loadingDelete: false };
        case "SEARCH_REQUEST":
            return { ...state, loadingSearch: true }
        case "SEARCH_SUCCESS":
            return { ...state, querydata: action.payload.querydata, loadingSearch: false }
        case "SEARCH_FAIL":
            return { ...state, error: action.payload, loadingSearch: false }
        default:
            return state;
    }
}
export default function ProductListScreen() {
    // const [searchQuery, SetSearchQuery] = useState('');
    const { state } = useContext(Store);
    const { userInfo } = state;
    const [{ products,
        loading,
        pages,
        error,
        loadingCreate,
        successDelete,
        loadingDelete, querydata }, dispatch] = useReducer(reducer, { loading: true, error: '' });

    const navigate = useNavigate();
    const { search } = useLocation();
    const sp = new URLSearchParams(search);
    const page = sp.get('page') || 1;
    const query = sp.get('query') || "all";
    useEffect(() => {
        const fatchProducts = async () => {
            try {
                const { data } = await axios.get(`/api/products/admin?page=${page}`, {
                    headers: { Authorization: `Bearer ${userInfo.token}` },
                });
                dispatch({ type: "FATCH_SUCCESS", payload: data });
            } catch (error) {
            }
        }

        if (successDelete) {
            dispatch({ type: "" })
        }
        else {
            fatchProducts();
        }
    }, [page, userInfo, successDelete]);

    //search
    useEffect(() => {
        const fatchData = async () => {
            try {
                const { data } = await axios.get(`/api/products/admin/search?page=${page}&query=${query}`)
                dispatch({ type: 'SEARCH_SUCCESS', payload: data });
                console.log(data)
            } catch (error) {
                dispatch({ type: 'SEARCH_FAIL', error: getError(error) })
            }
        }
        fatchData();

    }, [query, page]);


    // const SearchHadler = async (e) => {
    //     e.preventDefault();
    //     try {
    //         const { data } = await axios.get(`/api/products/search?query=${searchQuery}`)
    //         dispatch({ type: 'SEARCH_SUCCESS', payload: data });
    //         console.log(data)
    //     } catch (error) {
    //         dispatch({ type: 'SEARCH_FAIL', error: getError(error) })
    //     }
    // }



    const CreateHandler = async () => {
        if (window.confirm('Are You Sure To Create ?')) {
            try {
                dispatch({ type: "CREATE_REQUEST" });
                const { data } = await axios.post('/api/products', {},
                    { headers: { Authorization: `Bearer ${userInfo.token}` } });
                toast.success('Product Added Successfully');
                dispatch({ type: "CREATE_SUCCESS" });
                navigate(`admin/products/${data.product._id}`);
            } catch (error) {
                toast.error(getError(error));
                dispatch({ type: "CREATE_FAIL" });
            }
        }
    }
    const DeleteHandle = async (product) => {
        if (window.confirm('Are You Sure to Delete ?')) {
            try {
                await axios.delete(`/api/products/${product._id}`,
                    { headers: { Authorization: `Bearer ${userInfo.token}` } });
                toast.success('Products Delete Successfully');
                dispatch({ type: "DELETE_SUCCESS" })
            } catch (error) {
                toast.error(getError(error));
                dispatch({ type: "DELETE_FAIL" });
            }
        }
    }

    return (
        <div>

            <Row>
                <Col>
                    <h1>Products</h1>
                </Col>
                <Col className="col text-end">
                    <Button type='submit' onClick={CreateHandler}>Create Product</Button>
                </Col>
            </Row>
            {loadingCreate && <LoadingBox></LoadingBox>}
            {loadingDelete && <LoadingBox></LoadingBox>}
            {loading ? (<LoadingBox />) :
                error ? (<MessageBox variant="danger">{error}</MessageBox>)
                    : (
                        <>

                            <Table striped bordered hover size="sm" variant='dark'>
                                <thead>
                                    <tr>
                                        <td colSpan={6}>
                                            {/* <Form>
                                                <InputGroup>
                                                    <Form.Control type='text' placeholder='Search Product' value={searchQuery}
                                                        onChange={(e) => SetSearchQuery(e.target.value)} />
                                                    <Button type='submit' onClick={SearchHadler}> <i className='fas fa-search'></i></Button>
                                                </InputGroup>
                                            </Form> */}
                                            <AdminSideSearchBox />
                                        </td>
                                    </tr>
                                    <tr>
                                        <th>ID</th>
                                        <th>NAME</th>
                                        <th>PRICE</th>
                                        <th>CATEGORY</th>
                                        <th>bRAND</th>
                                        <th>ACTION</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {querydata ? (
                                        querydata.map((q) => (
                                            <tr key={q._id}>
                                                <td>{q._id}</td>
                                                <td>{q.name}</td>
                                                <td>{q.price}</td>
                                                <td>{q.category}</td>
                                                <td>{q.brand}</td>
                                                <td>
                                                    <Button className="mr-2" type='button' variant='light' onClick={() => navigate(`/admin/product/${q._id}`)}>Edit</Button>
                                                    <Button variant='light' type='button' onClick={() => DeleteHandle(q)}>Delete</Button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        products.map((product) => (
                                            <tr key={product._id}>
                                                <td>{product._id}</td>
                                                <td>{product.name}</td>
                                                <td>{product.price}</td>
                                                <td>{product.category}</td>
                                                <td>{product.brand}</td>
                                                <td>
                                                    <Button className="mr-2" type='button' variant='light' onClick={() => navigate(`/admin/product/${product._id}`)}>Edit</Button>
                                                    <Button variant='light' type='button' onClick={() => DeleteHandle(product)}>Delete</Button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>


                            </Table>
                            <div>
                                {[...Array(pages).keys()].map((x) => (
                                    <Link className={x + 1 === Number(page) ? 'btn text-bold' : 'btn'}
                                        key={x + 1} to={`/admin/products?page=${x + 1}`} >{x + 1}</Link>
                                ))}
                            </div>
                        </>
                    )
            }
        </div >
    )
}
