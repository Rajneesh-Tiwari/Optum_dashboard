import * as echarts from "echarts"

const optumDark = {
  color: [
    "#FF612B",
    "#EF4444",
    "#F97316",
    "#EAB308",
    "#22C55E",
    "#3B82F6",
    "#8B5CF6",
    "#EC4899",
  ],
  backgroundColor: "transparent",
  textStyle: {
    color: "#94a3b8",
  },
  title: {
    textStyle: { color: "#f1f5f9", fontSize: 14, fontWeight: 600 },
    subtextStyle: { color: "#94a3b8" },
  },
  legend: {
    textStyle: { color: "#94a3b8" },
  },
  tooltip: {
    backgroundColor: "rgba(15, 23, 42, 0.95)",
    borderColor: "#334155",
    textStyle: { color: "#f1f5f9" },
  },
  categoryAxis: {
    axisLine: { lineStyle: { color: "#334155" } },
    axisTick: { lineStyle: { color: "#334155" } },
    axisLabel: { color: "#94a3b8" },
    splitLine: { lineStyle: { color: "#1e293b" } },
  },
  valueAxis: {
    axisLine: { lineStyle: { color: "#334155" } },
    axisTick: { lineStyle: { color: "#334155" } },
    axisLabel: { color: "#94a3b8" },
    splitLine: { lineStyle: { color: "#1e293b" } },
  },
}

let registered = false

export function registerTheme() {
  if (!registered) {
    echarts.registerTheme("optumDark", optumDark)
    registered = true
  }
}
