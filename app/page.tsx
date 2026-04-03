"use client";
import { useSolPrice } from "./hooks/useSolPrice";
import PredictionGrid from "./components/PredictionGrid";

export default function Home() {
  const { price, history } = useSolPrice();

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold mb-2">SOL Price Prediction</h1>
      <p className="text-gray-500 mb-8">Predict where SOL/USD will be in the next 100 seconds</p>
      <PredictionGrid price={price} history={history} />
    </div>
  );
}
