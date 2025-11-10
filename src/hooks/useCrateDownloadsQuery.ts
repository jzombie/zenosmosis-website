import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import {
  fetchCrateDownloadStats,
  type CrateDownloadSeries,
} from '../services/cratesApi'

export const CRATE_DOWNLOADS_QUERY_KEY = ['crates', 'downloads'] as const

export function useCrateDownloadsQuery(): UseQueryResult<CrateDownloadSeries[]> {
  return useQuery({
    queryKey: CRATE_DOWNLOADS_QUERY_KEY,
    queryFn: fetchCrateDownloadStats,
    meta: { source: 'crates-downloads' },
  })
}
