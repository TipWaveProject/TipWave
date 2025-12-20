"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getContract } from "@/lib/contract";
import { ethers } from "ethers";
import { connectWallet } from "@/lib/connectWallet";

export default function PublicPoolPage() {
  const params = useParams();
  const id = Number(params.id);

  const [pool, setPool] = useState<any>(null);
  const [donationAmount, setDonationAmount] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const getSigner = async () => {
    const { signer } = await connectWallet();
    return signer;
  };

  const loadPool = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const contract = getContract(provider);

    const p = await contract.getPool(id);
    setPool({
      id: Number(p[1]),
      name: p[2],
      goal: p[3],
      collected: p[4],
      isActive: p[5],
    });
  };

  const donate = async () => {
    if (!donationAmount || Number(donationAmount) <= 0) return alert("Введите сумму");
    try {
      setLoading(true);
      const signer = await getSigner();
      const contract = getContract(signer);

      const tx = await contract.donate(pool.id, message, {
        value: ethers.parseEther(donationAmount),
      });
      await tx.wait();

      alert("Донат успешно отправлен!");
      setDonationAmount("");
      setMessage("");
      loadPool();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!Number.isNaN(id)) loadPool();
  }, [id]);

  if (!pool) return <p>Загрузка пула...</p>;

  return (
    <main className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">{pool.name}</h1>
      <p><b>Цель:</b> {ethers.formatEther(pool.goal)} WEI</p>
      <p><b>Собрано:</b> {ethers.formatEther(pool.collected)} WEI</p>

      <div className="mt-6">
        <input
          type="text"
          placeholder="Сумма в WEI"
          value={donationAmount}
          onChange={(e) => setDonationAmount(e.target.value)}
          className="border p-2 w-full mb-2"
        />
        <textarea
          placeholder="Сообщение"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="border p-2 w-full mb-2"
        />
        <button
          onClick={donate}
          disabled={loading}
          className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? "Отправка..." : "Донатить"}
        </button>
      </div>
    </main>
  );
}