'use client';

import LotteryEntrance from '@/component/lotteryEntrance';
import ManualHeader from '@/component/manualHeader';

export default function Home() {
  return (
    <div>
      Decentralized Raffle
      <ManualHeader />
      <LotteryEntrance />
    </div>
  );
}
