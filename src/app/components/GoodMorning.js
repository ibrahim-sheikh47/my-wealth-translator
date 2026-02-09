import React from "react";

const GoodMorning = () => {
  return (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-3">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold text-white"
          style={{ backgroundColor: "#c7a481" }}
        >
          GR
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-zinc-400 text-sm">Good Morning</span>
            <span style={{ color: "#c7a481" }}>👋</span>
          </div>
          <h2 className="text-lg font-semibold">Gemma Rhodes</h2>
        </div>
      </div>
    </div>
  );
};

export default GoodMorning;
