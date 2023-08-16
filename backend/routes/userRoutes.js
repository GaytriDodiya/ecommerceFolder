import express from 'express';
import bcrypt from 'bcryptjs';
import expressAsyncHandler from 'express-async-handler';
import User from '../models/userModel.js';
import { generateToken, isAdmin, isAuth, baseUrl, mailgun } from '../utills.js';
import jwt from 'jsonwebtoken';
const userRouter = express.Router();

userRouter.post(
    '/signin',
    expressAsyncHandler(async (req, res) => {
        const user = await User.findOne({ email: req.body.email });
        if (user) {
            if (bcrypt.compareSync(req.body.password, user.password)) {
                res.send({
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    isAdmin: user.isAdmin,
                    token: generateToken(user),
                });
                return;
            }
        }
        res.status(401).send({ message: 'Invalid email or password' });
    })
);

userRouter.post('/signup', expressAsyncHandler(async (req, res) => {
    console.log('req.body', req.body)
    const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password),
    });
    const user = await newUser.save();
    res.send({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        token: generateToken(user),
    });
})
);
// get user by id
userRouter.get(
    '/:id',
    isAuth,
    isAdmin,
    expressAsyncHandler(async (req, res) => {
        const user = await User.findById(req.params.id);
        if (user) {
            res.send(user);
        }
        else {
            res.status(404).send({ message: 'user not found' });
        }
    })
);
userRouter.put(
    '/:id',
    isAuth,
    isAdmin,
    expressAsyncHandler(async (req, res) => {
        const user = await User.findById(req.params.id);
        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            user.isAdmin = Boolean(req.body.isAdmin);

            const updateUser = await user.save();
            res.send({ message: 'user updated', user: updateUser });
        }
        else {
            res.status(404).send({ message: 'user not found' });
        }
    })
);

userRouter.put(
    '/profile',
    isAuth,
    expressAsyncHandler(async (req, res) => {
        const user = await User.findById(req.user._id);
        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            if (req.body.password) {
                user.password = bcrypt.hashSync(req.body.password, 8);
            }
            const updatedUser = await user.save();
            res.send({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                isAdmin: updatedUser.isAdmin,
                token: generateToken(updatedUser),
            });

        }

        else {
            res.status(404).send({ message: 'User Not Found' })
        }
    }
    )
);

userRouter.post(
    '/forget-password',
    expressAsyncHandler(async (req, res) => {
        const user = await User.findOne({ email: req.body.email });

        if (user) {
            const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
                expiresIn: '3h',
            });
            user.resetToken = token;
            await user.save();

            //reset link
            console.log(`${baseUrl()}/reset-password/${token}`);

            mailgun()
                .messages()
                .send(
                    {
                        from: 'Amazona <gaytridodiya20@gmail.com>',
                        to: `${user.name} <${user.email}>`,
                        subject: `Reset Password`,
                        html: ` 
               <p>Please Click the following link to reset your password:</p> 
               <a href="${baseUrl()}/reset-password/${token}"}>Reset Password</a>
               `,
                    },
                    (error, body) => {
                        console.log(error);
                        console.log(body);
                    }
                );
            res.send({ message: 'We sent reset password link to your email.' });
        } else {
            res.status(404).send({ message: 'User not found' });
        }
    })
);

userRouter.post(
    '/reset-password',
    expressAsyncHandler(async (req, res) => {
        jwt.verify(req.body.token, process.env.JWT_SECRET, async (err, decode) => {
            if (err) {
                res.status(401).send({ message: 'Invalid Token' });
            } else {
                const user = await User.findOne({ resetToken: req.body.token });
                if (user) {
                    if (req.body.password) {
                        user.password = bcrypt.hashSync(req.body.password, 8);
                        await user.save();
                        res.send({
                            message: 'Password reseted successfully',
                        });
                    }
                } else {
                    res.status(404).send({ message: 'User not found' });
                }
            }
        });
    })
);
// show users 
userRouter.get(
    '/',
    isAuth,
    isAdmin,
    expressAsyncHandler(async (req, res) => {
        const users = await User.find({});
        res.send(users);
    })
);


// delete user
userRouter.delete(
    '/:id',
    isAuth,
    isAdmin,
    expressAsyncHandler(async (req, res) => {
        const user = await User.findById(req.params.id);
        if (user) {
            user.deleteOne();
            res.send({ message: 'user deleted' });
        }
        else {
            res.status(404).send({ message: 'user not found' })
        }
    })
);


export default userRouter;