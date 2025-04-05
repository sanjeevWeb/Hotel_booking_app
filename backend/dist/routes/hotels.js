"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const hotel_model_1 = __importDefault(require("../models/hotel.model"));
const express_validator_1 = require("express-validator");
const razorpay_1 = __importDefault(require("razorpay"));
const auth_middleware_1 = __importDefault(require("../middleware/auth.middleware"));
const stripe_1 = __importDefault(require("stripe"));
const router = express_1.default.Router();
const razorpay_instance = new razorpay_1.default({
    key_id: process.env.razorpay_key_id,
    key_secret: process.env.razorpay_key_secret
});
const stripe = new stripe_1.default(process.env.STRIPE_API_KEY);
router.get('/search', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const query = constructSearchQuery(req.query);
        let sortOptions = {};
        switch (req.query.sortOption) {
            case "starRating":
                sortOptions = { starRating: -1 };
                break;
            case "pricePerNightAsc":
                sortOptions = { pricePerNight: 1 };
                break;
            case "pricePerNightDesc":
                sortOptions = { pricePerNight: -1 };
                break;
        }
        const pageSize = 5;
        const pageNumber = parseInt(req.query.page ? req.query.page.toString() : "1");
        const skip = (pageNumber - 1) * pageSize;
        const hotels = yield hotel_model_1.default.find(query)
            .sort(sortOptions)
            .skip(skip)
            .limit(pageSize);
        const total = yield hotel_model_1.default.countDocuments(query);
        const response = {
            data: hotels,
            pagination: {
                total,
                page: pageNumber,
                pages: Math.ceil(total / pageSize),
            },
        };
        res.json(response);
    }
    catch (error) {
        console.log("error", error);
        res.status(500).json({ message: "Something went wrong" });
    }
}));
const constructSearchQuery = (queryParams) => {
    let constructedQuery = {};
    if (queryParams.destination) {
        constructedQuery.$or = [
            { city: new RegExp(queryParams.destination, "i") },
            { country: new RegExp(queryParams.destination, "i") },
        ];
    }
    if (queryParams.adultCount) {
        constructedQuery.adultCount = {
            $gte: parseInt(queryParams.adultCount),
        };
    }
    if (queryParams.childCount) {
        constructedQuery.childCount = {
            $gte: parseInt(queryParams.childCount),
        };
    }
    if (queryParams.facilities) {
        constructedQuery.facilities = {
            $all: Array.isArray(queryParams.facilities)
                ? queryParams.facilities
                : [queryParams.facilities],
        };
    }
    if (queryParams.types) {
        constructedQuery.type = {
            $in: Array.isArray(queryParams.types)
                ? queryParams.types
                : [queryParams.types],
        };
    }
    if (queryParams.stars) {
        const starRatings = Array.isArray(queryParams.stars)
            ? queryParams.stars.map((star) => parseInt(star))
            : parseInt(queryParams.stars);
        constructedQuery.starRating = { $in: starRatings };
    }
    if (queryParams.maxPrice) {
        constructedQuery.pricePerNight = {
            $lte: parseInt(queryParams.maxPrice).toString(),
        };
    }
    return constructedQuery;
};
router.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const hotels = yield hotel_model_1.default.find().sort("-lastUpdated");
        res.json(hotels);
    }
    catch (error) {
        console.log("error", error);
        res.status(500).json({ message: "Error fetching hotels" });
    }
}));
router.get("/:id", [(0, express_validator_1.param)("id").notEmpty().withMessage("Hotel ID is required")], (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const id = req.params.id.toString();
    try {
        const hotel = yield hotel_model_1.default.findById(id);
        res.json(hotel);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error fetching hotel" });
    }
}));
// Route to create Razorpay order (instead of Stripe payment intent)
// router.post(
//     "/:hotelId/bookings/payment-intent",
//     verifyToken as any,
//     async (req: Request, res: Response): Promise<any> => {
//         try {
//             const { numberOfNights } = req.body;
//             const hotelId = req.params.hotelId;
//             const hotel = await Hotel.findById(hotelId);
//             if (!hotel) {
//                 return res.status(400).json({ message: "Hotel not found" });
//             }
//             const totalCost = hotel.pricePerNight * numberOfNights;
//             // Create a Razorpay Order
//             const options = {
//                 amount: totalCost * 100, // Razorpay works in paise (1 INR = 100 paise)
//                 currency: "INR",
//                 receipt: `receipt_${hotelId}_${req.userId}`,
//                 notes: {
//                     hotelId,
//                     userId: req.userId,
//                 },
//             };
//             const order = await razorpay_instance.orders.create(options);
//             if (!order) {
//                 return res.status(500).json({ message: "Error creating Razorpay order" });
//             }
//             res.json({
//                 orderId: order.id,
//                 totalCost,
//                 currency: order.currency,
//             });
//         } catch (error) {
//             console.error(error);
//             res.status(500).json({ message: "Something went wrong" });
//         }
//     }
// );
// Route to verify payment and create booking
// router.post(
//     "/:hotelId/bookings",
//     verifyToken as any,
//     async (req: Request, res: Response): Promise<any> => {
//         try {
//             const { orderId, paymentId, signature } = req.body;
//             if (!orderId || !paymentId || !signature) {
//                 return res.status(400).json({ message: "Payment details missing" });
//             }
//             // Fetch payment details from Razorpay
//             const payment = await razorpay_instance.payments.fetch(paymentId);
//             if (!payment) {
//                 return res.status(400).json({ message: "Payment not found" });
//             }
//             // Verify payment signature
//             const expectedSignature = crypto
//                 .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET as string)
//                 .update(orderId + "|" + paymentId)
//                 .digest("hex");
//             if (expectedSignature !== signature) {
//                 return res.status(400).json({ message: "Invalid payment signature" });
//             }
//             // Ensure payment was successful
//             if (payment.status !== "captured") {
//                 return res.status(400).json({ message: `Payment not successful. Status: ${payment.status}` });
//             }
//             // Create booking
//             const newBooking: BookingType = {
//                 ...req.body,
//                 userId: req.userId,
//             };
//             const hotel = await Hotel.findOneAndUpdate(
//                 { _id: req.params.hotelId },
//                 { $push: { bookings: newBooking } }
//             );
//             if (!hotel) {
//                 return res.status(400).json({ message: "Hotel not found" });
//             }
//             await hotel.save();
//             res.status(200).send();
//         } catch (error) {
//             console.error(error);
//             res.status(500).json({ message: "Something went wrong" });
//         }
//     }
// );
router.post("/:hotelId/bookings/payment-intent", auth_middleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { numberOfNights } = req.body;
    const hotelId = req.params.hotelId;
    const hotel = yield hotel_model_1.default.findById(hotelId);
    if (!hotel) {
        return res.status(400).json({ message: "Hotel not found" });
    }
    const totalCost = hotel.pricePerNight * numberOfNights;
    const paymentIntent = yield stripe.paymentIntents.create({
        amount: totalCost * 100,
        currency: "gbp",
        metadata: {
            hotelId,
            userId: req.userId,
        },
    });
    if (!paymentIntent.client_secret) {
        return res.status(500).json({ message: "Error creating payment intent" });
    }
    const response = {
        paymentIntentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret.toString(),
        totalCost,
    };
    res.send(response);
}));
router.post("/:hotelId/bookings", auth_middleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const paymentIntentId = req.body.paymentIntentId;
        const paymentIntent = yield stripe.paymentIntents.retrieve(paymentIntentId);
        if (!paymentIntent) {
            return res.status(400).json({ message: "payment intent not found" });
        }
        if (paymentIntent.metadata.hotelId !== req.params.hotelId ||
            paymentIntent.metadata.userId !== req.userId) {
            return res.status(400).json({ message: "payment intent mismatch" });
        }
        if (paymentIntent.status !== "succeeded") {
            return res.status(400).json({
                message: `payment intent not succeeded. Status: ${paymentIntent.status}`,
            });
        }
        const newBooking = Object.assign(Object.assign({}, req.body), { userId: req.userId });
        const hotel = yield hotel_model_1.default.findOneAndUpdate({ _id: req.params.hotelId }, {
            $push: { bookings: newBooking },
        });
        if (!hotel) {
            return res.status(400).json({ message: "hotel not found" });
        }
        yield hotel.save();
        res.status(200).send();
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "something went wrong" });
    }
}));
exports.default = router;
