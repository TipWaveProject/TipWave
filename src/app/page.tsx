"use client";

import { useEffect, useState } from "react";
import { connectWallet, restoreSession, logout } from "@/lib/connectWallet";

export default function Home() {
  const [address, setAddress] = useState<string>("");

  useEffect(() => {
    restoreSession().then((res) => {
      if (res) setAddress(res.address);
    });
  }, []);

  const connect = async () => {
    const { address } = await connectWallet();
    setAddress(address);
  };

  const exit = () => {
    logout();
    setAddress("");
  };

  return (
    <main className="p-6">
      {!address ? (
        <button onClick={connect} className="bg-blue-600 text-white px-4 py-2 rounded">
          Подключить MetaMask
        </button>
      ) : (
        <>
          <p className="mb-2">Мой адрес: {address}</p>

          <button
            onClick={() => (window.location.href = "/profile")}
            className="bg-purple-600 text-white px-4 py-2 rounded mr-3"
          >
            Мой профиль
          </button>

          <button
            onClick={exit}
            className="bg-red-600 text-white px-4 py-2 rounded"
          >
            Выйти
          </button>
        </>
      )}
    </main>
  );
}