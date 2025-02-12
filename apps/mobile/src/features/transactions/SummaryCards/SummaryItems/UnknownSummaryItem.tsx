import React, { useMemo } from 'react'
import { useAppTheme } from 'src/app/hooks'
import TransactionSummaryLayout, {
  TXN_HISTORY_ICON_SIZE,
} from 'src/features/transactions/SummaryCards/TransactionSummaryLayout'
import UnknownStatus from 'ui/src/assets/icons/contract-interaction.svg'
import { TransactionDetails, UnknownTransactionInfo } from 'wallet/src/features/transactions/types'
import { getValidAddress, shortenAddress } from 'wallet/src/utils/addresses'

export default function UnknownSummaryItem({
  transaction,
}: {
  transaction: TransactionDetails & { typeInfo: UnknownTransactionInfo }
}): JSX.Element {
  const theme = useAppTheme()

  const caption = useMemo(() => {
    return transaction.typeInfo.tokenAddress && getValidAddress(transaction.typeInfo.tokenAddress)
      ? shortenAddress(transaction.typeInfo.tokenAddress)
      : ''
  }, [transaction.typeInfo.tokenAddress])

  return (
    <TransactionSummaryLayout
      caption={caption}
      icon={
        <UnknownStatus
          color={theme.colors.textSecondary}
          fill={theme.colors.background0}
          height={TXN_HISTORY_ICON_SIZE}
          width={TXN_HISTORY_ICON_SIZE}
        />
      }
      transaction={transaction}
    />
  )
}
