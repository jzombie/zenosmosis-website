import type { ReactNode } from 'react'
import { useMemo, useState } from 'react'
import {
  QueryClient,
  QueryClientProvider,
  type DefaultOptions,
} from '@tanstack/react-query'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister'
import { appConfig } from '../config/appConfig'

const queryCacheConfig = appConfig.queryCache

const DEFAULT_OPTIONS: DefaultOptions = {
  queries: {
    staleTime: queryCacheConfig.staleTimeMs,
    gcTime: queryCacheConfig.gcTimeMs,
    retry: (failureCount, error: any) => {
      const status = typeof error?.status === 'number' ? error.status : error?.response?.status
      if (status === 403 || status === 429) {
        return false
      }
      return failureCount < queryCacheConfig.maxRetryAttempts
    },
    refetchOnWindowFocus: false,
  },
}

function createClient() {
  return new QueryClient({ defaultOptions: DEFAULT_OPTIONS })
}

export function PersistentQueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => createClient())

  if (typeof window === 'undefined') {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }

  const persister = useMemo(() => {
    const storage = {
      getItem: async (key: string) => window.localStorage.getItem(key),
      setItem: async (key: string, value: string) => {
        window.localStorage.setItem(key, value)
      },
      removeItem: async (key: string) => {
        window.localStorage.removeItem(key)
      },
    }

    return createAsyncStoragePersister({
      storage,
      key: queryCacheConfig.storageKey,
    })
  }, [])

  const maxAge = useMemo(() => queryCacheConfig.persistedMaxAgeMs, [])

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister, maxAge }}
    >
      {children}
    </PersistQueryClientProvider>
  )
}
