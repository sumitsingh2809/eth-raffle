import { Abi, Address } from 'viem';
import * as ABI from './abi.json';
import * as contractAddresses from './contractAddresses.json';

const constants = {
  ABI: ABI as Abi,
  contractAddresses: contractAddresses as Record<string, Address[]>,
};

export default constants;
