import { appConfig } from '../config/appConfig';

export interface CrateDownloadPoint {
  date: string;
  downloads: number;
}

export interface CrateDownloadSeries {
  crate: string;
  url: string;
  totalDownloads: number;
  recentDownloads: number;
  recentDownloadsReported?: number;
  daily: CrateDownloadPoint[];
}

function createResponseError(response: Response, endpoint: string) {
  const error: any = new Error(`crates.io request failed (${response.status}) for ${endpoint}`);
  error.status = response.status;
  error.endpoint = endpoint;
  return error;
}

export async function fetchCrateDownloadStats(): Promise<CrateDownloadSeries[]> {
  try {
    const { username, maxCrates, historyDays } = appConfig.crates;

    const userResponse = await fetch(`https://crates.io/api/v1/users/${username}`);
    if (!userResponse.ok) {
      throw createResponseError(userResponse, 'users');
    }

    const userData = await userResponse.json();
    const userId = typeof userData?.user?.id === 'number' ? userData.user.id : null;
    if (!userId) {
      throw new Error(`crates.io user lookup failed for ${username}`);
    }

    const cratesResponse = await fetch(
      `https://crates.io/api/v1/crates?user_id=${userId}&per_page=${maxCrates}&sort=recent-downloads`,
    );
    if (!cratesResponse.ok) {
      throw createResponseError(cratesResponse, 'crates');
    }

    const cratesData = await cratesResponse.json();
    const crates = Array.isArray(cratesData?.crates) ? cratesData.crates : [];
    const selectedCrates = crates.slice(0, maxCrates);

    const series: CrateDownloadSeries[] = [];

    for (const crate of selectedCrates) {
      const crateName = typeof crate?.id === 'string' ? crate.id : crate?.name;
      if (typeof crateName !== 'string') {
        continue;
      }

      try {
        const downloadsResponse = await fetch(`https://crates.io/api/v1/crates/${crateName}/downloads`);
        if (!downloadsResponse.ok) {
          continue;
        }

        const downloadsData = await downloadsResponse.json();
        const versionDownloads = Array.isArray(downloadsData?.version_downloads)
          ? downloadsData.version_downloads
          : [];
        const extraDownloads = Array.isArray(downloadsData?.meta?.extra_downloads)
          ? downloadsData.meta.extra_downloads
          : [];

        const downloadsByDate = new Map<string, number>();

        for (const entry of versionDownloads) {
          const date = typeof entry?.date === 'string' ? entry.date : null;
          const count = typeof entry?.downloads === 'number' ? entry.downloads : 0;
          if (!date || count <= 0) continue;
          downloadsByDate.set(date, (downloadsByDate.get(date) ?? 0) + count);
        }

        for (const entry of extraDownloads) {
          const date = typeof entry?.date === 'string' ? entry.date : null;
          const count = typeof entry?.downloads === 'number' ? entry.downloads : 0;
          if (!date || count <= 0) continue;
          downloadsByDate.set(date, (downloadsByDate.get(date) ?? 0) + count);
        }

        const combinedDaily = Array.from(downloadsByDate.entries())
          .map(([date, downloads]) => ({ date, downloads }))
          .sort((a, b) => a.date.localeCompare(b.date));

        const trimmed = combinedDaily.slice(-historyDays);
        const recentDownloads = trimmed.reduce((sum, entry) => sum + entry.downloads, 0);

        series.push({
          crate: crateName,
          url: `https://crates.io/crates/${crateName}`,
          totalDownloads: typeof crate?.downloads === 'number' ? crate.downloads : 0,
          recentDownloadsReported:
            typeof crate?.recent_downloads === 'number' ? crate.recent_downloads : undefined,
          recentDownloads,
          daily: trimmed,
        });
      } catch (crateError) {
        console.warn('Failed to fetch download stats for crate', crateName, crateError);
      }
    }

    return series.sort((a, b) => b.recentDownloads - a.recentDownloads);
  } catch (error) {
    console.error('Failed to fetch crate download stats:', error);
    throw error;
  }
}
