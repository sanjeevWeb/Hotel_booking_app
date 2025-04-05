import express, { NextFunction, Request, Response } from 'express'
import User from '../models/user.model'
import jwt from 'jsonwebtoken'
import { check, validationResult } from 'express-validator'
import verifyToken from '../middleware/auth.middleware'
 
const router = express.Router()

router.get("/me", verifyToken as any, async (req: Request, res: Response): Promise<any> => {
    const userId = req.userId;

    try {
        const user = await User.findById(userId).select("-password");
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }
        res.json(user);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "something went wrong" });
    }
});

router.post('/register', [
    check("email", "Email is required").isEmail(),
    check("password", "Password with 5 or more characters required").isLength({ min: 5 }),
    check("firstName", "First Name is required").isString(),
    check("lastName", "Last Name is required").isString()
], async (req: Request, res: Response, next: NextFunction): Promise<any> => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array() });
    }
    try {
        let user = await User.findOne({
            email: req.body.email
        })
        if (user) {
            return res.status(400).json({ message: "User alredy exists" })
        }
        user = new User(req.body)
        await user.save()
        // console.log('user', user);
        // Generating token
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY as string, { expiresIn: '1d' })
        // console.log('token', token);
        return res.cookie("auth_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 86400000
        })
            .status(200).json({ message: "User registered successfully" });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Something went wrong" })
    }
})

export default router