"use client";

import { useState } from "react";
import { connectWallet } from "@/lib/connectWallet";
import { getContract } from "@/lib/contract";
import { ethers } from "ethers";

export default function CreatePool() {
  const [name, setName] = useState("");
  const [goal, setGoal] = useState("");
  const [loading, setLoading] = useState(false);

  const createPool = async () => {
    if (!name || !goal) return alert("Введите название и цель в WEI");
    try {
      setLoading(true);
      const { signer,network } = await connectWallet();
      const contract = getContract(signer);
      console.log(network);
      const tx = await contract.addDonationPool(name, ethers.parseEther(goal));
      await tx.wait();
      alert(" Пул создан!");
      window.location.href = "/";
    } catch (err: any) {
      alert(" Ошибка: " + (err.message || err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6">
        <h1 className="text-2xl font-bold text-center mb-4">Создание пула донатов</h1>

        <input
          placeholder="Название пула"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full mb-3 p-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-200"
        />

        <input
          placeholder="Цель (в WEI)"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          className="w-full mb-3 p-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-200"
        />

        <button
          onClick={createPool}
          disabled={loading}
          className={`w-full py-2 text-white rounded-lg ${
            loading ? "bg-gray-500" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Создание..." : "Создать пул"}
        </button>

        <button
          onClick={() => (window.location.href = "/")}
          className="w-full mt-3 text-sm text-gray-600 hover:text-black"
        >
          ← Назад
        </button>
      </div>
    </main>
  );
}