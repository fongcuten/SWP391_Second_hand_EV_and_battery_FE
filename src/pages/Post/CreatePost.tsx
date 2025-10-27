import React, { useState } from "react";
import CategorySelectorCard from "./CategorySelector";
import VehicleForm from "./VehicleForm";
import BatteryForm from "./BatteryForm";

const CreateEVPost: React.FC = () => {
  const [category, setCategory] = useState<"vehicle" | "battery">("vehicle");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitted category:", category);
  };

  return (
    <div className="min-h-screen py-10
                 bg-gradient-to-br from-[#F7F9F9] via-[#E8F9E9] to-[#A8E6CF]/50
                 relative"
    >
      <div>
        <div className="max-w-3xl mx-auto rounded-2xl shadow-md mt-5">
          <CategorySelectorCard category={category} setCategory={setCategory} />
        </div>
        {category === "vehicle" ? <VehicleForm /> : <BatteryForm />}
      </div>
    </div>
  );
};

export default CreateEVPost;
