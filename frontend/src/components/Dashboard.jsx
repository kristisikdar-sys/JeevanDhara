import React, { useEffect, useRef } from "react";
import { Chart, registerables } from "chart.js";
Chart.register(...registerables);

export default function Dashboard({ user, onLogout }) {
  const chartRef = useRef(null);

  const data = [
    { region: "North", available: 120, usage: 90 },
    { region: "South", available: 200, usage: 150 },
    { region: "East", available: 180, usage: 140 },
    { region: "West", available: 160, usage: 130 },
  ];

  useEffect(() => {
    const ctx = chartRef.current.getContext("2d");
    new Chart(ctx, {
      type: "bar",
      data: {
        labels: data.map((d) => d.region),
        datasets: [
          { label: "Available", data: data.map((d) => d.available), backgroundColor: "rgba(34,197,94,0.7)" },
          { label: "Usage", data: data.map((d) => d.usage), backgroundColor: "rgba(59,130,246,0.7)" },
        ],
      },
      options: { responsive: true },
    });
  }, []);

  return (
    <div className="p-6">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">💧 Jeevandhara Dashboard</h1>
        <div>
          <span className="mr-4">Hi, {user.username}</span>
          <button onClick={onLogout} className="bg-red-500 text-white py-1 px-3 rounded">
            Logout
          </button>
        </div>
      </header>

      <div className="bg-white p-4 rounded shadow mb-6">
        <h2 className="text-xl mb-2">Water Availability vs Usage</h2>
        <canvas ref={chartRef} />
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-xl mb-2">Data Table</h2>
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="border p-2">Region</th>
              <th className="border p-2">Available</th>
              <th className="border p-2">Usage</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d) => (
              <tr key={d.region}>
                <td className="border p-2">{d.region}</td>
                <td className="border p-2">{d.available}</td>
                <td className="border p-2">{d.usage}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
