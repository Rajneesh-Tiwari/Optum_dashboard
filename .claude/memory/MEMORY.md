# Optum Dashboard - Project Memory

## Stack
- React 18 + TypeScript, Vite 5, Tailwind CSS 4, ECharts (full bundle via echarts-for-react)
- Single-file output via `vite-plugin-singlefile` -> `dist/index.html` (~2MB)
- `dist/index.html` is committed to repo (not gitignored) for non-tech sharing
- Branch: `react-rebuild` merged to `main`
- 6 clusters, 500 members, 40+ features per member

## Architecture
See [architecture.md](architecture.md) for full file map and component details.

## Key Decisions
- No cluster references in Page 1 (Population Overview) takeaways - population-level only
- Chat ("Insights Copilot") is page-aware (3 queries per page) and cluster-aware on Page 3
- Takeaways are reactive to user selections (feature group, highlighted cluster, active tab)
- Use full echarts bundle (not tree-shaken echarts/core) to avoid missing component crashes
- Binary feature charts show % flagged per cluster (not stacked grey "Not Flagged" bars)
- Smart bucketing for age, costs, distances, visit counts, risk scores in Feature Explorer
- Removed `member_id` and `state` from feature explorer (useless visualizations)
- Copilot name: "Insights Copilot" (not "Clinical AI Assistant" - avoid clinical assertions)
- Toggle button: "Copilot" with star icon (not "Ask AI")
- Chat responses include citation sources (PubMed, CMS, Optum Internal, USRDS, etc.)
- Legend fixes: short cluster names (C1: At-Risk, etc.) + scroll type for all legends
- `dist/index.html` committed to repo so non-tech users can download ZIP and open directly

## Lessons Learned
- echarts tree-shaken imports (`echarts/core`) cause white page crashes - always use full bundle
- `member_id` is a string, not numeric - `getFeatureValues` must handle categorical features
- `verbatimModuleSyntax` in tsconfig requires `import { type X }` for type-only imports
- After pre-commit hook failure, always create NEW commit (never --amend)

## TODO - Next Features

### Cluster Migration Animation (Priority)
Show how members in lower-risk clusters will migrate to higher-risk clusters if no intervention is applied. Concept:
- Visual: animated flow/sankey or particle animation showing member movement between clusters over time
- Data: pre-compute a 12-24 month projection of cluster transitions (e.g. 20% of Cluster 2 -> Cluster 3/4 without intervention)
- Location: deeper in the app, possibly a sub-view of Page 3 or a new Page 4 "Projection"
- Narrative tie-in: chat responses already reference progression timelines
- Could show before/after: current state vs projected state with/without intervention
