import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Check,
  ArrowLeft,
  ArrowRight,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setUser } from "../../redux/userSlice";
import { useNavigate } from "react-router-dom";

const plans = [
  {
    id: "free",
    name: "Free",
    price: "0",
    credits: "100 Credits",
    description: "Perfect for beginners starting interview preparation.",
    features: [
      "100 AI Interview Credits",
      "Basic Performance Report",
      "Voice Interview Access",
      "Limited History Tracking",
    ],
  },
  {
    id: "starter",
    name: "Starter Pack",
    price: "100",
    credits: "150 Credits",
    description: "Great for focused practice and skill improvement.",
    features: [
      "150 AI Interview Credits",
      "Detailed Feedback",
      "Performance Analytics",
      "Full Interview History",
    ],
  },
  {
    id: "pro",
    name: "Pro Pack",
    price: "500",
    credits: "650 Credits",
    description: "Best value for serious job preparation.",
    features: [
      "650 AI Interview Credits",
      "Advanced AI Feedback",
      "Skill Trend Analysis",
      "Priority AI Processing",
    ],
    tag: "Best Value",
  },
];

const Pricing = () => {
  // State to track which plan is clicked
  const [selectedPlan, setSelectedPlan] = useState("starter"); // Default highlighted
  const [loadingPlan, setLoadingPlan] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handlePayment = async (plan) => {
    try {
      setLoadingPlan(plan.id);

      const amount = plan.id === "starter" ? 100 : plan.id === "pro" ? 500 : 0;

      const result = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/api/payment/create-order`,
        { amount, planId: plan.id, credits: plan.credits },
        { withCredentials: true },
      );

      console.log(result.data);

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: result.data.amount,
        currency: "INR",
        name: "AI Interview Agent",
        description: "Payment for interview credits",
        image: "https://example.com/logo.png",
        order_id: result.data.id,
        handler: async function (response) {
          try {
            const res = await axios.post(
              `${import.meta.env.VITE_SERVER_URL}/api/payment/verify-payment`,
              {
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
              },
              { withCredentials: true },
            );

            if (res.data.success) {
              dispatch(setUser(res.data.user)); // Now 'dispatch' is the actual function
              navigate("/");
            } else {
              // Show alert only if success is false
              alert("Payment verification failed: " + res.data.message);
            }
          } catch (err) {
            console.error(err);
            alert("Error on payment verification try again");
          }
        },
        theme: {
          color: "#ee5a2b",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

      setLoadingPlan(null);
    } catch (error) {
      console.log(error);
      setLoadingPlan(null);
    }
  };

  return (
    <div className="relative min-h-screen overflow-x-clip bg-[#f6f5f3] px-4 py-12 font-sans text-[#111111] sm:py-16">
      {/* Soft background glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 h-72 w-[40rem] -translate-x-1/2 rounded-full bg-[#ee5a2b] opacity-15 blur-[110px]"
      />

      <div className="relative mx-auto max-w-6xl">
        {/* Back Button */}
        <button
          type="button"
          onClick={() => window.history.back()}
          aria-label="Go back"
          className="group mb-8 flex h-11 w-11 items-center justify-center rounded-full border border-neutral-200 bg-white shadow-sm transition hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ee5a2b]"
        >
          <ArrowLeft className="h-5 w-5 text-neutral-700 transition-transform group-hover:-translate-x-1" />
        </button>

        <div className="mb-14 text-center sm:mb-16">
          <div className="mx-auto mb-5 flex w-fit items-center gap-2 rounded-full bg-white px-2 py-1 shadow-sm">
            <span className="rounded-full bg-[#ee5a2b] px-2 py-0.5 text-[10px] font-bold text-white">
              PRICING
            </span>
            <span className="pr-1 text-[10px] font-medium uppercase tracking-wider text-neutral-500">
              Credits for every goal
            </span>
          </div>

          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Choose your plan
          </h1>
          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-neutral-600 sm:text-base">
            Flexible pricing to match your interview preparation goals.
          </p>
        </div>

        <div className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-3 md:gap-7">
          {plans.map((plan, index) => {
            const isSelected = selectedPlan === plan.id;
            const isLoading = loadingPlan === plan.id;

            return (
              <motion.div
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.08,
                  ease: "easeOut",
                }}
                whileHover={{ y: -5 }}
                className={`relative flex h-full cursor-pointer flex-col overflow-hidden rounded-3xl p-7 transition-all duration-500 sm:p-8 ${
                  isSelected
                    ? "z-10 bg-[#111111] text-white shadow-[0_30px_70px_rgba(0,0,0,0.3)] md:scale-105"
                    : "border border-black/5 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.05)] hover:border-neutral-300"
                }`}
              >
                {isSelected && (
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -right-16 -top-20 h-52 w-52 rounded-full bg-[#ee5a2b] opacity-40 blur-[80px]"
                  />
                )}

                {plan.tag && (
                  <span className="absolute right-6 top-6 rounded-full bg-[#ee5a2b] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                    {plan.tag}
                  </span>
                )}

                <div className="relative mb-8">
                  <h3 className="mb-5 text-lg font-semibold tracking-tight">
                    {plan.name}
                  </h3>

                  <div className="flex items-end gap-2">
                    <span className="text-5xl font-semibold tracking-tight">
                      ₹{plan.price}
                    </span>
                  </div>

                  <span
                    className={`mt-3 inline-block rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wider ${
                      isSelected
                        ? "bg-white/10 text-[#ff8a5f]"
                        : "bg-[#fff1ea] text-[#c2410c]"
                    }`}
                  >
                    {plan.credits}
                  </span>

                  <p
                    className={`mt-4 text-sm leading-relaxed ${
                      isSelected ? "text-white/60" : "text-neutral-500"
                    }`}
                  >
                    {plan.description}
                  </p>
                </div>

                <div
                  className={`relative mb-9 grow space-y-4 border-t pt-7 ${
                    isSelected ? "border-white/10" : "border-neutral-100"
                  }`}
                >
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-3">
                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                          isSelected ? "bg-[#ee5a2b]" : "bg-[#111111]"
                        }`}
                      >
                        <Check className="h-3 w-3 text-white" strokeWidth={4} />
                      </span>
                      <span
                        className={`text-sm font-medium ${
                          isSelected ? "text-white/85" : "text-neutral-700"
                        }`}
                      >
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Dynamic Button Text Logic */}
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isSelected) {
                      setSelectedPlan(plan.id);
                    } else {
                      handlePayment(plan);
                    }
                  }}
                  className={`group relative flex w-full items-center justify-between rounded-full py-1.5 pl-6 pr-1.5 text-sm font-semibold transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ee5a2b] focus-visible:ring-offset-2 ${
                    isSelected
                      ? "bg-white text-[#111111] hover:opacity-90"
                      : "border border-neutral-200 bg-neutral-50 text-neutral-600 hover:border-neutral-400 hover:text-[#111111]"
                  }`}
                >
                  {isLoading
                    ? "Processing..."
                    : isSelected
                      ? "Proceed to Pay"
                      : "Select Plan"}

                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-full ${
                      isSelected
                        ? "bg-[#ee5a2b] text-white"
                        : "bg-white text-neutral-400"
                    }`}
                  >
                    {isLoading ? (
                      <Loader2 size={17} className="animate-spin" />
                    ) : (
                      <ArrowRight
                        size={17}
                        className="transition group-hover:translate-x-0.5"
                      />
                    )}
                  </span>
                </button>
              </motion.div>
            );
          })}
        </div>

        <p className="mt-12 flex items-center justify-center gap-2 text-xs text-neutral-500">
          <ShieldCheck size={15} className="text-[#ee5a2b]" />
          Secure payments powered by Razorpay
        </p>
      </div>
    </div>
  );
};

export default Pricing;
