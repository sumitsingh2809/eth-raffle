import { defaultWagmiConfig } from '@web3modal/wagmi/react/config';
import { hardhat, sepolia } from 'wagmi/chains';

export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID;

console.log({ projectId });
if (!projectId) throw new Error('Project ID is not defined');

const metadata = {
  name: 'Web3Modal Example',
  description: 'Web3Modal Example',
  url: 'https://web3modal.com',
  icons: ['https://avatars.githubusercontent.com/u/37784886'],
};

export const config = defaultWagmiConfig({
  chains: [hardhat, sepolia],
  projectId,
  metadata,
  ssr: true,
  //   storage: createStorage({
  //     storage: cookieStorage,
  //   }),
});
