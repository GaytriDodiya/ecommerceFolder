import React, { useContext, useEffect, useReducer, useState } from 'react';
import { Store } from '../Store';
import { useNavigate, useParams } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import { Helmet } from 'react-helmet-async';
import LoadingBox from '../component/LoadingBox';
import MessageBox from '../component/messageBox';
import Button from 'react-bootstrap/Button';
import axios from 'axios';
import { getError } from '../utils';
import Form from 'react-bootstrap/Form';
import { toast } from 'react-toastify';
import ListGroup from 'react-bootstrap/ListGroup';
const reducer = (state, action) => {
    switch (action.type) {
        case "FETCH_REQUEST":
            return { ...state, loading: true };
        case "FETCH_SUCCESS":
            return { ...state, loading: false };
        case "FETCH_FAIL":
            return { ...state, loading: false, error: action.paylod };
        case "UPDATE_REQUEST":
            return { ...state, loadingUpdate: true };
        case "UPDATE_SUCCESS":
            return { ...state, loadingUpdate: false };
        case "UPDATE_FAIL":
            return { ...state, loadingUpdate: false, error: action.paylod };
        case "UPLOAD_REQUEST":
            return { ...state, loadingUpload: true, errorUpload: '' };
        case "UPLOAD_SUCCESS":
            return { ...state, loadingUpload: false, errorUpload: '' };
        case "UPLOAD_FAIL":
            return { ...state, loadingUpload: false, error: action.paylod };
        default:
            return state;
    }
}

export default function ProductEditScreen() {
    const navigate = useNavigate();
    const param = useParams();
    const { id: productId } = param;

    const { state } = useContext(Store);
    const { userInfo } = state;

    const [{ loading, error, loadingUpdate, loadingUpload }, dispatch] = useReducer(reducer, {
        loading: true,
        error: ''
    });

    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');
    const [image, setImage] = useState('');
    const [images, setImages] = useState([]);
    const [price, setPrice] = useState('');
    const [category, setCategory] = useState('');
    const [description, setDescription] = useState('');
    const [brand, setBrand] = useState('');
    const [countInStock, setCountInStuck] = useState('');

    useEffect(() => {
        const fatchData = async () => {
            try {
                dispatch({ type: 'FETCH_REQUEST' });
                const { data } = await axios.get(`/api/products/${productId}`);
                setName(data.name);
                setSlug(data.slug);
                setImage(data.image);
                setImages(data.images);
                setPrice(data.price);
                setCategory(data.category);
                setDescription(data.description);
                setBrand(data.brand);
                setCountInStuck(data.countInStock);
                dispatch({ type: 'FETCH_SUCCESS' });
            } catch (error) {
                dispatch({ type: 'FETCH_FAIL', paylod: getError(error) })
            }
        }
        fatchData();
    }, [productId]);

    const SubmitHandler = async (e) => {
        e.preventDefault();
        try {
            dispatch({ type: 'UPDATE_REQUEST' })
            await axios.put(`/api/products/${productId}`,
                {
                    _id: productId,
                    name,
                    slug,
                    price,
                    image,
                    images,
                    description,
                    category,
                    brand,
                    countInStock
                },
                { headers: { Authorization: `Bearer ${userInfo.token}` } });
            dispatch({ type: 'UPDATE_SUCCESS' });
            toast.success('product update successfully');
            navigate('/admin/products');
        } catch (error) {
            dispatch({ type: 'UPDATE_FAIL' })
            toast.error(getError(error));
        }
    }

    const UploadFileHandler = async (e, forImages) => {
        const file = e.target.files[0];
        const bodyFormData = new FormData();
        bodyFormData.append('file', file);
        try {
            dispatch({ type: 'UPLOAD_REQUEST' });
            const { data } = await axios.post(`/api/upload`, bodyFormData, {
                headers: {
                    'Content-type': 'multipart/form-data',
                    Authorization: `Bearer ${userInfo.token}`
                },
            });
            dispatch({ type: 'UPLOAD_SUCCESS' });
            if (forImages) {
                setImages([...images, data.secure_url]);
            }
            else {
                setImage(data.secure_url);
            }
            toast.success('image Upload Successfully. click Update to apply it');
            // setImage(data.secure_url);
        } catch (error) {
            dispatch({ type: 'UPLOAD_FAIL', paylod: getError(error) });
        }
    };

    const deleteFileHandler = (f, fileName) => {
        setImages(images.filter((x) => x !== fileName));
        toast.success('Image removed successfully. click Update to apply it');
    }
    return (
        <Container className='small-container'>
            <Helmet>
                <title>Edit product $ {productId}</title>
            </Helmet>
            <h1>Edit Products {productId}</h1>
            {loading ? (<LoadingBox></LoadingBox>) :
                error ? (<MessageBox variant="danger">{error}</MessageBox>) :
                    (
                        <Form onSubmit={SubmitHandler}>
                            <Form.Group className="mb-3" controlId="name">
                                <Form.Label>Name</Form.Label>
                                <Form.Control value={name} onChange={(e) => setName(e.target.value)} required />
                            </Form.Group>
                            <Form.Group className="mb-3" controlId="slug">
                                <Form.Label>slug</Form.Label>
                                <Form.Control value={slug} onChange={(e) => setSlug(e.target.value)} required />
                            </Form.Group>
                            <Form.Group className="mb-3" controlId="image">
                                <Form.Label>image</Form.Label>
                                <Form.Control value={image} onChange={(e) => setImage(e.target.value)} required />
                            </Form.Group>
                            <Form.Group className="mb-3" controlId="imageFile">
                                <Form.Label>Upload Image</Form.Label>
                                <Form.Control type='file' onChange={UploadFileHandler} />
                                {loadingUpload && <LoadingBox />}
                            </Form.Group>
                            <Form.Group className='mb' controlId='additionalImage'>
                                <Form.Label>Additional Images</Form.Label>
                                {images.length === 0 && (<MessageBox>No Image</MessageBox>)}
                                <ListGroup variant='flush'>
                                    {images.map((image) => (
                                        <ListGroup key={image}>
                                            {image}
                                            <Button variant='light' onClick={() => deleteFileHandler(image)}>
                                                <i className="fa fa-times-circle"></i></Button></ListGroup>
                                    ))}
                                </ListGroup>
                            </Form.Group>
                            <Form.Group className="mb-3" controlId="additionalImageFile">
                                <Form.Label>Upload Aditional Image</Form.Label>
                                <Form.Control
                                    type="file"
                                    onChange={(e) => UploadFileHandler(e, true)}
                                />
                                {loadingUpload && <LoadingBox></LoadingBox>}
                            </Form.Group>
                            <Form.Group className="mb-3" controlId="price">
                                <Form.Label>price</Form.Label>
                                <Form.Control value={price} onChange={(e) => setPrice(e.target.value)} required />
                            </Form.Group>
                            <Form.Group className="mb-3" controlId="category">
                                <Form.Label>category</Form.Label>
                                <Form.Control value={category} onChange={(e) => setCategory(e.target.value)} required />
                            </Form.Group>
                            <Form.Group className="mb-3" controlId="brand">
                                <Form.Label>brand</Form.Label>
                                <Form.Control value={brand} onChange={(e) => setBrand(e.target.value)} required />
                            </Form.Group>
                            <Form.Group className="mb-3" controlId="countinstock">
                                <Form.Label>countInStock</Form.Label>
                                <Form.Control value={countInStock} onChange={(e) => setCountInStuck(e.target.value)} required />
                            </Form.Group>
                            <Form.Group className="mb-3" controlId="description">
                                <Form.Label>description</Form.Label>
                                <Form.Control value={description} onChange={(e) => setDescription(e.target.value)} required />
                            </Form.Group>
                            <div className="mb-3">
                                <Button type='submit' disabled={loadingUpdate}>Update</Button>
                                {loadingUpdate && <LoadingBox></LoadingBox>}
                            </div>
                        </Form>
                    )}
        </Container>
    )
}
