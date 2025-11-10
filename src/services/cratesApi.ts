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

    const ownerResponse = await fetch(`https://crates.io/api/v1/owners/github/${username}/crates`);
    if (!ownerResponse.ok) {
      throw createResponseError(ownerResponse, 'owners');
    }

    const ownerData = await ownerResponse.json();
    const crates = Array.isArray(ownerData?.crates) ? ownerData.crates : [];
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
        const dailyDownloads = Array.isArray(downloadsData?.downloads) ? downloadsData.downloads : [];
        const trimmed = dailyDownloads.slice(-historyDays);

        const daily: CrateDownloadPoint[] = trimmed.map((entry: any) => ({
          date: typeof entry?.date === 'string' ? entry.date : '',
          downloads: typeof entry?.downloads === 'number' ? entry.downloads : 0,
        }));

        const recentDownloads = daily.reduce((sum, entry) => sum + entry.downloads, 0);

        series.push({
          crate: crateName,
          url: `https://crates.io/crates/${crateName}`,
          totalDownloads: typeof crate?.downloads === 'number' ? crate.downloads : 0,
          recentDownloads,
          daily,
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
