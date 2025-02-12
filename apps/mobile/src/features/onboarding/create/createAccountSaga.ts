import dayjs from 'dayjs'
import { appSelect } from 'src/app/hooks'
import { call, put } from 'typed-redux-saga'
import { logger } from 'wallet/src/features/logger/logger'
import {
  AccountType,
  BackupType,
  SignerMnemonicAccount,
} from 'wallet/src/features/wallet/accounts/types'
import { Keyring } from 'wallet/src/features/wallet/Keyring/Keyring'
import { selectSortedSignerMnemonicAccounts } from 'wallet/src/features/wallet/selectors'
import { activateAccount, addAccount } from 'wallet/src/features/wallet/slice'
import { createMonitoredSaga } from 'wallet/src/utils/saga'

export function* createAccount() {
  const sortedMnemonicAccounts: SignerMnemonicAccount[] = yield* appSelect(
    selectSortedSignerMnemonicAccounts
  )
  const { nextDerivationIndex, mnemonicId, existingBackups } = yield* call(
    getNewAccountParams,
    sortedMnemonicAccounts
  )
  const address = yield* call(Keyring.generateAndStorePrivateKey, mnemonicId, nextDerivationIndex)

  yield* put(
    addAccount({
      type: AccountType.SignerMnemonic,
      address,
      pending: true,
      timeImportedMs: dayjs().valueOf(),
      derivationIndex: nextDerivationIndex,
      mnemonicId,
      backups: existingBackups,
    })
  )
  yield* put(activateAccount(address))
  logger.debug('createAccountSaga', '', 'New account created:', address)
}

async function getNewAccountParams(sortedAccounts: SignerMnemonicAccount[]): Promise<{
  nextDerivationIndex: number
  mnemonicId: string
  existingBackups?: BackupType[]
}> {
  if (sortedAccounts.length === 0 || !sortedAccounts[0]) {
    const mnemonicId = await Keyring.generateAndStoreMnemonic()
    return { nextDerivationIndex: 0, mnemonicId }
  }
  return {
    nextDerivationIndex: getNextDerivationIndex(sortedAccounts),
    mnemonicId: sortedAccounts[0].mnemonicId,
    existingBackups: sortedAccounts[0].backups,
  }
}

function getNextDerivationIndex(sortedAccounts: SignerMnemonicAccount[]): number {
  // if there is a missing index in the series (0, 1, _, 3), return this missing index
  let nextIndex = 0
  for (const account of sortedAccounts) {
    if (account.derivationIndex !== nextIndex) {
      return Math.min(account.derivationIndex, nextIndex)
    }
    nextIndex += 1
  }
  // if all exist, nextDerivation = sortedMnemonicAccounts.length + 1
  return nextIndex
}

export const {
  name: createAccountSagaName,
  wrappedSaga: createAccountSaga,
  reducer: createAccountReducer,
  actions: createAccountActions,
} = createMonitoredSaga(createAccount, 'createAccount')
