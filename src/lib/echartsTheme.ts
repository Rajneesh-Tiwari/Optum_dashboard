import * as echarts from "echarts"

// Shared light-mode chart colors for use in chart components
export const CHART_COLORS = {
  axisLabel: "#64748B",
  axisLine: "#CBD5E1",
  splitLine: "#E2E8F0",
  titleText: "#0F172A",
  tooltipBg: "rgba(255, 255, 255, 0.96)",
  tooltipBorder: "#E2E8F0",
  tooltipText: "#0F172A",
  legendText: "#64748B",
  legendPageIcon: "#64748B",
}

const optumLight = {
  color: [
    "#89BEC0",
    "#B0A5D4",
    "#E8BA98",
    "#8CB8D8",
    "#D8A8B8",
    "#A8C8A0",
    "#C4B08C",
    "#C09CC0",
  ],
  backgroundColor: "transparent",
  textStyle: {
    color: CHART_COLORS.axisLabel,
  },
  title: {
    textStyle: { color: CHART_COLORS.titleText, fontSize: 14, fontWeight: 600 },
    subtextStyle: { color: CHART_COLORS.axisLabel },
  },
  legend: {
    textStyle: { color: CHART_COLORS.legendText },
  },
  tooltip: {
    backgroundColor: CHART_COLORS.tooltipBg,
    borderColor: CHART_COLORS.tooltipBorder,
    textStyle: { color: CHART_COLORS.tooltipText },
  },
  categoryAxis: {
    axisLine: { lineStyle: { color: CHART_COLORS.axisLine } },
    axisTick: { lineStyle: { color: CHART_COLORS.axisLine } },
    axisLabel: { color: CHART_COLORS.axisLabel },
    splitLine: { lineStyle: { color: CHART_COLORS.splitLine } },
  },
  valueAxis: {
    axisLine: { lineStyle: { color: CHART_COLORS.axisLine } },
    axisTick: { lineStyle: { color: CHART_COLORS.axisLine } },
    axisLabel: { color: CHART_COLORS.axisLabel },
    splitLine: { lineStyle: { color: CHART_COLORS.splitLine } },
  },
}

let registered = false

export function registerTheme() {
  if (!registered) {
    echarts.registerTheme("optumLight", optumLight)
    registered = true
  }
}

export { echarts }
