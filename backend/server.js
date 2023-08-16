import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import Path from "path";
import seedRouter from "./routes/seedRoutes.js";
import productRouter from "./routes/productRoutes.js";
import userRouter from "./routes/userRoutes.js";
import orderRouter from "./routes/orderRoutes.js";
import uploadRoute from "./routes/uploadRoutes.js";
dotenv.config();
const app = express();
mongoose
    .connect(process.env.MONGODB_URI).then(() => {
        console.log("connect")
    }
    ).catch((err) => {
        console.log(err.message)
    })
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// created a api for get paypal client id 
app.get('/api/keys/paypal', (req, res) => {
    res.send(process.env.PAYPAL_CLIENT_ID || 'sb');
})
app.use('/api/seed', seedRouter);
app.use('/api/products', productRouter);
app.use('/api/users', userRouter);
app.use('/api/orders', orderRouter);
app.use('/api/upload', uploadRoute);
// app.get('/api/products', (req, res) => {
//     res.send(data.products);
// });
const __dirname = Path.resolve();
app.use(express.static(Path.join(__dirname, '/frontend-app/build')));
app.get('*', (req, res) =>
    res.sendFile(Path.join(__dirname, '/frontend-app/build/index.html'))
);
//get user address using google api
app.get('/api/keys/google', (req, res) => {
    res.send({ key: process.env.GOOGLE_API_KEY || '' });
});

app.use((err, req, res, next) => {
    res.status(500).send({ message: err.message });
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
    console.log(`serve at http://localhost:${port}`);
})

