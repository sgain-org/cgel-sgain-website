import { buildMailto } from "@/lib/site.ts";

const DOI_ID = "10.15125/BATH-01664";
export const DOI_URL = `https://doi.org/${DOI_ID}`;

export const ISO: Record<string, string> = {
  Afghanistan: "AFG",
  Angola: "AGO",
  Albania: "ALB",
  "United Arab Emirates": "ARE",
  Argentina: "ARG",
  Armenia: "ARM",
  Antarctica: "ATA",
  Australia: "AUS",
  Austria: "AUT",
  Azerbaijan: "AZE",
  Burundi: "BDI",
  Belgium: "BEL",
  Benin: "BEN",
  "Burkina Faso": "BFA",
  Bangladesh: "BGD",
  Bulgaria: "BGR",
  Bahamas: "BHS",
  "Bosnia and Herz.": "BIH",
  Belarus: "BLR",
  Belize: "BLZ",
  Bolivia: "BOL",
  Brazil: "BRA",
  Brunei: "BRN",
  Bhutan: "BTN",
  Botswana: "BWA",
  "Central African Rep.": "CAF",
  Canada: "CAN",
  Switzerland: "CHE",
  Chile: "CHL",
  China: "CHN",
  "Côte d'Ivoire": "CIV",
  Cameroon: "CMR",
  "Dem. Rep. Congo": "COD",
  Congo: "COG",
  Colombia: "COL",
  "Costa Rica": "CRI",
  Cuba: "CUB",
  Cyprus: "CYP",
  Czechia: "CZE",
  Germany: "DEU",
  Djibouti: "DJI",
  Denmark: "DNK",
  "Dominican Rep.": "DOM",
  Algeria: "DZA",
  Ecuador: "ECU",
  Egypt: "EGY",
  Eritrea: "ERI",
  Spain: "ESP",
  Estonia: "EST",
  Ethiopia: "ETH",
  Finland: "FIN",
  Fiji: "FJI",
  France: "FRA",
  Gabon: "GAB",
  "United Kingdom": "GBR",
  Georgia: "GEO",
  Ghana: "GHA",
  Guinea: "GIN",
  Gambia: "GMB",
  "Guinea-Bissau": "GNB",
  "Eq. Guinea": "GNQ",
  Greece: "GRC",
  Greenland: "GRL",
  Guatemala: "GTM",
  Guyana: "GUY",
  Honduras: "HND",
  Croatia: "HRV",
  Haiti: "HTI",
  Hungary: "HUN",
  Indonesia: "IDN",
  India: "IND",
  Ireland: "IRL",
  Iran: "IRN",
  Iraq: "IRQ",
  Iceland: "ISL",
  Israel: "ISR",
  Italy: "ITA",
  Jamaica: "JAM",
  Jordan: "JOR",
  Japan: "JPN",
  Kazakhstan: "KAZ",
  Kenya: "KEN",
  Kyrgyzstan: "KGZ",
  Cambodia: "KHM",
  "South Korea": "KOR",
  Kuwait: "KWT",
  "Lao PDR": "LAO",
  Laos: "LAO",
  Lebanon: "LBN",
  Liberia: "LBR",
  Libya: "LBY",
  "Sri Lanka": "LKA",
  Lesotho: "LSO",
  Lithuania: "LTU",
  Luxembourg: "LUX",
  Latvia: "LVA",
  Morocco: "MAR",
  Moldova: "MDA",
  Madagascar: "MDG",
  Mexico: "MEX",
  Macedonia: "MKD",
  "North Macedonia": "MKD",
  Mali: "MLI",
  Myanmar: "MMR",
  Montenegro: "MNE",
  Mongolia: "MNG",
  Mozambique: "MOZ",
  Mauritania: "MRT",
  Malawi: "MWI",
  Malaysia: "MYS",
  Namibia: "NAM",
  "New Caledonia": "NCL",
  Niger: "NER",
  Nigeria: "NGA",
  Nicaragua: "NIC",
  Netherlands: "NLD",
  Norway: "NOR",
  Nepal: "NPL",
  "New Zealand": "NZL",
  Oman: "OMN",
  Pakistan: "PAK",
  Panama: "PAN",
  Peru: "PER",
  Philippines: "PHL",
  "Papua New Guinea": "PNG",
  Poland: "POL",
  "North Korea": "PRK",
  Portugal: "PRT",
  Paraguay: "PRY",
  Palestine: "PSE",
  Qatar: "QAT",
  Romania: "ROU",
  Russia: "RUS",
  Rwanda: "RWA",
  "W. Sahara": "ESH",
  "Saudi Arabia": "SAU",
  Sudan: "SDN",
  "S. Sudan": "SSD",
  Senegal: "SEN",
  "Solomon Is.": "SLB",
  "Sierra Leone": "SLE",
  "El Salvador": "SLV",
  Somalia: "SOM",
  Serbia: "SRB",
  Suriname: "SUR",
  Slovakia: "SVK",
  Slovenia: "SVN",
  Sweden: "SWE",
  Eswatini: "SWZ",
  Syria: "SYR",
  Chad: "TCD",
  Togo: "TGO",
  Thailand: "THA",
  Tajikistan: "TJK",
  Turkmenistan: "TKM",
  "Timor-Leste": "TLS",
  "Trinidad and Tobago": "TTO",
  Tunisia: "TUN",
  Turkey: "TUR",
  Taiwan: "TWN",
  Tanzania: "TZA",
  Uganda: "UGA",
  Ukraine: "UKR",
  Uruguay: "URY",
  "United States of America": "USA",
  Uzbekistan: "UZB",
  Venezuela: "VEN",
  Vietnam: "VNM",
  Vanuatu: "VUT",
  Yemen: "YEM",
  "South Africa": "ZAF",
  Zambia: "ZMB",
  Zimbabwe: "ZWE",
  Kosovo: "XKX",
  "Falkland Is.": "FLK",
  "Fr. S. Antarctic Lands": "ATF",
};

export const REGIONS = [
  "Africa",
  "Asia",
  "Europe",
  "Latin America and the Caribbean",
  "North America",
  "Oceania",
  "Global",
] as const satisfies readonly string[];

export const GOVERNANCE_LEVELS = ["Bilateral", "Multilateral", "Transnational"];

type LabelPair = [string, string];

export const INITIATIVE_TYPES: LabelPair[] = [
  ["Information sharing and dialogues", "1- Information sharing and dialogues"],
  ["Capacity-building and training", "2- Capacity-building and training"],
  ["Direction action and demonstration", "3- Direction action and demonstration"],
  ["Provision of funding", "4- Provision of funding"],
  [
    "Research and scientific knowledge production",
    "5- Research and scientific knowledge production",
  ],
  [
    "Rule-making and standard-setting initiatives",
    "6- Rule-making and standard-setting initiatives",
  ],
];

export const ENVIRONMENTAL_PROBLEMS: LabelPair[] = [
  ["Agriculture & Food security", "Agriculture & Food Security"],
  ["Atmosphere", "Atmosphere"],
  ["Biodiversity", "Biodiversity"],
  ["", "Broad Problem"],
  ["Chemicals & Wastes", "Chemicals & Wastes"],
  ["Cities", "Cities"],
  ["Climate change", "Climate Change"],
  ["Disasters & Humanitarian Relief", "Disasters & Humanitarian Relief"],
  ["Energy", "Energy"],
  ["Forests", "Forests"],
  ["Ocean & Coasts", "Ocean & Coasts"],
  ["Water", "Water"],
];

export const YEAR_MIN = 1980;
export const YEAR_MAX = 2024;
export const YEARS: number[] = Array.from(
  { length: YEAR_MAX - YEAR_MIN + 1 },
  (_, i) => YEAR_MIN + i,
);

export const SDG_COLORS: Record<number, string> = {
  1: "#E5243B",
  2: "#DDA63A",
  3: "#4C9F38",
  4: "#C5192D",
  5: "#FF3A21",
  6: "#26BDE2",
  7: "#FCC30B",
  8: "#A21942",
  9: "#FD6925",
  10: "#DD1367",
  11: "#FD9D24",
  12: "#BF8B2E",
  13: "#3F7E44",
  14: "#0A97D9",
  15: "#56C02B",
  16: "#00689D",
  17: "#19486A",
};

export const CONTACT_EMAIL = "sgain@bath.ac.uk";

export const PUBLICATION_MAILTO = buildMailto(CONTACT_EMAIL, {
  subject: "Publication to add to the CGEL Database",
  body: `Hi SGAIN team,

I'd like to add a publication that uses or cites the CGEL Database:

Authors:
Year:
Title:
Journal / Volume:
DOI or URL:

Thanks!`,
});

export const FEEDBACK_MAILTO = buildMailto(CONTACT_EMAIL, {
  subject: "CGEL Database — feedback",
  body: `Hi SGAIN team,

`,
});

export const FEEDBACK_FORM_URL = "https://forms.office.com/e/0jqi1KMdqs";

export const ORGANISATION_TYPES = [
  "Government",
  "International organisation",
  "Business",
  "Civil society",
  "University",
  "Research institute",
  "Media",
  "Other",
] as const;

export const DOWNLOAD_FORM = {
  action:
    "https://docs.google.com/forms/u/0/d/e/1FAIpQLSdFirbqsk2ChDPzuCDLdz-wwsURT03v_U3qxGHoBFAau98XZQ/formResponse",
  fields: {
    name: "entry.685014364",
    email: "entry.45452979",
    organisation: "entry.537799123",
    filters: "entry.1182372609",
  },
} as const;

export const TEAM_MEMBERS = [
  {
    initials: "YS",
    name: "Yixian Sun",
    role: "Principal Investigator",
    url: "https://yixiansun.com/",
  },
  {
    initials: "YY",
    name: "Yitong Ye",
    role: "Postdoctoral Research Associate",
    url: "https://www.linkedin.com/in/yitong-ye-a03bab203/",
  },
  {
    initials: "CO",
    name: "Ciara O'Brien",
    role: "Project Manager & Research Assistant",
    url: "https://www.linkedin.com/in/ciara-o-brien-147a06305/",
  },
];

export const CONTRIBUTORS = "Jiang Li, X. Ya, and H. Zhao";

export const CITATION_TEXT =
  "Sun, Y., Ye, Y., Li, J., O'Brien, C., Ya, X., & Zhao, H., 2025. China's Global Environmental Leadership (CGEL) Database — Version 1.0. SGAIN Project. University of Bath.";

export const CITATION = `${CITATION_TEXT} ${DOI_URL}`;

export const BIBTEX = `@dataset{sun_ye_li_obrien_ya_zhao_2025,
  author = {Sun, Yixian and Ye, Yitong and Li, Jiang and O'Brien, Ciara and Ya, X. and Zhao, H.},
  title = {China's Global Environmental Leadership (CGEL) Database},
  year = {2025},
  version = {1.0},
  publisher = {SGAIN Project, University of Bath},
  doi = {${DOI_ID}},
  url = {${DOI_URL}},
  type = {dataset}
}`;
