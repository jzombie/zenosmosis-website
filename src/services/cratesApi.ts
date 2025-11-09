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

const CRATES_USERNAME = 'jzombie';
const MAX_CRATES = 4;
const HISTORY_DAYS = 30;

export async function fetchCrateDownloadStats(): Promise<CrateDownloadSeries[]> {
  try {
    const ownerResponse = await fetch(`https://crates.io/api/v1/owners/github/${CRATES_USERNAME}/crates`);
    if (!ownerResponse.ok) {
      throw new Error(`Crates.io owner request failed with status ${ownerResponse.status}`);
    }

    const ownerData = await ownerResponse.json();
    const crates = Array.isArray(ownerData?.crates) ? ownerData.crates : [];
    const selectedCrates = crates.slice(0, MAX_CRATES);

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
        const trimmed = dailyDownloads.slice(-HISTORY_DAYS);

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
