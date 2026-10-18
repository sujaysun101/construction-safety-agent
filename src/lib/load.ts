import { getStore } from "@/lib/store";

export async function loadOrg(orgId: string, memory = false) {
  const store = getStore({ memory });
  const [sites, crew, walks, findings, actions, logs, photos] = await Promise.all([
    store.listSites(orgId),
    store.listCrew(orgId),
    store.listWalks(orgId),
    store.listFindings(orgId),
    store.listActions(orgId),
    store.listLogs(orgId),
    store.listPhotos(orgId),
  ]);
  return { sites, crew, walks, findings, actions, logs, photos };
}

export type OrgData = Awaited<ReturnType<typeof loadOrg>>;
