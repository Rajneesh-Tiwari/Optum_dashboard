# Optum Cardio-Metabolic Population Health Demo

An interactive, scroll-driven sales demo for cardio-metabolic population health segmentation targeting Arkansas DSNP/Medicare populations.

## Quick Start

1. Open `index.html` in a modern web browser (Chrome or Edge recommended)
2. Scroll through the 10 sections to explore the demo
3. Click on elements for interactive details

**No server required** - runs completely offline from your local filesystem.

## Features

- **Population Overview**: 4,000 synthetic member population with cost and risk metrics
- **Geographic Map**: Interactive Arkansas county map with multiple data layers
- **Risk Segmentation**: Five distinct cardio-metabolic risk clusters
- **Cluster Deep-Dive**: Detailed analysis with sub-population identification
- **DaVita Insight**: Provider network cost analysis
- **Scenario Simulator**: Interactive intervention modeling with real-time ROI calculations
- **Timeline Projections**: 24-month implementation impact visualization
- **Member Personas**: Representative patient journeys

## Navigation

- Use the dots on the right side to jump between sections
- Keyboard: Arrow Up/Down or Page Up/Down to navigate
- Scroll naturally through the presentation
- Click on map counties, cluster cards, or regions for detailed panels

## Technical Requirements

- Modern web browser (Chrome 90+, Edge 90+, Firefox 88+, Safari 14+)
- Screen width: 1280px minimum (optimized for desktop/laptop presentation)
- JavaScript enabled

## File Structure

```
optum-cardio-metabolic-demo/
├── index.html              # Main entry point
├── css/styles.css          # Custom styles
├── js/
│   ├── data/               # Synthetic data files
│   │   ├── members.js      # 4,000 member records
│   │   ├── clusters.js     # Cluster definitions & summaries
│   │   ├── counties.js     # 75 Arkansas counties
│   │   ├── scenarios.js    # Pre-computed intervention scenarios
│   │   ├── projections.js  # 24-month projections
│   │   ├── interventions.js# Available interventions
│   │   ├── davita.js       # DaVita insight data
│   │   ├── regions.js      # Regional summaries
│   │   └── responses.js    # AI insight text
│   ├── charts/             # Plotly chart modules
│   │   ├── mapChart.js
│   │   ├── populationCharts.js
│   │   ├── clusterCharts.js
│   │   ├── scenarioCharts.js
│   │   └── timelineChart.js
│   ├── components/         # UI components
│   │   ├── navigation.js
│   │   ├── detailPanel.js
│   │   ├── scenarioSimulator.js
│   │   └── llmInsight.js
│   ├── animations/
│   │   └── scrollAnimations.js
│   └── app.js              # Main application
├── lib/                    # External libraries (local copies)
│   ├── tailwind.js
│   ├── plotly-2.27.0.min.js
│   ├── gsap.min.js
│   └── ScrollTrigger.min.js
└── assets/
    └── arkansas.geojson    # County boundaries
```

## Data Notes

All data is synthetic and generated for demonstration purposes:
- Member data includes demographics, clinical markers, utilization, and costs
- Geographic distribution weighted by county population
- Planted data points include DaVita cost disparity and Medicare sub-clusters
- Scenario outcomes are pre-computed for common intervention combinations

## Customization

To modify the demo:
- Edit `js/data/responses.js` to change AI insight text
- Run `python3 generate_data.py` to regenerate synthetic data
- Modify chart appearance in `js/charts/*.js`
- Adjust styling in `css/styles.css`

## Offline Usage

The demo works completely offline:
1. All libraries are bundled locally in `lib/`
2. GeoJSON data is included in `assets/`
3. No external API calls or network requests

For offline presentations, simply copy the entire folder to a USB drive or laptop.

## Support

For questions or issues, contact your Optum representative.
