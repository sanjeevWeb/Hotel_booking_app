import express, { Request, Response } from 'express'
import Hotel from '../models/hotel.model';
import { ParsedQs } from 'qs';
import { BookingType, HotelSearchResponse } from '../shared/types';
import { param, validationResult } from 'express-validator';
import Razorpay from 'razorpay';
import verifyToken from '../middleware/auth.middleware';
import crypto from 'crypto'
import Stripe from "stripe";

const router = express.Router()

const razorpay_instance = new Razorpay({
  key_id: process.env.razorpay_key_id as string,
  key_secret: process.env.razorpay_key_secret as string
});

const stripe = new Stripe(process.env.STRIPE_API_KEY as string);

router.get('/search', async (req: Request, res: Response): Promise<any> => {
  try {
    const query: any = constructSearchQuery(req.query);

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
    const pageNumber = parseInt(
      req.query.page ? req.query.page.toString() : "1"
    );
    const skip = (pageNumber - 1) * pageSize;

    const hotels = await Hotel.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(pageSize);

    const total = await Hotel.countDocuments(query);

    const response: HotelSearchResponse = {
      data: hotels,
      pagination: {
        total,
        page: pageNumber,
        pages: Math.ceil(total / pageSize),
      },
    };

    res.json(response);
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ message: "Something went wrong" });
  }
})

const constructSearchQuery = (queryParams: any) => {
  let constructedQuery: any = {};

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
      ? queryParams.stars.map((star: string) => parseInt(star))
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

router.get("/", async (req: Request, res: Response) => {
  try {
    const hotels = await Hotel.find().sort("-lastUpdated");
    res.json(hotels);
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ message: "Error fetching hotels" });
  }
});

router.get(
  "/:id",
  [param("id").notEmpty().withMessage("Hotel ID is required")],
  async (req: Request, res: Response): Promise<any> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const id = req.params.id.toString();

    try {
      const hotel = await Hotel.findById(id);
      res.json(hotel);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Error fetching hotel" });
    }
  }
);

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

router.post(
  "/:hotelId/bookings/payment-intent",
  verifyToken as any,
  async (req: Request, res: Response): Promise<any> => {
    const { numberOfNights } = req.body;
    const hotelId = req.params.hotelId;

    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      return res.status(400).json({ message: "Hotel not found" });
    }

    const totalCost = hotel.pricePerNight * numberOfNights;

    const paymentIntent = await stripe.paymentIntents.create({
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
  }
);

router.post(
  "/:hotelId/bookings",
  verifyToken as any,
  async (req: Request, res: Response): Promise<any> => {
    try {
      const paymentIntentId = req.body.paymentIntentId;

      const paymentIntent = await stripe.paymentIntents.retrieve(
        paymentIntentId as string
      );

      if (!paymentIntent) {
        return res.status(400).json({ message: "payment intent not found" });
      }

      if (
        paymentIntent.metadata.hotelId !== req.params.hotelId ||
        paymentIntent.metadata.userId !== req.userId
      ) {
        return res.status(400).json({ message: "payment intent mismatch" });
      }

      if (paymentIntent.status !== "succeeded") {
        return res.status(400).json({
          message: `payment intent not succeeded. Status: ${paymentIntent.status}`,
        });
      }

      const newBooking: BookingType = {
        ...req.body,
        userId: req.userId,
      };

      const hotel = await Hotel.findOneAndUpdate(
        { _id: req.params.hotelId },
        {
          $push: { bookings: newBooking },
        }
      );

      if (!hotel) {
        return res.status(400).json({ message: "hotel not found" });
      }

      await hotel.save();
      res.status(200).send();
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "something went wrong" });
    }
  }
);
export default router
