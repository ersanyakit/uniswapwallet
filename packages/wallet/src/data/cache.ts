import { InMemoryCache } from '@apollo/client'
import { Reference, relayStylePagination } from '@apollo/client/utilities'

/**
 * @returns Apollo#InMemoryCache with custom type policies
 * NOTE: persistence is managed by consumers
 */
export function setupCache(): InMemoryCache {
  return new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          // relayStylePagination function unfortunately generates a field policy that ignores args
          // Note: all non-pagination related query args should be added for cache to work properly.
          // ^ This ensures that cache doesnt get overwritten by similar queries with different args (e.g. different filter on NFT Items)
          nftBalances: relayStylePagination(['ownerAddress']),
          nftAssets: relayStylePagination(['address', 'filter']),

          /*
           * CACHE REDIRECTS
           *
           * when queries require params, Apollo cannot return partial data from cache
           * because it will not know the `id` until data is received.
           * The following redirects set ids to values known ahead of time.
           *
           * NOTE: may require setting a Field policy to ensure ids are stored in the
           *      format we specify. See `token()` below for a full example.
           * see https://music.youtube.com/watch?v=twd4Pb4o_fU&feature=share
           */

          // simply use chain / address pair as id instead for tokens
          token: {
            read(_, { args, toReference }): Reference | undefined {
              return toReference({
                __typename: 'Token',
                chain: args?.chain,
                address: args?.address?.toLowerCase(),
              })
            },
          },
        },
      },
      Token: {
        // key by chain, address combination so that Token(chain, address) endpoint can read from cache
        /**
         * NOTE: In any query for `token` or `tokens`, you must include the `chain` and `address` fields
         * in order for result to normalize properly in the cache.
         */
        keyFields: ['chain', 'address'],
        fields: {
          address: {
            read(address: string | null): string | null {
              // backend endpoint sometimes returns checksummed, sometimes lowercased addresses
              // always use lowercased addresses in our app for consistency
              return address?.toLowerCase() ?? null
            },
          },
        },
      },
    },
  })
}
