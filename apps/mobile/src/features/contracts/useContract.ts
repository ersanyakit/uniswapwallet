// Based partly on https://github.com/Uniswap/interface/blob/main/src/hooks/useContract.ts

import { Contract, ContractInterface } from 'ethers'
import { useMemo } from 'react'
import ERC20_ABI from 'wallet/src/abis/erc20.json'
import { Erc20 } from 'wallet/src/abis/types'
import { ChainId } from 'wallet/src/constants/chains'
import { logger } from 'wallet/src/features/logger/logger'
import { useContractManager, useProviderManager } from 'wallet/src/features/wallet/context'
import serializeError from 'wallet/src/utils/serializeError'

export function useContract<T extends Contract = Contract>(
  chainId: ChainId,
  addressOrAddressMap: string | { [chainId: number]: string } | undefined,
  ABI: ContractInterface
): T | null {
  const providerManager = useProviderManager()
  const provider = providerManager.tryGetProvider(chainId)
  const contractsManager = useContractManager()

  return useMemo(() => {
    if (!addressOrAddressMap || !ABI || !provider || !chainId) return null
    let address: Address | undefined
    if (typeof addressOrAddressMap === 'string') address = addressOrAddressMap
    else address = addressOrAddressMap[chainId]
    if (!address) return null
    try {
      return contractsManager.getOrCreateContract(chainId, address, provider, ABI)
    } catch (error) {
      logger.error('Failed to get contract', {
        tags: {
          file: 'useContract',
          function: 'useContract',
          error: serializeError(error),
        },
      })
      return null
    }
  }, [chainId, addressOrAddressMap, ABI, provider, contractsManager]) as T
}

export function useTokenContract(chainId: ChainId, tokenAddress?: Address): Erc20 | null {
  return useContract<Erc20>(chainId, tokenAddress, ERC20_ABI)
}
