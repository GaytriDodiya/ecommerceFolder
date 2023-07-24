import React from 'react'
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import { Link } from 'react-router-dom';
import Rating from '../component/rating';
import { useContext } from 'react';
import { Store } from '../Store';
import axios from 'axios';
const Product = (props) => {
    const { product } = props;

    const { state, dispatch: ctxDispatch } = useContext(Store);
    const {
        cart: { cartItem },
    } = state;
    const AddToCartHandler = async (item) => {
        const existItem = cartItem.find((x) => x._id === product._id);

        const quantity = existItem ? existItem.quantity + 1 : 1;
        const { data } = await axios.get(`/api/products/${item._id}`);
        if (data.countInStock < quantity) {
            window.alert('Sorry. Product is out of stock');
            return;
        }
        ctxDispatch({
            type: "ADD_TO_CART",
            payload: { ...item, quantity },
        });

    }
    return (
        <div>
            <Card className="product">
                <Link to={`/product/${product.slug}`}>
                    <img src={product.image} className='cart-img-top' alt={product.slug} />
                </Link>
                <Card.Body>
                    <Link to={`/product/${product.slug}`}>
                        <Card.Title>  {product.name}</Card.Title>
                    </Link>
                    <Rating rating={product.rating} numReviews={product.numReviews} ></Rating>
                    <Card.Text>&#8377;{product.price}</Card.Text>
                    {product.countInStock === 0 ? (<Button variant='light' disabled >Out OF Stock</Button>) : (
                        <Button onClick={() => AddToCartHandler(product)}>ADD TO CART</Button>
                    )}

                </Card.Body>
            </Card>
        </div>
    )
}

export default Product
