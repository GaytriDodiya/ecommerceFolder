import { createContext, useReducer } from "react";

export const Store = createContext();

const initialstate = {
    fullBox: false,
    userInfo: localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo'))
        : null,
    cart: {
        shippingAddress: localStorage.getItem('shippingAddress')
            ? JSON.parse(localStorage.getItem('shippingAddress'))
            : { location: {} },
        cartItem: localStorage.getItem('cartItem') ? JSON.parse(localStorage.getItem('cartItem'))
            : [],
        paymentMethod: localStorage.getItem('paymentMethod')
            ? localStorage.getItem('paymentMethod') : '',

    },
}

function reduser(state, action) {
    switch (action.type) {
        case 'SET_FULLBOX_ON':
            return { ...state, fullBox: true };
        case 'SET_FULLBOX_OFF':
            return { ...state, fullBox: false };
        case "ADD_TO_CART":

            const newItem = action.payload;
            const existItem = state.cart.cartItem.find(
                (item) => item._id === newItem._id
            );
            const cartItem = existItem
                ? state.cart.cartItem.map((item) =>
                    item._id === existItem._id ? newItem : item
                )
                : [...state.cart.cartItem, newItem];
            localStorage.setItem('cartItem', JSON.stringify(cartItem));

            return { ...state, cart: { ...state.cart, cartItem } };

        case "ITEM_REMOVE_CART":
            {
                const cartItem = state.cart.cartItem.filter(
                    (item) => item._id !== action.payload._id
                );
                localStorage.setItem('cartItem', JSON.stringify(cartItem));
                return { ...state, cart: { ...state.cart, cartItem } };

            }
        case "CART_CLEAR":
            return { ...state, cart: { ...state.cart, cartItem: [] } };
        case "USER_SIGNIN":
            return { ...state, userInfo: action.payload };
        case "USER_SIGNOUT":
            return { ...state, userInfo: null, cart: { cartItem: [], shippingAddress: {}, paymentMethod: "" } };
        case 'SAVE_SHIPPING_ADDRESS':
            return {
                ...state,
                cart: {
                    ...state.cart,
                    shippingAddress: action.payload,
                },
            };

        case 'SAVE_SHIPPING_ADDRESS_MAP_LOCATION':
            return {
                ...state,
                cart: {
                    ...state.cart,
                    shippingAddress: {
                        ...state.cart.shippingAddress,
                        location: action.payload,
                    }
                }
            }

        case 'SAVE_PAYMENT_METHOD':
            return {
                ...state, cart: { ...state.cart, paymentMethod: action.payload }
            }


        // const newItem = action.payload;
        // const existItem = state.cart.cartItem.find(
        //     (item) => item._id === newItem._id
        // );
        // const cartItem = existItem ? state.cart.cartItem.map((item) =>
        //     item._id === existItem._id ? newItem : item)
        //     : [...Store.cart.cartItem, newItem];
        // return { ...state, cart: { ...state.cart, cartItem } };
        // return {
        //     ...state,
        //     cart: {
        //         ...state.cart,
        //         cartItem: [...state.cart.cartItem, action.payload]
        //     },
        // };
        default:
            return state;
    }
}

export function StoreProvider(props) {

    const [state, dispatch] = useReducer(reduser, initialstate);
    const value = { state, dispatch };
    return (
        <Store.Provider value={value}>{props.children}</Store.Provider>
    )
}