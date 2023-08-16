import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import Order from '../models/orderModel.js';
import { isAuth, isAdmin, mailgun, payOrderEmailTemplate } from '../utills.js';
import User from '../models/userModel.js';
import Product from '../models/productModel.js';

const orderRouter = express.Router();

// show order List

orderRouter.get(
    '/',
    isAuth,
    isAdmin,
    expressAsyncHandler(async (req, res) => {
        const orders = await Order.find().populate('user', 'name');
        res.send(orders);
    })
);


orderRouter.post(
    '/',
    isAuth,
    expressAsyncHandler(async (req, res) => {

        const newOrder = new Order({
            orderItems: req.body.orderItems.map((x) => ({ ...x, product: x._id })),
            shippingAddress: req.body.shippingAddress,
            paymentMethod: req.body.paymentMethod,
            itemsPrice: req.body.itemsPrice,
            shippingPrice: req.body.shippingPrice,
            taxPrice: req.body.taxPrice,
            totalPrice: req.body.totalPrice,
            user: req.user._id,
        });

        const order = await newOrder.save();
        res.status(201).send({ message: 'New Order Created', order });
    })
);


// admin Dashbord 
orderRouter.get(
    '/summary',
    isAuth,
    isAdmin,
    expressAsyncHandler(async (req, res) => {
        const orders = await Order.aggregate([
            {
                $group: {
                    _id: null,
                    numOrders: { $sum: 1 },
                    totalSales: { $sum: '$totalPrice' },
                },
            },
        ]);
        const users = await User.aggregate([
            {
                $group: {
                    _id: null,
                    numUsers: { $sum: 1 },
                },
            },
        ]);
        const dailyOrders = await Order.aggregate([
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    orders: { $sum: 1 },
                    sales: { $sum: '$totalPrice' },
                },
            },
            { $sort: { _id: 1 } },
        ]);
        const productCategories = await Product.aggregate([
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 },
                },
            },
        ]);
        res.send({ users, orders, dailyOrders, productCategories });
    })
);

orderRouter.get(
    '/mine',
    isAuth,
    expressAsyncHandler(async (req, res) => {
        const orders = await Order.find({ user: req.user._id });
        res.send(orders);
    }),
);
orderRouter.get(
    '/:id',
    isAuth,
    expressAsyncHandler(async (req, res) => {
        const order = await Order.findById(req.params.id);
        if (order) {
            res.send(order);
        } else {
            res.status(404).send({ message: 'Order Not Found' });
        }

    })
)

//order delevery 
orderRouter.put(
    '/:id/deliver',
    isAuth,
    expressAsyncHandler(async (req, res) => {
        const deliverOrder = await Order.findById(req.params.id);
        if (deliverOrder) {
            deliverOrder.isDelivered = true;
            deliverOrder.deliveredAt = Date.now();
            await deliverOrder.save();
            res.send({ message: 'Order Delivared' });
        }
        else {
            res.status(404).send({ message: 'order not found' });
        }
    })
);
//cod
// orderRouter.put(
//     '/:id/cod',
//     isAuth,
//     expressAsyncHandler(async(req,res)=>{

//     })
// )

// paypal
// app.js

// ...existing code...

// COD confirmation
orderRouter.put(
    '/:id/cod-confirmation',
    isAuth,
    expressAsyncHandler(async (req, res) => {
        const order = await Order.findById(req.params.id).populate('user', 'email name');
        if (order) {

            order.paymentResult = {
                id: req.body.id,
                status: req.body.status,
                update_time: req.body.update_time,
                email_address: req.body.email_address,

            };
            const updateOrder = await order.save();
            console.log("orderu", updateOrder)
            mailgun()
                .messages()
                .send({
                    from: 'Amazona <gaytridodiya20@gmail.com>',
                    to: `${order.user.name}<${order.user.email}>`,
                    subject: `New order ${order._id}`,
                    html: payOrderEmailTemplate(order),
                },
                    (error, body) => {
                        if (error) {
                            console.log(error);
                        }
                        else {
                            console.log(body);
                        }
                    });
            res.send({ message: 'Order paid', order: updateOrder });
        }
        else {
            res.status(404).send({ message: 'Order Not Found' });
        }

    })
)

// ...existing code...




orderRouter.put(
    '/:id/pay',
    isAuth,
    expressAsyncHandler(async (req, res) => {
        const order = await Order.findById(req.params.id).populate('user', 'email name');
        if (order) {
            order.isPaid = true;
            order.paidAt = Date.now();
            order.paymentResult = {
                id: req.body.id,
                status: req.body.status,
                update_time: req.body.update_time,
                email_address: req.body.email_address,

            };
            const updateOrder = await order.save();
            mailgun.message.send({
                from: 'Amazona <gaytridodiya20@gmail.com>',
                to: `${order.user.name}<${order.user.email}>`,
                subject: `New order ${order._id}`,
                html: payOrderEmailTemplate(order),
            },
                (error, body) => {
                    if (error) {
                        console.log(error);
                    }
                    else {
                        console.log(body);
                    }
                });
            res.send({ message: 'Order paid', order: updateOrder });
        }
        else {
            res.status(404).send({ message: 'Order Not Found' });
        }

    })
)

//order deleted
orderRouter.delete(
    '/:id',
    isAuth,
    isAdmin,
    expressAsyncHandler(async (req, res) => {
        const order = await Order.findById(req.params.id);
        if (order) {
            order.deleteOne();
            res.send({ message: 'order deleted' });
        }
        else {
            res.status(404).send({ message: 'order is not found' });
        }
    }))

export default orderRouter; 