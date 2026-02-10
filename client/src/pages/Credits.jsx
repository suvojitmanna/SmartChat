import React, { useEffect, useState } from "react";
import { dummyPlans } from "../assets/assets";
import Loading from "./Loading";
import { useAppcontext } from "../context/Appcontext";
import toast from "react-hot-toast";

const Credits = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token, axios } = useAppcontext();

  const fetchplans = async () => {
    try {
      const { data } = await axios.get("/api/credit/plan", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) {
        setPlans(data.plans);
      } else {
        toast.error(data.message || "Failed to fetch plans.");
      }
    } catch (error) {
      toast.error(error.message);
    }
    setLoading(false);
  };

  const purchasePlan = async (planId) => {
    try {
      const { data } = await axios.post(
        "/api/credit/purchase",
        { planId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        window.location.href = data.url;
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  useEffect(() => {
    setPlans(dummyPlans);
    setLoading(false);
    // fetchplans(); // enable when backend is ready
  }, []);

  if (loading) return <Loading />;

  return (
    <div className="max-w-7xl mx-auto px-6 py-16 bg-transparent dark:bg-[#141218] min-h-screen">
      <h2 className="text-4xl font-bold text-center mb-4 text-gray-900 dark:text-white">
        Choose Your Credit Plan
      </h2>
      <p className="text-center text-gray-500 dark:text-gray-400 mb-12">
        Flexible plans for every type of user
      </p>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
        {plans.map((plan) => {
          const isPro = plan._id === "pro";

          return (
            <div
              key={plan._id}
              className={`relative rounded-2xl p-8 transition-all duration-300 flex flex-col justify-between hover:-translate-y-2 hover:shadow-2xl
              ${
                isPro
                  ? "bg-gradient-to-br from-purple-600 to-indigo-600 text-white shadow-2xl dark:shadow-purple-900/40 scale-105"
                  : "bg-white/80 dark:bg-[#1e1b24] border border-gray-200 dark:border-white/10 shadow-md dark:shadow-lg hover:bg-white/60 dark:hover:bg-[#26222d]"
              }`}
            >
              {isPro && (
                <span className="absolute top-4 right-4 bg-white/90 backdrop-blur text-purple-700 text-xs font-bold px-4 py-1.5 rounded-full shadow-md tracking-wide">
                  ⭐ MOST POPULAR
                </span>
              )}

              <div>
                <h3
                  className={`text-2xl font-semibold mb-4 ${
                    isPro ? "text-white" : "text-gray-900 dark:text-white"
                  }`}
                >
                  {plan.name}
                </h3>

                <div className="mb-6">
                  <span className="text-4xl font-bold">${plan.price}</span>
                  <span
                    className={`ml-2 ${
                      isPro
                        ? "text-purple-100"
                        : "text-gray-500 dark:text-gray-300"
                    }`}
                  >
                    / {plan.credits} credits
                  </span>
                </div>

                <ul
                  className={`space-y-2 mb-8 ${
                    isPro
                      ? "text-purple-100"
                      : "text-gray-600 dark:text-gray-200"
                  }`}
                >
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span
                        className={`mt-0.5 ${
                          isPro
                            ? "text-white"
                            : "text-purple-600 dark:text-purple-400"
                        }`}
                      >
                        ✓
                      </span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                className={`w-full py-3 rounded-lg font-semibold transition transform active:scale-95 cursor-pointer
                ${
                  isPro
                    ? "bg-white text-purple-700 hover:bg-gray-100"
                    : "bg-purple-600 text-white hover:bg-purple-700"
                }`}
                onClick={() =>
                  toast.promise(purchasePlan(plan._id), {
                    loading: "Processing...",
                  })
                }
              >
                Buy Now
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Credits;
