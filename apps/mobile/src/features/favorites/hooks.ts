import { useCallback } from 'react'
import { useAppDispatch, useAppSelector } from 'src/app/hooks'
import { selectWatchedAddressSet } from 'src/features/favorites/selectors'
import {
  addFavoriteToken,
  addWatchedAddress,
  removeFavoriteToken,
  removeWatchedAddress,
} from 'src/features/favorites/slice'
import { sendAnalyticsEvent } from 'src/features/telemetry'
import { MobileEventName } from 'src/features/telemetry/constants'
import { useCurrencyInfo } from 'wallet/src/features/tokens/useCurrencyInfo'
import { useDisplayName } from 'wallet/src/features/wallet/hooks'
import { CurrencyId, currencyIdToAddress, currencyIdToChain } from 'wallet/src/utils/currencyId'

export function useToggleFavoriteCallback(id: CurrencyId, isFavoriteToken: boolean): () => void {
  const dispatch = useAppDispatch()
  const token = useCurrencyInfo(id)

  return useCallback(() => {
    if (isFavoriteToken) {
      dispatch(removeFavoriteToken({ currencyId: id }))
    } else {
      sendAnalyticsEvent(MobileEventName.FavoriteItem, {
        address: currencyIdToAddress(id),
        chain: currencyIdToChain(id) as number,
        type: 'token',
        name: token?.currency.name,
      })
      dispatch(addFavoriteToken({ currencyId: id }))
    }
  }, [dispatch, id, isFavoriteToken, token])
}

export function useToggleWatchedWalletCallback(address: Address): () => void {
  const dispatch = useAppDispatch()
  const isFavoriteWallet = useAppSelector(selectWatchedAddressSet).has(address)
  const displayName = useDisplayName(address)

  return useCallback(() => {
    if (isFavoriteWallet) {
      dispatch(removeWatchedAddress({ address }))
    } else {
      sendAnalyticsEvent(MobileEventName.FavoriteItem, {
        address,
        type: 'wallet',
        name: displayName?.name,
      })
      dispatch(addWatchedAddress({ address }))
    }
  }, [address, dispatch, isFavoriteWallet, displayName])
}
