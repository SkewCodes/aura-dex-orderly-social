import { ReactNode, useEffect, useState } from 'react';
import { WalletConnectorProvider } from '@orderly.network/wallet-connector';
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import type { NetworkId } from "@orderly.network/types";
import { initOnBoard } from './config';

interface WalletConnectorProps {
  children: ReactNode;
  networkId: NetworkId;
}

const WalletConnector = ({ children, networkId }: WalletConnectorProps) => {
  const [initWallet, setInitWallet] = useState(false);

  useEffect(() => {
    initOnBoard().then(() => {
      setInitWallet(true);
    });
  }, []);

  if (!initWallet) {
    return null;
  }
  return (
    <WalletConnectorProvider
      solanaInitial={{
        network: networkId === 'mainnet' ? WalletAdapterNetwork.Mainnet : WalletAdapterNetwork.Devnet
      }}
      evmInitial={{
        skipInit: true
      }}
    >
      {children}
    </WalletConnectorProvider>
  );
};

export default WalletConnector; 