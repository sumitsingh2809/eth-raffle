'use client';

import LotteryEntrance from '@/component/lotteryEntrance';
import ManualHeader from '@/component/manualHeader';
import styles from './page.module.css';

export default function Home() {
  return (
    <div className={styles.page}>
      Decentralized Raffle
      <ManualHeader />
      <LotteryEntrance />
    </div>
  );
}
