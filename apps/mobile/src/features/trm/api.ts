import { PrefetchOptions } from '@reduxjs/toolkit/dist/query/core/module'
import { createApi, fetchBaseQuery, skipToken } from '@reduxjs/toolkit/query/react'
import { config } from 'wallet/src/config'
import { uniswapUrls } from 'wallet/src/constants/urls'

type ScreenResponse = {
  block: boolean
}

export const trmApi = createApi({
  reducerPath: 'trmApi',
  baseQuery: fetchBaseQuery({
    baseUrl: uniswapUrls.trmUrl,
    prepareHeaders: (headers) => {
      // TODO: [MOB-218] remove once routing api officially supports mobile
      // spoof origin to go around server permissions
      headers.set('Origin', config.uniswapAppUrl)
      headers.set('X-API-KEY', config.uniswapApiKey)
      return headers
    },
  }),
  endpoints: (builder) => ({
    trm: builder.query<ScreenResponse, string>({
      query: (address: string) => ({
        url: '/',
        body: { address },
        method: 'POST',
      }),
    }),
  }),
})

const { useTrmQuery, usePrefetch } = trmApi
export const useTrmPrefetch = (): ((arg: string, options?: PrefetchOptions | undefined) => void) =>
  usePrefetch('trm')

/** Calls the TRM screen query if there is a defined non-readonly account. */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useTrmQueryResult(accountAddress?: string | undefined, isViewOnly = false) {
  return useTrmQuery(accountAddress && !isViewOnly ? accountAddress : skipToken)
}
