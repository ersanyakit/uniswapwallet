import { SwapOptions, SwapRouter } from '@uniswap/router-sdk'
import { Currency, Percent, TradeType } from '@uniswap/sdk-core'
import {
  SwapOptions as UniversalRouterSwapOptions,
  SwapRouter as UniversalSwapRouter,
} from '@uniswap/universal-router-sdk'
import { BigNumber } from 'ethers'
import { TFunction } from 'i18next'
import { ElementName } from 'src/features/telemetry/constants'
import { PermitOptions } from 'src/features/transactions/permit/usePermitSignature'
import { PermitSignatureInfo } from 'src/features/transactions/swap/usePermit2Signature'
import { Trade } from 'src/features/transactions/swap/useTrade'
import { WrapType } from 'src/features/transactions/swap/wrapSaga'
import {
  CurrencyField,
  TransactionState,
} from 'src/features/transactions/transactionState/transactionState'
import { ChainId } from 'wallet/src/constants/chains'
import { AssetType } from 'wallet/src/entities/assets'
import {
  ExactInputSwapTransactionInfo,
  ExactOutputSwapTransactionInfo,
  TransactionType,
} from 'wallet/src/features/transactions/types'
import { areAddressesEqual } from 'wallet/src/utils/addresses'
import {
  areCurrencyIdsEqual,
  buildWrappedNativeCurrencyId,
  CurrencyId,
  currencyId,
  currencyIdToAddress,
  currencyIdToChain,
} from 'wallet/src/utils/currencyId'
import { formatPrice, NumberType } from 'wallet/src/utils/format'

export function serializeQueryParams(
  params: Record<string, Parameters<typeof encodeURIComponent>[0]>
): string {
  const queryString = []
  for (const [param, value] of Object.entries(params)) {
    queryString.push(`${encodeURIComponent(param)}=${encodeURIComponent(value)}`)
  }
  return queryString.join('&')
}

export function getWrapType(
  inputCurrency: Currency | null | undefined,
  outputCurrency: Currency | null | undefined
): WrapType {
  if (!inputCurrency || !outputCurrency || inputCurrency.chainId !== outputCurrency.chainId) {
    return WrapType.NotApplicable
  }

  const inputChainId = inputCurrency.chainId as ChainId
  const wrappedCurrencyId = buildWrappedNativeCurrencyId(inputChainId)

  if (
    inputCurrency.isNative &&
    areCurrencyIdsEqual(currencyId(outputCurrency), wrappedCurrencyId)
  ) {
    return WrapType.Wrap
  } else if (
    outputCurrency.isNative &&
    areCurrencyIdsEqual(currencyId(inputCurrency), wrappedCurrencyId)
  ) {
    return WrapType.Unwrap
  }

  return WrapType.NotApplicable
}

export function isWrapAction(wrapType: WrapType): wrapType is WrapType.Unwrap | WrapType.Wrap {
  return wrapType === WrapType.Unwrap || wrapType === WrapType.Wrap
}

export function tradeToTransactionInfo(
  trade: Trade
): ExactInputSwapTransactionInfo | ExactOutputSwapTransactionInfo {
  const slippageTolerancePercent = slippageToleranceToPercent(trade.slippageTolerance)
  const { quote, slippageTolerance } = trade
  const { gasUseEstimate, quoteId, routeString } = quote || {}

  const baseTransactionInfo = {
    inputCurrencyId: currencyId(trade.inputAmount.currency),
    outputCurrencyId: currencyId(trade.outputAmount.currency),
    slippageTolerance,
    quoteId,
    gasUseEstimate,
    routeString,
  }

  return trade.tradeType === TradeType.EXACT_INPUT
    ? {
        ...baseTransactionInfo,
        type: TransactionType.Swap,
        tradeType: TradeType.EXACT_INPUT,
        inputCurrencyAmountRaw: trade.inputAmount.quotient.toString(),
        expectedOutputCurrencyAmountRaw: trade.outputAmount.quotient.toString(),
        minimumOutputCurrencyAmountRaw: trade
          .minimumAmountOut(slippageTolerancePercent)
          .quotient.toString(),
      }
    : {
        ...baseTransactionInfo,
        type: TransactionType.Swap,
        tradeType: TradeType.EXACT_OUTPUT,
        outputCurrencyAmountRaw: trade.outputAmount.quotient.toString(),
        expectedInputCurrencyAmountRaw: trade.inputAmount.quotient.toString(),
        maximumInputCurrencyAmountRaw: trade
          .maximumAmountIn(slippageTolerancePercent)
          .quotient.toString(),
      }
}

export function requireAcceptNewTrade(oldTrade: Maybe<Trade>, newTrade: Maybe<Trade>): boolean {
  return oldTrade?.quote?.methodParameters?.calldata !== newTrade?.quote?.methodParameters?.calldata
}

export const getRateToDisplay = (trade: Trade, showInverseRate: boolean): string => {
  const price = showInverseRate ? trade.executionPrice.invert() : trade.executionPrice
  const formattedPrice = formatPrice(price, NumberType.SwapPrice)
  const { quoteCurrency, baseCurrency } = trade.executionPrice
  const rate = `1 ${quoteCurrency.symbol} = ${formattedPrice} ${baseCurrency.symbol}`
  const inverseRate = `1 ${baseCurrency.symbol} = ${formattedPrice} ${quoteCurrency.symbol}`
  return showInverseRate ? rate : inverseRate
}

export const getActionName = (t: TFunction, wrapType: WrapType): string => {
  switch (wrapType) {
    case WrapType.Unwrap:
      return t('Unwrap')
    case WrapType.Wrap:
      return t('Wrap')
    default:
      return t('Swap')
  }
}

export const getActionElementName = (wrapType: WrapType): ElementName => {
  switch (wrapType) {
    case WrapType.Unwrap:
      return ElementName.Unwrap
    case WrapType.Wrap:
      return ElementName.Wrap
    default:
      return ElementName.Swap
  }
}

export const getReviewActionName = (t: TFunction, wrapType: WrapType): string => {
  switch (wrapType) {
    case WrapType.Unwrap:
      return t('Review unwrap')
    case WrapType.Wrap:
      return t('Review wrap')
    default:
      return t('Review swap')
  }
}

export function sumGasFees(gasFee1?: string | undefined, gasFee2?: string): string | undefined {
  if (!gasFee1 || !gasFee2) return gasFee1 || gasFee2

  return BigNumber.from(gasFee1).add(gasFee2).toString()
}

export const clearStaleTrades = (
  trade: Trade,
  currencyIn: Maybe<Currency>,
  currencyOut: Maybe<Currency>
): Trade | null => {
  const currencyInAddress = currencyIn?.wrapped.address
  const currencyOutAddress = currencyOut?.wrapped.address

  const inputsMatch =
    !!currencyInAddress &&
    areAddressesEqual(currencyInAddress, trade?.inputAmount.currency.wrapped.address)
  const outputsMatch =
    !!currencyOutAddress &&
    areAddressesEqual(currencyOutAddress, trade?.outputAmount.currency.wrapped.address)

  // if the addresses entered by the user don't match what is being returned by the quote endpoint
  // then set `trade` to null
  return inputsMatch && outputsMatch ? trade : null
}

export const prepareSwapFormState = ({
  inputCurrencyId,
}: {
  inputCurrencyId?: CurrencyId
}): TransactionState | undefined => {
  return inputCurrencyId
    ? {
        exactCurrencyField: CurrencyField.INPUT,
        exactAmountToken: '',
        [CurrencyField.INPUT]: {
          address: currencyIdToAddress(inputCurrencyId),
          chainId: currencyIdToChain(inputCurrencyId) ?? ChainId.Mainnet,
          type: AssetType.Currency,
        },
        [CurrencyField.OUTPUT]: null,
      }
    : undefined
}

// rounds to nearest basis point
export const slippageToleranceToPercent = (slippage: number): Percent => {
  const basisPoints = Math.round(slippage * 100)
  return new Percent(basisPoints, 10_000)
}

interface MethodParameterArgs {
  permit2Signature?: PermitSignatureInfo
  permitInfo: Maybe<PermitOptions>
  trade: Trade
  address: string
  universalRouterEnabled: boolean
}

export const getSwapMethodParameters = ({
  permit2Signature,
  trade,
  address,
  permitInfo,
  universalRouterEnabled,
}: MethodParameterArgs): { calldata: string; value: string } => {
  const slippageTolerancePercent = slippageToleranceToPercent(trade.slippageTolerance)
  const baseOptions = {
    slippageTolerance: slippageTolerancePercent,
    recipient: address,
  }

  if (universalRouterEnabled || permit2Signature) {
    const universalRouterSwapOptions: UniversalRouterSwapOptions = permit2Signature
      ? {
          ...baseOptions,
          inputTokenPermit: {
            signature: permit2Signature.signature,
            ...permit2Signature.permitMessage,
          },
        }
      : baseOptions
    return UniversalSwapRouter.swapERC20CallParameters(trade, universalRouterSwapOptions)
  }

  const swapOptions: SwapOptions = permitInfo
    ? { ...baseOptions, inputTokenPermit: permitInfo }
    : { ...baseOptions }
  return SwapRouter.swapCallParameters(trade, swapOptions)
}
