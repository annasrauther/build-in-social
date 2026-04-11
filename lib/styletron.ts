import { Client, Server } from "styletron-engine-monolithic";

const getHydrateClass = () =>
  typeof document !== "undefined"
    ? document.getElementsByClassName("_styletron_hydrate_")
    : [];

export const styletron =
  typeof window !== "undefined"
    ? new Client({ hydrate: getHydrateClass() as unknown as HTMLStyleElement[] })
    : new Server();
