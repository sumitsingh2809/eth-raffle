'use client';

import { useWeb3Modal } from '@web3modal/wagmi/react';
import { useEffect, useState } from 'react';
import { useAccount, useDisconnect } from 'wagmi';

export default function ManualHeader() {
  const account = useAccount();
  const { open } = useWeb3Modal();
  const { disconnect } = useDisconnect();
  const [isConnected, setIsConnected] = useState<boolean>(false);

  // useAccountEffect({
  //   onConnect(data) {
  //     console.log('Connected!', data);
  //   },
  //   onDisconnect() {
  //     console.log('Disconnected!');
  //   },
  // });

  // watchAccount(config, {
  //   onChange(data) {
  //     console.log('Account changed!', data);
  //   },
  // });

  useEffect(() => {
    setIsConnected(account.isConnected);
  }, [account.isConnected]);

  return (
    <div>
      {isConnected ? (
        <div>
          Connected to {account.address?.slice(0, 6)}...{account.address?.slice(account.address.length - 4)} <br />
          <button onClick={() => disconnect()}>Disconnect</button>
        </div>
      ) : (
        <button onClick={() => open()}>Connect</button>
      )}
    </div>
  );
}
