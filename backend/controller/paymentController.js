import dotenv from "dotenv";
dotenv.config();

import Payment from "../model/payment.model.js";
import Razorpay from "razorpay";
import crypto from "crypto";
import User from "../model/user.model.js";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const createOrder = async (req, res) => {
  try {
    const { amount, planId, credits } = req.body;

    const numericCredits = parseInt(credits);

    const options = {
      amount: Number(amount) * 100,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    await Payment.create({
      userId: req.userId,
      razorpayOrderId: order.id,
      amount: order.amount,
      currency: order.currency,
      planId,
      credits: numericCredits,
    });

    return res.status(200).json(order);

  } catch (error) {
    console.log("Create Order Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;

    const generatedSignature = crypto
      .createHmac(
        "sha256",
        process.env.RAZORPAY_KEY_SECRET
      )
      .update(body)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature",
      });
    }

    const payment = await Payment.findOne({
      razorpayOrderId: razorpay_order_id,
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    if (payment.status === "paid") {
      return res.status(400).json({
        success: false,
        message: "Payment already verified",
      });
    }

    payment.status = "paid";
    payment.razorpayPaymentId = razorpay_payment_id;

    await payment.save();

    const updateUser = await User.findByIdAndUpdate(
      req.userId,
      {
        $inc: {
          credits: payment.credits,
        },
      },
      {
        new: true,
      }
    );

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      user: updateUser,
    });

  } catch (error) {
    console.log("Verify Payment Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};