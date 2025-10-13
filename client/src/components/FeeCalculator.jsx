// src/components/FeeCalculator.jsx
import React, { useEffect, useState } from "react";

const FeeCalculator = ({ wasteCategory, weight, requestType }) => {
  const [estimatedCost, setEstimatedCost] = useState(0);

  useEffect(() => {
    if (!wasteCategory) return setEstimatedCost(0);

    const basePrices = {
      general: 100,
      recyclable: 80,
      organic: 90,
      hazardous: 200,
      bulky: 150,
      electronic: 180,
      medical: 250,
    };

    let cost = basePrices[wasteCategory] || 100;

    if (requestType === "special") cost *= 1.5;
    if (weight) cost += Number(weight) * 10;

    setEstimatedCost(Math.round(cost));
  }, [wasteCategory, weight, requestType]);

  if (!wasteCategory) return null;

  return (
    <div className="text-center mb-3">
      <p className="fw-semibold text-primary">
        Estimated Cost: Rs. {estimatedCost}
      </p>
    </div>
  );
};

export default FeeCalculator;
