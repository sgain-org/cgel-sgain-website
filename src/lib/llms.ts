import {
  BIBTEX,
  CITATION,
  CONTACT_EMAIL,
  CONTRIBUTORS,
  DOI_URL,
  GOVERNANCE_LEVELS,
  REGIONS,
  TEAM_MEMBERS,
} from "@/lib/constants.ts";
import { readInitiatives, summaryStats, variableCount } from "@/lib/data.server.ts";
import { makeUrl } from "@/lib/site.ts";

export async function buildLlmsTxt(): Promise<string> {
  const { initiativeCount, collaboratingCountryCount, regionCount } = summaryStats(
    readInitiatives(),
  );
  const variables = variableCount();
  const url = makeUrl();

  return `# CGEL Database — China's Global Environmental Leadership

> The first and most comprehensive database of cross-border environmental governance initiatives led by Chinese state and non-state actors in the 21st century (2000–2024). SGAIN project at the University of Bath, funded by the UKRI.

The database documents ${initiativeCount} governance initiatives across ${regionCount} world regions and ${collaboratingCountryCount} collaborating countries, coded across ${variables} variables. The full dataset and codebook are openly published at the University of Bath Research Data Archive.

## Pages

- [Overview](${url("/")}): project introduction, headline statistics, and interactive visualisations — a collaboration world map, temporal trends, governance functions, and environmental problems.
- [Browse the database](${url("/browse/")}): search and filter all ${initiativeCount} initiatives by type, region, environmental issue, and governance level, and open a detail view for each entry.
- [Methodology](${url("/methodology/")}): the unit of analysis and inclusion criteria, how we operationalise leadership, and how the database was built.
- [About & Cite](${url("/about/")}): about the database and the SGAIN project, how to cite it, data access, the team, and contact details.

## Data

- [Full dataset & codebook — University of Bath Research Data Archive](${DOI_URL}): the complete database (${initiativeCount} initiatives, ${variables} variables) and full codebook.

## Optional

- [llms-full.txt](${url("/llms-full.txt")}): the full site content (about, key findings, methodology, and data schema) as a single text file.
`;
}

export async function buildLlmsFullTxt(): Promise<string> {
  const { initiativeCount, collaboratingCountryCount, regionCount } = summaryStats(
    readInitiatives(),
  );
  const variables = variableCount();
  const url = makeUrl();

  return `# CGEL Database — China's Global Environmental Leadership

> The first and most comprehensive database of cross-border environmental governance initiatives led by Chinese state and non-state actors in the 21st century (2000–2024). SGAIN project at the University of Bath, funded by the UKRI.

This file is the full text content of the CGEL Database website (${url("/")}). It covers what the database is, the headline findings, the methodology, and the data schema. It does not reproduce the individual initiative records — the complete dataset and codebook are openly published at the University of Bath Research Data Archive (${DOI_URL}).

The database documents ${initiativeCount} governance initiatives across ${regionCount} world regions and ${collaboratingCountryCount} collaborating countries, coded across ${variables} variables.

## About the database

The China's Global Environmental Leadership (CGEL) database is the first and most comprehensive database that gathers granular data on cross-border environmental governance initiatives led by Chinese state and non-state actors in the 21st century. It systematically collects key information on efforts by Chinese actors to lead governance initiatives addressing different environmental issues through multilateral, bilateral, and transnational channels.

## About the SGAIN project

The database is produced as part of the SGAIN project — Sustainability Governance of China's Global Infrastructure Investments — a £1.7 million research programme led by Dr Yixian Sun at the University of Bath and funded by the UKRI. SGAIN integrates innovative mixed methods to assess China's efforts to promote green development through overseas infrastructure investments and also environmental and social impacts of key Chinese projects in different host contexts across the Global South. The CGEL database is one of the project's core research outputs, intended as an open resource for researchers, policymakers, and practitioners.

## Key findings

- Temporal evolution: China has become increasingly active in leading cross-border environmental governance, with state agencies driving this expansion. The widening spatial footprint reflects not only the diversification of China's environmental partnerships but also its growing ambition to shape global environmental agendas.
- Governance functions: "Information sharing" and "Capacity-building" emerged as key emphases. In contrast, the provision of funding remains consistently limited, setting China apart from traditional aid-based models of environmental cooperation.
- Environmental problems: China's efforts to lead global environmental governance primarily focus on climate change (30%), followed respectively by energy (16%) and water (12%). Around 11% of the initiatives address broad environmental issues without a specific focus.
- Collaboration geography: on the website's interactive map, each country is shaded by the number of initiatives in which it is the primary international collaborator; multi-country collaborators are split and counted once each.

## Methodology

Unit of analysis and inclusion criteria. The unit of analysis is a governance initiative — an institutionalised arrangement that must involve an intentional process of steering and must secure recognition of its authority from the individuals and organisations it engages with. An initiative is included when it meets all of the following:

1. Led by Chinese actors: (co-)created by Chinese actors, or mainly led by them in operation.
2. Crosses China's borders: operates at the multilateral, bilateral, or transnational level, involving non-Chinese actors and activity beyond China's borders.
3. Involves substantial action: real steering recognised as authoritative by its constituent actors, rather than lip service.
4. Addresses environmental issues: primarily aims to address environmental issues, or has them as one of its key concerns.
5. Active during 2000–2024: active at any point in this period, including cases that began before 2000 or ended before 2025.

How we operationalise leadership. Leadership in global environmental governance is enacted through concrete actions, so we observe it through the governance functions each initiative performs. Each initiative is coded into up to three of six functional types, ordered by importance: information sharing and dialogues; capacity-building and training; direct action and demonstration; provision of funding; research and scientific knowledge production; rule-making and standard-setting. Each initiative is classified by governance level as one of: ${GOVERNANCE_LEVELS.join(", ")}.

How we built the database. Since no official register of China-led environmental initiatives exists, cases were identified through a three-step process: a systematic search of six established databases of global environmental governance (PKULaw Database, IEADB, UN SDG Actions Platform, C-CID, Yearbook of International Organizations, and the Database of Bilateral Clean Energy and Climate Agreements with China); a scoping review of academic and grey literature; and consultation with subject experts. Each case was screened by at least two researchers to confirm eligibility and remove duplicates, then independently coded by at least two coders working from the shared codebook, with disagreements resolved against original sources and through team review. Geographic scopes (regions) used in the analysis: ${REGIONS.join(", ")}.

## Dataset and schema

The database contains ${initiativeCount} initiatives described by ${variables} variables. The full codebook — governance-level definitions, initiative-type coding, the IISD environmental typology, and data conventions — is published with the dataset at the University of Bath Research Data Archive. The fields surfaced through this website are:

- code: stable identifier (displayed as CGEL-<code>).
- name, name_zh, acronym: English name, Chinese name, and acronym.
- start_year, end_year, status: active period and whether the initiative is ongoing or completed.
- governance: governance level (bilateral, multilateral, or transnational).
- region: primary geographic scope.
- description: short background summary.
- problem1, problem2: primary environmental issues (IISD typology).
- sdg: related UN Sustainable Development Goals.
- type_primary, type_secondary: governance-function types.
- lead_actor, lead_actor_type, colead_actor: the lead Chinese actor (and type) and any co-lead.
- collab_name, collab_type, collab_origin: the primary international collaborator, its type, and country/region of origin.
- countries: collaborating countries (pipe-delimited in the source CSV).
- website: official source URL where available.

For analysis or redistribution, use the complete dataset and codebook at the archive rather than the fields above. Note: the website only allows exporting a filtered selection; the full database is distributed via the Bath archive.

## How to cite

Recommended citation:

${CITATION}

BibTeX:

${BIBTEX}

## Access and data

The full dataset and codebook are openly available from the University of Bath Research Data Archive: ${DOI_URL}. We recommend downloading the database and codebook from this single, citable location.

## Team and contact

${TEAM_MEMBERS.map((m) => `- ${m.name} — ${m.role} (${m.url})`).join("\n")}
- With contributions from ${CONTRIBUTORS}.

Is there an initiative we've missed, or do you have feedback on the data or methodology? Use the feedback form linked on the About page (${url("/about/")}) or email ${CONTACT_EMAIL}.
`;
}
