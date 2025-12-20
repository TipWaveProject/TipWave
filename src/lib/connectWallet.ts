import { ethers } from "ethers";

export const connectWallet = async () => {
  if (!window.ethereum) throw new Error("MetaMask not found");

  const provider = new ethers.BrowserProvider(window.ethereum);

  await provider.send("eth_requestAccounts", []);

  const signer = await provider.getSigner();
  const address = await signer.getAddress();

  localStorage.setItem("tw_address", address);

  return { provider, signer, address };
};

export const restoreSession = async () => {
  const saved = localStorage.getItem("tw_address");
  if (!saved || !window.ethereum) return null;

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const address = await signer.getAddress();

  if (address.toLowerCase() !== saved.toLowerCase()) return null;

  return { provider, signer, address };
};

export const logout = () => {
  localStorage.removeItem("tw_address");
};