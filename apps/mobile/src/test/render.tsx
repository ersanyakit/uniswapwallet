import { ApolloLink } from '@apollo/client'
import { MockedProvider, MockedResponse, MockLink } from '@apollo/client/testing'
import { NavigationContainer } from '@react-navigation/native'
import type { EnhancedStore, PreloadedState } from '@reduxjs/toolkit'
import { configureStore } from '@reduxjs/toolkit'
import { ThemeProvider } from '@shopify/restyle'
import {
  render as RNRender,
  renderHook as RNRenderHook,
  RenderOptions,
} from '@testing-library/react-native'
import React, { PropsWithChildren } from 'react'
import { Provider } from 'react-redux'
import { ReactTestRendererJSON } from 'react-test-renderer'
import type { MobileState } from 'src/app/reducer'
import type { AppStore } from 'src/app/store'
import { persistedReducer } from 'src/app/store'
import { routingApi } from 'src/features/routing/routingApi'
import { theme } from 'ui/src/theme/restyle/theme'
import { setupCache } from 'wallet/src/data/cache'
import { getErrorLink } from 'wallet/src/data/links'
import { ensApi } from 'wallet/src/features/ens/api'

// This type interface extends the default options for render from RTL, as well
// as allows the user to specify other things such as initialState, store.
interface ExtendedRenderOptions extends Omit<RenderOptions, 'queries'> {
  mocks?: ReadonlyArray<MockedResponse>
  preloadedState?: PreloadedState<MobileState>
  store?: AppStore
}

/**
 *
 * @param ui Component to render
 * @param mocks Mocks to pass to Apollo MockedProvider
 * @param preloadedState and store
 * @returns `ui` wrapped with providers
 */
export function renderWithProviders(
  ui: React.ReactElement,
  {
    mocks = [],
    preloadedState = {},
    // Automatically create a store instance if no store was passed in
    store = configureStore({
      reducer: persistedReducer,
      preloadedState,
      middleware: (getDefaultMiddleware) =>
        // TODO: fix typing
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        getDefaultMiddleware().concat(routingApi.middleware, ensApi.middleware) as any,
    }),
    ...renderOptions
  }: ExtendedRenderOptions = {}
): // TODO (MOB-645): add more specific types
// eslint-disable-next-line @typescript-eslint/no-explicit-any
Record<string, any> & {
  store: EnhancedStore
} {
  function Wrapper({ children }: PropsWithChildren<unknown>): JSX.Element {
    // Helps expose errors in MockedProvider
    const link = ApolloLink.from([getErrorLink(1, 1), new MockLink(mocks)])

    return (
      <MockedProvider addTypename={false} cache={setupCache()} link={link} mocks={mocks}>
        <Provider store={store}>
          <NavigationContainer>
            <ThemeProvider theme={theme}>{children}</ThemeProvider>
          </NavigationContainer>
        </Provider>
      </MockedProvider>
    )
  }

  // Return an object with the store and all of RTL's query functions
  return { store, ...RNRender(ui, { wrapper: Wrapper, ...renderOptions }) }
}

/**
 *
 * @param hook Hook to render
 * @param mocks Mocks to pass to Apollo MockedProvider
 * @param preloadedState and store
 * @returns `hook` wrapped with providers
 */
export function renderHookWithProviders(
  // figure out a way to pass proper hook type
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  hook: (...args: any) => any,
  {
    mocks = [],
    preloadedState = {},
    // Automatically create a store instance if no store was passed in
    store = configureStore({ reducer: persistedReducer, preloadedState }),
    ...renderOptions
  }: ExtendedRenderOptions = {}
): // TODO (MOB-645): add more specific types
// eslint-disable-next-line @typescript-eslint/no-explicit-any
Record<string, any> & {
  store: EnhancedStore
} {
  function Wrapper({ children }: PropsWithChildren<unknown>): JSX.Element {
    // Helps expose errors in MockedProvider
    const link = ApolloLink.from([getErrorLink(1, 1), new MockLink(mocks)])

    return (
      <MockedProvider addTypename={false} cache={setupCache()} link={link} mocks={mocks}>
        <Provider store={store}>
          <ThemeProvider theme={theme}>{children}</ThemeProvider>
        </Provider>
      </MockedProvider>
    )
  }

  // Return an object with the store and all of RTL's query functions
  return {
    store,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...RNRenderHook<any, any>(hook, {
      wrapper: Wrapper,
      ...renderOptions,
    }),
  }
}

export const WithTheme = ({ component }: { component: JSX.Element }): JSX.Element => {
  return <ThemeProvider theme={theme}>{component}</ThemeProvider>
}

export const renderWithTheme = (
  element: JSX.Element
): ReactTestRendererJSON | ReactTestRendererJSON[] | null =>
  RNRender(<WithTheme component={element} />).toJSON()
