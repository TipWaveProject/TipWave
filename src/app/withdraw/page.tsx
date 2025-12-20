"use client";

import { connectWallet } from "@/lib/connectWallet";
import { getContract } from "@/lib/contract";
import { ethers } from "ethers";
import { useState } from "react";

export default function Withdraw() {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const withdraw = async () => {
    if (!amount) return alert("Введите сумму для вывода");
    try {
      setLoading(true);
      const { signer } = await connectWallet();
      const contract = getContract(signer);
      const tx = await contract.withdraw(ethers.parseEther(amount));
      await tx.wait();
      alert(" Средства успешно выведены!");
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
        <h1 className="text-2xl font-bold text-center mb-4">Вывод средств</h1>

        <input
          placeholder="Сумма в WEI"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full mb-3 p-2 border rounded-md focus:outline-none focus:ring focus:ring-yellow-200"
        />

        <button
          onClick={withdraw}
          disabled={loading}
          className={`w-full py-2 text-white rounded-lg ${
            loading ? "bg-gray-500" : "bg-yellow-600 hover:bg-yellow-700"
          }`}
        >
          {loading ? "Выполняется..." : "Вывести"}
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
