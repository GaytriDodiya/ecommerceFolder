import React, { useContext, useEffect, useReducer, useState } from 'react';
import Container from 'react-bootstrap/esm/Container';
import Form from 'react-bootstrap/Form';
import { useNavigate, useParams } from 'react-router-dom';
import { Store } from '../Store';
import axios from 'axios';
import { getError } from '../utils';
import Button from 'react-bootstrap/esm/Button';
import { Helmet } from 'react-helmet-async';
import LoadingBox from '../component/LoadingBox';
import MessageBox from '../component/messageBox';
import { toast } from 'react-toastify';

function reducer(state, action) {
    switch (action.type) {
        case "FATCH_REQUEST":
            return { ...state, loading: true };
        case "FATCH_SUCCESS":
            return { ...state, loading: false };
        case "FATCH_FAIL":
            return { ...state, loading: false, error: action.paylod };
        case "UPDATE_REQUEST":
            return { ...state, loadingUpdate: true };
        case "UPDATE_SUCCESS":
            return { ...state, loadingUpdate: false };
        case "UPDATE_FAIL":
            return { ...state, loadingUpdate: false };

        default:
            return state;
    }
}
export default function UserEditScreen() {
    const navigate = useNavigate();
    const { state } = useContext(Store);
    const { userInfo } = state;
    const params = useParams();
    const { id: userId } = params;
    const [{ loading, error, loadingUpdate }, dispatch] = useReducer(reducer, { loading: true, error: '' });

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [isAdmin, setIsAdimn] = useState(false);
    useEffect(() => {
        const fatchUser = async () => {
            try {
                dispatch({ type: 'FATCH_REQUEST' })
                const { data } = await axios.get(`/api/users/${userId}`,
                    { headers: { Authorization: `Bearer ${userInfo.token}` } });
                setName(data.name);
                setEmail(data.email);
                setIsAdimn(data.isAdmin);
                dispatch({ type: 'FATCH_SUCCESS' })
            } catch (error) {
                dispatch({ type: 'FATCH_FAIL', payload: getError(error) })
            }
        }

        fatchUser();


    }, [userId, userInfo]);

    const UserEditHandle = async (e) => {
        e.preventDefault();
        try {
            dispatch({ type: 'UPDATE_REQUEST' });
            await axios.put(`/api/users/${userId}`, { _id: userId, name, email, isAdmin },
                { headers: { Authorization: `bearer ${userInfo.token}` } });
            dispatch({ type: 'UPATE_SUCCESS' });
            toast.success('User Updated Successdully');
            navigate('/admin/users')
        } catch (error) {
            toast.error(getError(error));
            dispatch({ type: 'UPATE_SUCCESS' });
        }
    }
    return (
        <div>
            <Container className='small-container'>
                <Helmet><title>{userId}</title></Helmet>
                <h1>Edit User ${userId}</h1>
                {loadingUpdate && <LoadingBox></LoadingBox>}
                {loading ? (<LoadingBox></LoadingBox>) : error ? (<MessageBox>{error}</MessageBox>) : (
                    <Form onSubmit={UserEditHandle}>
                        <Form.Group>
                            <Form.Label>Name</Form.Label>
                            <Form.Control type="text" value={name} onChange={(e) => setName(e.target.value)} />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Email</Form.Label>
                            <Form.Control type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                        </Form.Group>

                        <Form.Check type="checkbox" label="isAdmin" checked={isAdmin} value={isAdmin} onChange={(e) => setIsAdimn(e.target.checked)} />
                        <div className='mb-3'>
                            <Button type='submit' >Update</Button>
                        </div>
                    </Form>
                )}

            </Container>
        </div>
    )
}
