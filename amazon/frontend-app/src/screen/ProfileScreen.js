import React, { useContext, useReducer, useState } from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { Helmet } from 'react-helmet-async';
import { Store } from '../Store';
import axios from 'axios';
import { toast } from 'react-toastify';
import { getError } from '../utils';
const reducer = (state, action) => {
    switch (action.type) {
        case "UPDATE_REQUEST":
            return { ...state, loading: true };
        case "UPDATE_SUCCESS":
            return { ...state, loading: false };
        case "UPDATE_FAIL":
            return { ...state, loading: false };
        default:
            return state;
    }
}

export default function ProfileScreen() {
    const { state, dispatch: ctxDispatch } = useContext(Store);
    const { userInfo } = state;

    const [name, setName] = useState(userInfo?.name || "");
    const [email, setEmail] = useState(userInfo?.email || "");
    const [password, setpassword] = useState("");
    const [cPassword, setcPassword] = useState("");
    const [{ loading }, dispatch] = useReducer(reducer, {
        loading: false,
    })
    const HandleSubmit = async (e) => {
        e.preventDefault();
        try {
            const { data } = await axios.put("/api/users/profile", {
                name,
                email,
                password
            }, { headers: { authorization: `Bearer ${userInfo.token}` } })
            dispatch({ type: "UPDATE_SUCCESS", });
            ctxDispatch({ type: "USER_SININ", paylod: data });
            localStorage.setItem("userInfo", JSON.stringify(data));
            toast.success("User Profile Update Successfully");
        } catch (error) {
            dispatch({ type: "UPDATE_FAIL", });
            toast.error(getError(error));
        }
    }
    if (!userInfo) {
        return <div>Loding...</div>
    } else {
        return (
            <div className='container small-container'>
                <Helmet><title>User Profile</title></Helmet>
                <h1 className='my-3'>User Profile</h1>
                <form onSubmit={HandleSubmit}>
                    <Form.Group className="mb-3" controlId="name">
                        <Form.Label>Name</Form.Label>
                        <Form.Control value={name} onChange={(e) => setName(e.target.value)} required />
                        <Form.Label>Email</Form.Label>
                        <Form.Control value={email} onChange={(e) => setEmail(e.target.value)} required />
                        <Form.Label>Password</Form.Label>
                        <Form.Control type="password" onChange={(e) => setpassword(e.target.value)} required />
                        <Form.Label>Conform Password</Form.Label>
                        <Form.Control type='password' onChange={(e) => setcPassword(e.target.value)} required />
                    </Form.Group>
                    <div className="mb-3">
                        <Button className='border-light' type="submit">Update</Button>
                    </div>

                </form>
            </div>
        )
    }
}
