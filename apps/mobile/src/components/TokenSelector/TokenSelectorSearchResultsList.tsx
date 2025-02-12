import React, { memo, useCallback, useMemo } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { Flex } from 'src/components/layout'
import { Text } from 'src/components/Text'
import {
  usePortfolioBalancesForAddressById,
  usePortfolioTokenOptions,
} from 'src/components/TokenSelector/hooks'
import {
  OnSelectCurrency,
  SectionHeader,
  TokenSection,
  TokenSelectorList,
} from 'src/components/TokenSelector/TokenSelectorList'
import { formatSearchResults, getTokenOptionsSection } from 'src/components/TokenSelector/utils'
import { useSearchTokens } from 'src/features/dataApi/searchTokens'
import { ChainId } from 'wallet/src/constants/chains'
import { GqlResult } from 'wallet/src/features/dataApi/types'
import { useActiveAccountAddressWithThrow } from 'wallet/src/features/wallet/hooks'
import { useDebounce } from 'wallet/src/utils/timing'

function EmptyResults({ searchFilter }: { searchFilter: string }): JSX.Element {
  const { t } = useTranslation()
  return (
    <Flex>
      <SectionHeader title={t('Search results')} />
      <Text color="textTertiary" textAlign="center" variant="subheadSmall">
        <Trans t={t}>
          No results found for <Text color="textPrimary">"{searchFilter}"</Text>
        </Trans>
      </Text>
    </Flex>
  )
}

function useTokenSectionsForSearchResults(
  chainFilter: ChainId | null,
  searchFilter: string,
  isBalancesOnlySearch: boolean
): GqlResult<TokenSection[]> {
  const { t } = useTranslation()
  const activeAccountAddress = useActiveAccountAddressWithThrow()

  const {
    data: portfolioBalancesById,
    error: portfolioBalancesByIdError,
    refetch: refetchPortfolioBalances,
  } = usePortfolioBalancesForAddressById(activeAccountAddress)

  const {
    data: portfolioTokenOptions,
    error: portfolioTokenOptionsError,
    refetch: refetchPortfolioTokenOptions,
  } = usePortfolioTokenOptions(activeAccountAddress, chainFilter, searchFilter)

  // Only call search endpoint if isBalancesOnlySearch is false
  const {
    data: searchResultCurrencies,
    error: searchTokensError,
    refetch: refetchSearchTokens,
  } = useSearchTokens(searchFilter, chainFilter, /*skip*/ isBalancesOnlySearch)

  const searchResults = useMemo(() => {
    return formatSearchResults(searchResultCurrencies, portfolioBalancesById, searchFilter)
  }, [searchResultCurrencies, portfolioBalancesById, searchFilter])

  const loading = !portfolioTokenOptions || (!isBalancesOnlySearch && !searchResults)

  const sections = useMemo(() => {
    return getTokenOptionsSection(
      t('Search results'),
      // Use local search when only searching balances
      isBalancesOnlySearch ? portfolioTokenOptions : searchResults
    )
  }, [isBalancesOnlySearch, portfolioTokenOptions, searchResults, t])

  const error =
    (!portfolioBalancesById && portfolioBalancesByIdError) ||
    (!portfolioTokenOptions && portfolioTokenOptionsError) ||
    (!isBalancesOnlySearch && !searchResults && searchTokensError)

  const refetchAll = useCallback(() => {
    refetchPortfolioBalances?.()
    refetchSearchTokens?.()
    refetchPortfolioTokenOptions?.()
  }, [refetchPortfolioBalances, refetchPortfolioTokenOptions, refetchSearchTokens])

  return useMemo(
    () => ({
      data: sections,
      loading,
      error: error || undefined,
      refetch: refetchAll,
    }),
    [error, loading, refetchAll, sections]
  )
}

function _TokenSelectorSearchResultsList({
  onSelectCurrency,
  chainFilter,
  searchFilter,
  isBalancesOnlySearch,
}: {
  onSelectCurrency: OnSelectCurrency
  chainFilter: ChainId | null
  searchFilter: string
  isBalancesOnlySearch: boolean
}): JSX.Element {
  const { t } = useTranslation()
  const debouncedSearchFilter = useDebounce(searchFilter)
  const {
    data: sections,
    loading,
    error,
    refetch,
  } = useTokenSectionsForSearchResults(chainFilter, debouncedSearchFilter, isBalancesOnlySearch)

  const emptyElement = useMemo(
    () => <EmptyResults searchFilter={debouncedSearchFilter} />,
    [debouncedSearchFilter]
  )
  return (
    <TokenSelectorList
      chainFilter={chainFilter}
      emptyElement={emptyElement}
      errorText={t("Couldn't load search results")}
      hasError={Boolean(error)}
      loading={loading}
      refetch={refetch}
      sections={sections}
      onSelectCurrency={onSelectCurrency}
    />
  )
}

export const TokenSelectorSearchResultsList = memo(_TokenSelectorSearchResultsList)
