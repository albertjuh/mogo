import { common } from "./common";
import { dashboard } from "./dashboard";
import { auth } from "./auth";
import { fleet } from "./fleet";
import { onboard } from "./onboard";
import { collect } from "./collect";
import { payments } from "./payments";
import { payouts } from "./payouts";
import { lipa } from "./lipa";
import { users } from "./users";
import { misc } from "./misc";
import { legal } from "./legal";
import { account } from "./account";

export const dictionaries = {
  en: {
    ...common.en,
    ...dashboard.en,
    ...auth.en,
    ...fleet.en,
    ...onboard.en,
    ...collect.en,
    ...payments.en,
    ...payouts.en,
    ...lipa.en,
    ...users.en,
    ...misc.en,
    ...legal.en,
    ...account.en,
  },
  sw: {
    ...common.sw,
    ...dashboard.sw,
    ...auth.sw,
    ...fleet.sw,
    ...onboard.sw,
    ...collect.sw,
    ...payments.sw,
    ...payouts.sw,
    ...lipa.sw,
    ...users.sw,
    ...misc.sw,
    ...legal.sw,
    ...account.sw,
  },
};

export type Language = "en" | "sw";
