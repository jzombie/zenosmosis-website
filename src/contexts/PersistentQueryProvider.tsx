import type { ReactNode } from 'react'
import { useMemo, useState } from 'react'
import {
  QueryClient,
  QueryClientProvider,
  type DefaultOptions,
} from '@tanstack/react-query'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'

const DEFAULT_OPTIONS: DefaultOptions = {
  queries: {
    staleTime: 1000 * 60 * 15, // treat cached data as fresh for 15 minutes
    gcTime: 1000 * 60 * 60, // garbage collect after 1 hour of inactivity
    retry: (failureCount, error: any) => {
      const status = typeof error?.status === 'number' ? error.status : error?.response?.status
      if (status === 403 || status === 429) {
        return false
      }
      return failureCount < 2
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

  const persister = useMemo(
    () =>
      createSyncStoragePersister({
        storage: window.localStorage,
        key: 'zenosmosis-query-cache',
      }),
    []
  )

  const maxAge = useMemo(() => 1000 * 60 * 60 * 12, []) // keep cached data for up to 12 hours

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister, maxAge }}
    >
      {children}
    </PersistQueryClientProvider>
  )
}
