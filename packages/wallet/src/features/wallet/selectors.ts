import { createSelector, Selector } from '@reduxjs/toolkit'
import { TokenSortableField } from 'wallet/src/data/__generated__/types-and-hooks'
import {
  Account,
  AccountType,
  SignerMnemonicAccount,
} from 'wallet/src/features/wallet/accounts/types'
import { TokensOrderBy } from 'wallet/src/features/wallet/types'
import type { RootState } from 'wallet/src/state'

const DEFAULT_TOKENS_ORDER_BY = TokenSortableField.Volume

export const selectAccounts = (state: RootState): Record<string, Account> => state.wallet.accounts

// Sorted by signer accounts, then view-only accounts
export const selectAllAccountsSorted = createSelector(selectAccounts, (accountsMap) => {
  const accounts = Object.values(accountsMap)
  const _mnemonicWallets = accounts
    .filter((a): a is SignerMnemonicAccount => a.type === AccountType.SignerMnemonic)
    .sort((a, b) => {
      return a.derivationIndex - b.derivationIndex
    })
  const _viewOnlyWallets = accounts
    .filter((a) => a.type === AccountType.Readonly)
    .sort((a, b) => {
      return a.timeImportedMs - b.timeImportedMs
    })
  return [..._mnemonicWallets, ..._viewOnlyWallets]
})

export const selectNonPendingAccounts = createSelector(selectAccounts, (accounts) =>
  Object.fromEntries(Object.entries(accounts).filter((a) => !a[1].pending))
)

export const selectPendingAccounts = createSelector(selectAccounts, (accounts) =>
  Object.fromEntries(Object.entries(accounts).filter((a) => a[1].pending))
)

export const selectSignerAccounts = createSelector(selectAccounts, (accounts) =>
  Object.values(accounts).filter((a) => a.type !== AccountType.Readonly)
)

export const selectNonPendingSignerAccounts = createSelector(selectAccounts, (accounts) =>
  Object.values(accounts).filter((a) => a.type !== AccountType.Readonly && !a.pending)
)

export const selectViewOnlyAccounts = createSelector(selectAccounts, (accounts) =>
  Object.values(accounts).filter((a) => a.type === AccountType.Readonly && !a.pending)
)

export const selectSortedSignerMnemonicAccounts = createSelector(selectAccounts, (accounts) =>
  Object.values(accounts)
    .filter((account) => account.type === AccountType.SignerMnemonic)
    .sort(
      (a, b) =>
        (a as SignerMnemonicAccount).derivationIndex - (b as SignerMnemonicAccount).derivationIndex
    )
    .map((account) => account as SignerMnemonicAccount)
)

export const selectSignerMnemonicAccountExists = createSelector(
  selectNonPendingAccounts,
  (accounts) =>
    Object.values(accounts).findIndex((value) => value.type === AccountType.SignerMnemonic) >= 0
)

export const selectActiveAccountAddress = (state: RootState): string | null =>
  state.wallet.activeAccountAddress
export const selectActiveAccount = createSelector(
  selectAccounts,
  selectActiveAccountAddress,
  (accounts, activeAccountAddress) =>
    (activeAccountAddress ? accounts[activeAccountAddress] : null) ?? null
)

export const selectUserPalette = createSelector(
  selectActiveAccount,
  (activeAccount) => activeAccount?.customizations?.palette
)

export const selectFinishedOnboarding = (state: RootState): boolean | undefined =>
  state.wallet.finishedOnboarding

export const selectTokensOrderBy = (state: RootState): TokensOrderBy =>
  state.wallet.settings.tokensOrderBy ?? DEFAULT_TOKENS_ORDER_BY

export const selectInactiveAccounts = createSelector(
  selectActiveAccountAddress,
  selectAccounts,
  (activeAddress, accounts) =>
    Object.values(accounts).filter((account) => account.address !== activeAddress)
)

export const makeSelectAccountNotificationSetting = (
  address: Address
): Selector<RootState, boolean> =>
  createSelector(selectAccounts, (accounts) => !!accounts[address]?.pushNotificationsEnabled)

export const makeSelectAccountHideSmallBalances = (
  address: Address
): Selector<RootState, boolean> =>
  createSelector(selectAccounts, (accounts) => accounts?.[address]?.showSmallBalances ?? true)

export const makeSelectAccountHideSpamTokens = (address: Address): Selector<RootState, boolean> =>
  createSelector(selectAccounts, (accounts) => accounts?.[address]?.showSpamTokens ?? true)
