import React, { useContext, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Store } from '../Store';
import { toast } from 'react-toastify';
import axios from 'axios';
import { getError } from '../utils';
import Container from 'react-bootstrap/esm/Container';
import { Helmet } from 'react-helmet-async';
import FormGroup from 'react-bootstrap/esm/FormGroup';
import Button from 'react-bootstrap/esm/Button';
import Form from 'react-bootstrap/Form';

export default function ResetPasswordScreen() {

    const navigate = useNavigate();
    const { token } = useParams();

    const { state } = useContext(Store);
    const { userInfo } = state;

    const [password, setPassword] = useState('');
    const [cpassword, setCpassword] = useState('');

    useEffect(() => {
        if (userInfo || !token) {
            navigate('/');
        }
    }, [userInfo, navigate, token]);

    const HandelSubmit = async (e) => {
        e.preventDefault();
        if (password !== cpassword) {
            toast.error('your conform password and Password is not match')
        }
        try {
            await axios.post(`/api/users/reset-password`, { password, token });
            navigate('/signin');
            toast.success('password Updated successfully');
        } catch (error) {
            toast.error(getError(error))
        }
    }
    return (
        <div>
            <Container className='small-container'>
                <Helmet><title>Reset Password</title></Helmet>
                <h1 className="my-3">Reset Password</h1>
                <form onSubmit={HandelSubmit}>
                    <FormGroup className="mb-3" controlId="newPassword">
                        <Form.Label>New Password</Form.Label>
                        <Form.Control type="password" value={password}
                            onChange={(e) => setPassword(e.target.value)} required />
                    </FormGroup>
                    <Form.Group className="mb-3" controlId="confirmPassword">
                        <Form.Label>Confirm Password</Form.Label>
                        <Form.Control type="password" value={cpassword}
                            onChange={(e) => setCpassword(e.target.value)} required />
                    </Form.Group>

                    <div className="mb-3">
                        <Button type='submit'>Submit</Button>
                    </div>
                </form>
            </Container>
        </div>
    )
}
