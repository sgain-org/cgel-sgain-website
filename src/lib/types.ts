export interface Initiative {
  code: string;
  name: string;
  name_zh: string;
  acronym: string;
  start_year: string;
  status: string;
  end_year: string;
  governance: string;
  region: string;
  description: string;
  problem1: string;
  problem2: string;
  broad_issues: string;
  sdg: string;
  type_primary: string;
  type_secondary: string;
  lead_actor: string;
  lead_actor_type: string;
  colead_actor: string;
  collab_name: string;
  collab_type: string;
  collab_origin: string;
  website: string;
  countries: string[];
  [key: string]: string | string[] | undefined;
}

export interface Publication {
  authors: string;
  year: string;
  title: string;
  journal: string;
  volume: string;
  doi: string;
  url: string;
}

export interface WorldFeature {
  type: "Feature";
  properties: { name: string };
  geometry: unknown;
}

export interface WorldGeo {
  type: "FeatureCollection";
  features: WorldFeature[];
}
