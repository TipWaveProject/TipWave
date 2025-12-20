import abi from "./contractABI.json";

export const getContract = (providerOrSigner: any) => {
  return new ethers.Contract(CONTRACT_ADDRESS, abi, providerOrSigner);
};

import { ethers } from "ethers";


export const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

// export const CONTRACT_ABI = [
//   "function addDonationPool(string _name, uint256 _goalInWei) external",
//   "function donate(uint256 _poolId, string _message) external payable",
//   "function withdraw(uint256 _amountInWei) external",
//   "function getPoolsCount() external view returns (uint256)",
//   "function getPool(uint256 _poolId) external view returns (address,uint256,string,uint256,uint256,bool,uint256,(address,string,string,uint256,uint256)[])",
//   "function getUser(address _user) external view returns (string,uint256[],uint256)"
// ];

