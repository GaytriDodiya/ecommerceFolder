import React, { useContext, useEffect, useState } from 'react'
import { Store } from '../Store'
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { getError } from '../utils';
import Container from 'react-bootstrap/esm/Container';
import { Helmet } from 'react-helmet-async';
import FormGroup from 'react-bootstrap/esm/FormGroup';
import Button from 'react-bootstrap/esm/Button';
import Form from 'react-bootstrap/Form';

export default function ForgetPasswordScreen() {
    const navigate = useNavigate();
    const { state } = useContext(Store);
    const { userInfo } = state;
    const [email, setEmail] = useState('');

    useEffect(() => {
        if (userInfo) {
            navigate('/')
        }
    }, [userInfo, navigate])

    const HandleSubmit = async (e) => {
        e.preventDefault();
        try {
            const { data } = await axios.post(`/api/users/forget-password`, { email });
            toast.success(data.message);
        } catch (error) {
            toast.error(getError(error));
        }


    }
    return (
        <div>
            <Container className='small-container'>
                <Helmet><title>Forget Password</title></Helmet>
                <h1 className="my-3">Forget Paassword</h1>
                <form onSubmit={HandleSubmit}>
                    <FormGroup>
                        <Form.Label>Email</Form.Label>
                        <Form.Control type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                        <div className="mb-3">
                            <Button type="submit">Submit</Button>
                        </div>
                    </FormGroup>
                </form>
            </Container>
        </div>
    )
}
