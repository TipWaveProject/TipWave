import { NextResponse } from "next/server";
import { ethers } from "ethers";
import ABI from "@/lib/contractABI.json";
import { CONTRACT_ADDRESS } from "@/lib/contract";

let lastProcessedBlock = 0;

export async function GET() {
  try {
    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

    const contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      ABI,
      provider
    );

    const currentBlock = await provider.getBlockNumber();

    // первый запуск — ничего не отдаём
    if (lastProcessedBlock === 0) {
      lastProcessedBlock = currentBlock;
      return NextResponse.json([]);
    }

    const events = await contract.queryFilter(
      contract.filters.Donated(),
      lastProcessedBlock + 1,
      currentBlock
    );

    lastProcessedBlock = currentBlock;

    const donations = events.map((e: any) => ({
      poolId: Number(e.args.poolId),
      donor: e.args.donor,
      nickname: e.args.nickname || "Аноним",
      message: e.args.message || "",
      amount: ethers.formatEther(e.args.amountInWei), // ← КЛЮЧЕВО
    }));

    return NextResponse.json(donations);
  } catch (err) {
    console.error("API error:", err);
    return NextResponse.json(
      { error: "Ошибка при получении донатов" },
      { status: 500 }
    );
  }
}