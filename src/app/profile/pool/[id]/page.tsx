"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { connectWallet } from "@/lib/connectWallet";
import { getContract } from "@/lib/contract";
import { ethers } from "ethers";

export default function OwnerPoolPage() {
  const params = useParams();
  const id = Number(params.id);

  const [pool, setPool] = useState<any>(null);
  const [shareLink, setShareLink] = useState("");

  // Загрузка данных пула
  const loadPool = async () => {
    try {
      const { signer } = await connectWallet();
      const contract = getContract(signer);

      const p = await contract.getPool(id);

      setPool({
        owner: p[0],
        id: p[1].toNumber ? p[1].toNumber() : Number(p[1]),
        name: p[2],
        goal: p[3],
        collected: p[4],
        isActive: p[5],
        donorsCount: p[6].toNumber ? p[6].toNumber() : Number(p[6]),
        donations: p[7] || [],
      });
    } catch (err) {
      console.error("Ошибка при загрузке пула:", err);
    }
  };

  useEffect(() => {
    if (!Number.isNaN(id)) loadPool();
  }, [id]);

  useEffect(() => {
    if (pool) {
      setShareLink(`${window.location.origin}/pool/${pool.id}`);
    }
  }, [pool]);

  if (!pool) return <p className="p-6">Загрузка пула...</p>;

  return (
    <main className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">{pool.name}</h1>

      <p><b>Цель:</b> {ethers.formatEther(pool.goal)} WEI</p>
      <p><b>Собрано:</b> {ethers.formatEther(pool.collected)} WEI</p>
      <p><b>Статус:</b> {pool.isActive ? "Активен" : "Отключён"}</p>
      <p><b>Количество донатеров:</b> {pool.donorsCount}</p>

      {shareLink && (
        <div className="mt-4 p-3 border rounded bg-gray-50 flex items-center gap-2">
            <p className="font-semibold"> Публичная страница для донатов:</p>
            <div className="flex items-center gap-2">
            <p className="text-gray-800 break-all">{shareLink}</p>
            <button
                className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                onClick={() => {
                navigator.clipboard.writeText(shareLink);
                alert("Ссылка скопирована!");
                }}
            >
                    Копировать
                </button>
                </div>
            </div>
            )}
      <h2 className="text-xl font-semibold mt-6 mb-2"> Донаты</h2>

      {pool.donations.length === 0 ? (
        <p>Пока донатов нет.</p>
      ) : (
        pool.donations.map((d: any, i: number) => (
          <div key={i} className="border rounded p-3 mb-2">
            <p><b>Адрес:</b> {d.donor}</p>
            <p><b>Ник:</b> {d.nickname || "—"}</p>
            <p><b>Сумма:</b> {ethers.formatEther(d.amountDonatedInWei)} WEI</p>
            <p><b>Сообщение:</b> {d.message || "—"}</p>
          </div>
        ))
      )}
    </main>
  );
}
