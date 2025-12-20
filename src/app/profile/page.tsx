"use client";

import { useEffect, useState } from "react";
import { getContract } from "@/lib/contract";
import { ethers } from "ethers";

export default function ProfilePage() {
  const [address, setAddress] = useState<string>("");
  const [nickname, setNickname] = useState<string>("");
  const [newNickname, setNewNickname] = useState<string>("");
  const [balance, setBalance] = useState<string>("0");
  const [createdPools, setCreatedPools] = useState<any[]>([]);
  const [withdrawAmount, setWithdrawAmount] = useState<string>("");
  const [loading, setLoading] = useState(false);

  // Подключение к MetaMask и получение signer/provider
  const connectWallet = async () => {
    if (!window.ethereum) throw new Error("MetaMask не установлен");
    const provider = new ethers.BrowserProvider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    return { provider, signer, address };
  };

  const loadProfile = async () => {
    try {
      const { provider, address } = await connectWallet();
      setAddress(address);

      const contract = getContract(provider);
      const user = await contract.getUser(address);

      setNickname(user[0]);
      setBalance(ethers.formatEther(user[2]));

      const poolIds: number[] = user[1].map((n: any) => Number(n));
      const pools = [];
      for (let id of poolIds) {
        const p = await contract.getPool(id);
        pools.push(p);
      }
      setCreatedPools(pools);
    } catch (e) {
      console.error("Ошибка при загрузке профиля:", e);
    }
  };

  const changeNickname = async () => {
    if (!newNickname.trim()) return;
    try {
      setLoading(true);
      const { signer } = await connectWallet();
      const contract = getContract(signer);
      const tx = await contract.setNickname(newNickname);
      await tx.wait();
      setNewNickname("");
      await loadProfile();
    } catch (e) {
      console.error("Ошибка при смене ника:", e);
      alert("Ошибка при смене ника");
    } finally {
      setLoading(false);
    }
  };

  const withdrawBalance = async () => {
    if (!withdrawAmount) return;
    try {
      setLoading(true);
      const { signer } = await connectWallet();
      const contract = getContract(signer);

      // Преобразуем введённое значение в WEI
      const amountInWei = ethers.parseEther(withdrawAmount);

      const tx = await contract.withdraw(amountInWei);
      await tx.wait();
      setWithdrawAmount("");
      await loadProfile();
    } catch (e) {
      console.error("Ошибка при выводе средств:", e);
      alert("Ошибка при выводе средств");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  return (
    <main className="p-6 font-sans max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">Ваш профиль</h1>
        <button
          onClick={() => (window.location.href = "/create")}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          Создать пул
        </button>
      </div>

      {!address ? (
        <p className="text-red-600">Подключение к MetaMask...</p>
      ) : (
        <>
          <div className="mb-6 p-4 border rounded-lg bg-white shadow">
            <p><b>Адрес:</b> {address}</p>
            <p><b>Ник:</b> {nickname || "—"}</p>
            <p><b>Баланс на контракте:</b> {balance} WEI</p>

            {/* Смена ника */}
            <div className="mt-4 flex gap-2">
              <input
                type="text"
                placeholder="Новый ник"
                value={newNickname}
                onChange={(e) => setNewNickname(e.target.value)}
                className="border px-3 py-1 rounded w-full"
              />
              <button
                onClick={changeNickname}
                disabled={loading || !newNickname.trim()}
                className="bg-indigo-600 text-white px-4 py-1 rounded disabled:opacity-50"
              >
                {loading ? "..." : "Сменить"}
              </button>
            </div>

            {/* Вывод средств */}
            <div className="mt-4 flex gap-2">
              <input
                type="text"
                placeholder="Сумма для вывода (WEI)"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                className="border px-3 py-1 rounded w-full"
              />
              <button
                onClick={withdrawBalance}
                disabled={loading || !withdrawAmount}
                className="bg-green-600 text-white px-4 py-1 rounded disabled:opacity-50"
              >
                Вывести
              </button>
            </div>
          </div>

          <h2 className="text-2xl font-semibold mb-3">Ваши донат-пулы</h2>

          {createdPools.length === 0 ? (
            <p className="text-gray-500">Вы еще не создавали донат-пулы.</p>
          ) : (
            createdPools.map((p, i) => (
              <div key={i} className="border rounded-lg p-4 mb-4 bg-white shadow">
                <p className="text-xl font-semibold">{p[2]}</p>
                <p><b>ID:</b> {Number(p[1])}</p>
                <p><b>Цель:</b> {ethers.formatEther(p[3])} WEI</p>
                <p><b>Собрано:</b> {ethers.formatEther(p[4])} WEI</p>
                <p><b>Донатов:</b> {p[6]}</p>
                <p>
                  <b>Статус:</b>{" "}
                  {p[5] ? (
                    <span className="text-green-600">Активен</span>
                  ) : (
                    <span className="text-red-600">Отключён</span>
                  )}
                </p>

                <button
                  onClick={() => window.location.href = `profile/pool/${Number(p[1])}`}
                  className="mt-2 bg-indigo-600 text-white px-3 py-1 rounded"
                >
                  Подробнее
                </button>
              </div>
            ))
          )}

          <button
            onClick={() => (window.location.href = "/")}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Назад
          </button>
        </>
      )}
    </main>
  );
}
