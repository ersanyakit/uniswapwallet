import { URL } from 'react-native-url-polyfill'
import { expectSaga } from 'redux-saga-test-plan'
import { call } from 'redux-saga/effects'
import {
  handleSwapLink,
  parseAndValidateSwapParams,
} from 'src/features/deepLinking/handleSwapLinkSaga'
import { openModal } from 'src/features/modals/modalSlice'
import { ModalName } from 'src/features/telemetry/constants'
import {
  CurrencyField,
  TransactionState,
} from 'src/features/transactions/transactionState/transactionState'
import { account } from 'src/test/fixtures'
import { ChainId } from 'wallet/src/constants/chains'
import { DAI, UNI } from 'wallet/src/constants/tokens'
import { AssetType } from 'wallet/src/entities/assets'
import { selectActiveChainIds } from 'wallet/src/features/chains/saga'

const formSwapUrl = (
  userAddress?: Address,
  chain?: ChainId | number,
  inputAddress?: string,
  outputAddress?: string,
  currencyField?: string,
  amount?: string
): URL =>
  new URL(
    `https://uniswap.org/app?screen=swap
&userAddress=${userAddress}
&inputCurrencyId=${chain}-${inputAddress}
&outputCurrencyId=${chain}-${outputAddress}
&currencyField=${currencyField}
&amount=${amount}`.trim()
  )

const formTransactionState = (
  chain?: ChainId,
  inputAddress?: string,
  outputAddress?: string,
  currencyField?: string,
  amount?: string
): {
  input: {
    address: string | undefined
    chainId: ChainId | undefined
    type: AssetType
  }
  output: {
    address: string | undefined
    chainId: ChainId | undefined
    type: AssetType
  }
  exactCurrencyField: string | undefined
  exactAmountToken: string | undefined
} => ({
  [CurrencyField.INPUT]: {
    address: inputAddress,
    chainId: chain,
    type: AssetType.Currency,
  },
  [CurrencyField.OUTPUT]: {
    address: outputAddress,
    chainId: chain,
    type: AssetType.Currency,
  },
  exactCurrencyField: !currencyField
    ? currencyField
    : currencyField.toLowerCase() === 'output'
    ? CurrencyField.OUTPUT
    : CurrencyField.INPUT,
  exactAmountToken: amount,
})

const swapUrl = formSwapUrl(
  account.address,
  ChainId.Mainnet,
  DAI.address,
  UNI[ChainId.Mainnet].address,
  'input',
  '100'
)

const invalidOutputCurrencySwapUrl = formSwapUrl(
  account.address,
  ChainId.Mainnet,
  DAI.address,
  undefined,
  'input',
  '100'
)

const invalidInputTokenSwapURl = formSwapUrl(
  account.address,
  ChainId.Mainnet,
  '0x00',
  UNI[ChainId.Mainnet].address,
  'input',
  '100'
)

const invalidChainSwapUrl = formSwapUrl(
  account.address,
  23,
  DAI.address,
  UNI[ChainId.Mainnet].address,
  'input',
  '100'
)

const invalidAmountSwapUrl = formSwapUrl(
  account.address,
  ChainId.Mainnet,
  DAI.address,
  UNI[ChainId.Mainnet].address,
  'input',
  'not a number'
)

const invalidCurrencyFieldSwapUrl = formSwapUrl(
  account.address,
  ChainId.Mainnet,
  DAI.address,
  UNI[ChainId.Mainnet].address,
  'token1',
  '100'
)

const swapFormState = formTransactionState(
  ChainId.Mainnet,
  DAI.address,
  UNI[ChainId.Mainnet].address,
  'input',
  '100'
) as TransactionState

describe(handleSwapLink, () => {
  it('Navigates to the swap screen with all params if all inputs are valid', () => {
    return expectSaga(handleSwapLink, swapUrl)
      .provide([[call(selectActiveChainIds), [1]]])
      .call(parseAndValidateSwapParams, swapUrl)
      .put(openModal({ name: ModalName.Swap, initialState: swapFormState }))
      .silentRun()
  })

  it('Navigates to an empty swap screen if outputCurrency is invalid', () => {
    return expectSaga(handleSwapLink, invalidOutputCurrencySwapUrl)
      .provide([[call(selectActiveChainIds), [1]]])
      .call(parseAndValidateSwapParams, invalidOutputCurrencySwapUrl)
      .put(openModal({ name: ModalName.Swap }))
      .silentRun()
  })

  it('Navigates to an empty swap screen if inputToken is invalid', () => {
    return expectSaga(handleSwapLink, invalidInputTokenSwapURl)
      .provide([[call(selectActiveChainIds), [1]]])
      .call(parseAndValidateSwapParams, invalidInputTokenSwapURl)
      .put(openModal({ name: ModalName.Swap }))
      .silentRun()
  })

  it('Navigates to an empty swap screen if the chain is not supported', () => {
    return expectSaga(handleSwapLink, invalidChainSwapUrl)
      .call(parseAndValidateSwapParams, invalidChainSwapUrl)
      .put(openModal({ name: ModalName.Swap }))
      .silentRun()
  })

  it('Navigates to an empty swap screen if the swap amount is invalid', () => {
    return expectSaga(handleSwapLink, invalidAmountSwapUrl)
      .provide([[call(selectActiveChainIds), [1]]])
      .call(parseAndValidateSwapParams, invalidAmountSwapUrl)
      .put(openModal({ name: ModalName.Swap }))
      .silentRun()
  })

  it('Navigates to an empty swap screen if currency field is invalid', () => {
    return expectSaga(handleSwapLink, invalidCurrencyFieldSwapUrl)
      .provide([[call(selectActiveChainIds), [1]]])
      .call(parseAndValidateSwapParams, invalidCurrencyFieldSwapUrl)
      .put(openModal({ name: ModalName.Swap }))
      .silentRun()
  })
})
