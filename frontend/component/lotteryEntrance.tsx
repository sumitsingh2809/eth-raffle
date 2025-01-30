'use client';

import constants from '@/constants';
import { config } from '@/lib/config';
import { useEffect, useState } from 'react';
import { Abi, Address, formatEther } from 'viem';
import { useAccount } from 'wagmi';
import { readContract } from 'wagmi/actions';
import styles from '../app/page.module.css';
const { contractAddresses } = constants;

export default function LotteryEntrance() {
  const account = useAccount();
  const [abi, setAbi] = useState<Abi | null>(null);
  const [raffleAddress, setRaffleAddress] = useState<Address | null>(null);
  const [entranceFee, setEntranceFee] = useState<bigint>(BigInt(0));

  useEffect(() => {
    import('../constants/abi.json').then((module) => setAbi(module.default as Abi));
  }, []);

  useEffect(() => {
    if (account.chain && account.isConnected) {
      if (contractAddresses[account.chain.id.toString()]) {
        setRaffleAddress(contractAddresses[account.chain.id.toString()][0]);
      }
    }
  }, [account.chain, account.isConnected]);

  useEffect(() => {
    if (abi && account.isConnected && raffleAddress) {
      const getEntranceFee = async () => {
        const result = await readContract(config, {
          abi: abi,
          address: raffleAddress,
          functionName: 'getEntranceFee',
        });
        setEntranceFee(result as bigint);

        // writeContract(config, {
        //   abi,
        //   address: contractAddresses[chain.id.toString()][0],
        //   functionName: 'enterRaffle',
        //   value: entranceFee
        // });
      };
      getEntranceFee();
    }
  }, [abi, account.isConnected, raffleAddress]);

  return <div className={styles.page}>Lottery Entrance Fee: {formatEther(entranceFee)} ETH</div>;
}
