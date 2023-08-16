import axios from 'axios';
import React, { useContext, useEffect, useReducer } from 'react';
import Col from 'react-bootstrap/esm/Col';
import Row from 'react-bootstrap/esm/Row';
import Table from 'react-bootstrap/esm/Table';
import { Store } from '../Store';
import { getError } from '../utils';
import LoadingBox from '../component/LoadingBox';
import MessageBox from '../component/messageBox';
import Button from 'react-bootstrap/esm/Button';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const reducer = (state, action) => {
    switch (action.type) {
        case 'FATCH_REQUEST':
            return { ...state, loading: true };
        case 'FATCH_SUCCESS':
            return { ...state, users: action.payload, loading: false };
        case 'FATCH_FAIL':
            return { ...state, error: action.payload, loading: false };
        case 'DELETE_REQUEST':
            return { ...state, loadingDelete: true, };
        case 'DELETE_SUCCESS':
            return { ...state, loadingDelete: false, successDelete: true };
        case 'DELETE_FAIL':
            return { ...state, error: action.payload, loadingDelete: false };
        case 'DELETE_RESET':
            return { ...state, successDelete: false, loadingDelete: false };
        default:
            return state;
    }
}
export default function UserListScreen() {
    const navigate = useNavigate();
    const { state } = useContext(Store);
    const { userInfo } = state;
    const [{ loading, error, users, loadingDelete, successDelete }, dispatch] = useReducer(reducer, { loading: true, error: '' });
    useEffect(() => {
        const fatchUser = async () => {
            try {
                dispatch({ type: 'FATCH_REQUEST' });
                const { data } = await axios.get('/api/users',
                    { headers: { Authorization: `Bearer ${userInfo.token}` } })
                dispatch({ type: 'FATCH_SUCCESS', payload: data });
            } catch (error) {
                dispatch({ type: 'FATCH_FAIL', payload: getError(error) });
            }
        }
        if (successDelete) {
            dispatch({ type: 'DELETE_RESET' });
        }
        else {
            fatchUser();
        }

    }, [userInfo, successDelete]);
    async function DeleteHandler(user) {
        if (window.confirm('Are You Sure ?')) {
            try {
                dispatch({ type: "DELETE_REQUEST" })
                await axios.delete(`/api/users/${user._id}`, { headers: { Authorization: `Bearer ${userInfo.token}` } });
                toast.success('User Delete Successfully');
                dispatch({ type: 'DELETE_SUCCESS' })
            } catch (error) {
                dispatch({ type: 'DELETE_FAIL' });
                toast.error(getError(error));
            }
        }
    }
    return (
        <div>
            <Row><Col><h1>Users</h1></Col></Row>
            {loadingDelete && <LoadingBox />}
            {loading ? <LoadingBox></LoadingBox> :
                error ? <MessageBox></MessageBox> :
                    (<>
                        <Table striped bordered hover size="sm" variant='dark'>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>NAME</th>
                                    <th>EMAIL</th>
                                    <th>IS ADMIN</th>
                                    <th>ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <tr key={user._id}>
                                        <td>{user._id}</td>
                                        <td>{user.name}</td>
                                        <td>{user.email}</td>
                                        <td>{user.isAdmin ? 'Yes' : 'No'}</td>
                                        <td>
                                            <Button variant='light' onClick={() => navigate(`/admin/user/${user._id}`)} type="button" className='mr-2'>Edit</Button>
                                            <Button variant='light' onClick={() => DeleteHandler(user)}>Delete</Button>
                                        </td>
                                    </tr>
                                ))}

                            </tbody>
                        </Table>
                    </>)}

        </div>
    )
}
