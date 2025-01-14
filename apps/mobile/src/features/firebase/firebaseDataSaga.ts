import firebase from '@react-native-firebase/app'
import firestore from '@react-native-firebase/firestore'
import { appSelect } from 'src/app/hooks'
import {
  getFirebaseUidOrError,
  getFirestoreMetadataRef,
  getFirestoreUidRef,
} from 'src/features/firebase/utils'
import { getOneSignalUserIdOrError } from 'src/features/notifications/Onesignal'
import { getKeys } from 'src/utils/objects'
import { call, put, select, takeEvery } from 'typed-redux-saga'
import { selectTestnetsAreEnabled } from 'wallet/src/features/chains/slice'
import { logger } from 'wallet/src/features/logger/logger'
import {
  EditAccountAction,
  editAccountActions,
  TogglePushNotificationParams,
} from 'wallet/src/features/wallet/accounts/editAccountSaga'
import { Account, AccountType } from 'wallet/src/features/wallet/accounts/types'
import {
  makeSelectAccountNotificationSetting,
  selectAccounts,
} from 'wallet/src/features/wallet/selectors'
import { editAccount } from 'wallet/src/features/wallet/slice'
import serializeError from 'wallet/src/utils/serializeError'

interface AccountMetadata {
  name?: string
  type?: AccountType
  avatar?: string
  testnetsEnabled?: boolean
}

// Can't merge with `editAccountSaga` because it can't handle simultaneous actions
export function* firebaseDataWatcher() {
  yield* takeEvery(editAccountActions.trigger, editAccountDataInFirebase)
}

function* editAccountDataInFirebase(actionData: ReturnType<typeof editAccountActions.trigger>) {
  const { payload } = actionData
  const { type, address } = payload

  switch (type) {
    case EditAccountAction.Remove:
      yield* call(removeAccountFromFirebase, address, payload.notificationsEnabled)
      break
    case EditAccountAction.Rename:
      yield* call(renameAccountInFirebase, address, payload.newName)
      break
    case EditAccountAction.TogglePushNotification:
      yield* call(toggleFirebaseNotificationSettings, payload)
      break
    case EditAccountAction.ToggleTestnetSettings:
      yield* call(updateFirebaseMetadata, address, { testnetsEnabled: payload.enabled })
      break
    default:
      break
  }
}

function* addAccountToFirebase(account: Account) {
  const { name, type, address } = account
  const testnetsEnabled = yield* select(selectTestnetsAreEnabled)

  try {
    yield* call(mapFirebaseUidToAddresses, [address])
    yield* call(updateFirebaseMetadata, address, { type, name, testnetsEnabled })
  } catch (error) {
    logger.error('Unable to add account to Firebase', {
      tags: {
        file: 'firebaseDataSaga',
        function: 'addAccountToFirebase',
        error: serializeError(error),
      },
    })
  }
}

export function* removeAccountFromFirebase(address: Address, notificationsEnabled: boolean) {
  try {
    if (!notificationsEnabled) return
    yield* call(deleteFirebaseMetadata, address)
    yield* call(disassociateFirebaseUidFromAddresses, [address])
  } catch (error) {
    logger.error('Unable to remove account from Firebase', {
      tags: {
        file: 'firebaseDataSaga',
        function: 'removeAccountFromFirebase',
        error: serializeError(error),
      },
    })
  }
}

export function* renameAccountInFirebase(address: Address, newName: string) {
  try {
    const notificationsEnabled = yield* appSelect(makeSelectAccountNotificationSetting(address))
    if (!notificationsEnabled) return
    yield* call(updateFirebaseMetadata, address, { name: newName })
  } catch (error) {
    logger.error('Unable to rename account in Firebase', {
      tags: {
        file: 'firebaseDataSaga',
        function: 'renameAccountInFirebase',
        error: serializeError(error),
      },
    })
  }
}

export function* toggleFirebaseNotificationSettings({
  address,
  enabled,
}: TogglePushNotificationParams) {
  try {
    const accounts = yield* appSelect(selectAccounts)
    const account = accounts[address]
    if (!account) throw new Error(`Account not found for address ${address}`)

    if (enabled) {
      yield* call(addAccountToFirebase, account)
    } else {
      yield* call(removeAccountFromFirebase, address, true)
    }

    yield* put(
      editAccount({
        address,
        updatedAccount: {
          ...account,
          pushNotificationsEnabled: enabled,
        },
      })
    )
  } catch (error) {
    logger.error('Unable to toggle notification settings in Firebase', {
      tags: {
        file: 'firebaseDataSaga',
        function: 'toggleFirebaseNotificationSettings',
        error: serializeError(error),
      },
    })
  }
}

async function mapFirebaseUidToAddresses(addresses: Address[]): Promise<void> {
  const firebaseApp = firebase.app()
  const uid = getFirebaseUidOrError(firebaseApp)
  const batch = firestore(firebaseApp).batch()
  addresses.forEach((address: string) => {
    const uidRef = getFirestoreUidRef(firebaseApp, address)
    batch.set(uidRef, { [uid]: true }, { merge: true })
  })

  await batch.commit()
}

async function disassociateFirebaseUidFromAddresses(addresses: Address[]): Promise<void> {
  const firebaseApp = firebase.app()
  const uid = getFirebaseUidOrError(firebaseApp)
  const batch = firestore(firebaseApp).batch()
  addresses.forEach((address: string) => {
    const uidRef = getFirestoreUidRef(firebaseApp, address)
    batch.update(uidRef, { [uid]: firebase.firestore.FieldValue.delete() })
  })

  await batch.commit()
}

async function updateFirebaseMetadata(address: Address, metadata: AccountMetadata): Promise<void> {
  try {
    const firebaseApp = firebase.app()
    const pushId = await getOneSignalUserIdOrError()
    const metadataRef = getFirestoreMetadataRef(firebaseApp, address, pushId)

    // Firestore does not support updating properties with an `undefined` value so must strip them out
    const metadataWithDefinedPropsOnly = getKeys(metadata).reduce(
      (obj: Record<string, unknown>, prop) => {
        const value = metadata[prop]
        if (value !== undefined) obj[prop] = value
        return obj
      },
      {}
    )

    await metadataRef.set(metadataWithDefinedPropsOnly, { merge: true })
  } catch (error) {
    logger.error('Unable to update Firebase metadata', {
      tags: {
        file: 'firebaseDataSaga',
        function: 'updateFirebaseMetadata',
        error: serializeError(error),
      },
    })
  }
}

async function deleteFirebaseMetadata(address: Address): Promise<void> {
  const firebaseApp = firebase.app()
  const pushId = await getOneSignalUserIdOrError()
  const metadataRef = getFirestoreMetadataRef(firebaseApp, address, pushId)
  await metadataRef.delete()
}
