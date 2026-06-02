function getOrCreateChartTip(): HTMLDivElement {
  const existing = document.getElementById("chart-tip");
  if (existing instanceof HTMLDivElement) {
    return existing;
  }

  const chartTip = document.createElement("div");
  chartTip.id = "chart-tip";
  chartTip.className = "maptip";
  chartTip.style.position = "fixed";
  document.body.appendChild(chartTip);
  return chartTip;
}

export function initChartTabs(rootId: string): void {
  const root = document.getElementById(rootId);
  if (!root) return;

  const buttons = [...root.querySelectorAll<HTMLButtonElement>("[data-tab]")];
  const panels = [...root.querySelectorAll<HTMLElement>("[data-panel]")];

  for (const button of buttons) {
    button.addEventListener("click", () => {
      const key = button.dataset.tab;
      for (const tab of buttons) {
        tab.classList.toggle("on", tab === button);
      }
      for (const panel of panels) {
        panel.classList.toggle("on", panel.dataset.panel === key);
      }
    });
  }
}

export function bindChartTooltips(root: ParentNode = document): void {
  const chartTip = getOrCreateChartTip();

  root.querySelectorAll<SVGElement>("[data-tip]").forEach((el) => {
    if (el.dataset.tooltipBound === "1") {
      return;
    }

    el.dataset.tooltipBound = "1";
    el.addEventListener("mousemove", (ev) => {
      chartTip.innerHTML = el.dataset.tip || "";
      chartTip.style.left = `${ev.clientX + 14}px`;
      chartTip.style.top = `${ev.clientY + 14}px`;
      chartTip.style.opacity = "1";
    });
    el.addEventListener("mouseout", () => {
      chartTip.style.opacity = "0";
    });
  });
}
