"use client";

import { useEffect, useRef } from "react";
import {
  createChart,
  ColorType,
  LineStyle,
  LineSeries,
  AreaSeries,
} from "lightweight-charts";

export default function Chart() {
  const chartContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chartContainerRef.current) {
      const chart = createChart(chartContainerRef.current, {
        layout: {
          background: { type: ColorType.Solid, color: "transparent" },
          textColor: "#d1d5db",
        },
        grid: {
          vertLines: {
            color: "rgba(42, 46, 57, 0.5)",
            style: LineStyle.Dotted,
          },
          horzLines: {
            color: "rgba(42, 46, 57, 0.5)",
            style: LineStyle.Dotted,
          },
        },
        width: chartContainerRef.current.clientWidth,
        height: chartContainerRef.current.clientHeight, // Adjust to be dynamic
      });

      // Create a line series and configure it as an area chart
      const lineSeries = chart.addSeries(LineSeries, {
        color: "#26a69a", // Line color
        lineWidth: 2,
        crosshairMarkerVisible: false, // Hide crosshair markers if not needed
      });

      // Sample data with converted time (Unix timestamp)
      const data = [
        { time: new Date("2024-01-01").toLocaleDateString("en-CA"), value: 10 },
        { time: new Date("2024-01-02").toLocaleDateString("en-CA"), value: 12 },
        { time: new Date("2024-01-03").toLocaleDateString("en-CA"), value: 18 },
        { time: new Date("2024-01-04").toLocaleDateString("en-CA"), value: 15 },
        { time: new Date("2024-01-05").toLocaleDateString("en-CA"), value: 22 },
        { time: new Date("2024-01-06").toLocaleDateString("en-CA"), value: 20 },
        { time: new Date("2024-01-07").toLocaleDateString("en-CA"), value: 25 },
        { time: new Date("2024-01-08").toLocaleDateString("en-CA"), value: 24 },
        { time: new Date("2024-01-09").toLocaleDateString("en-CA"), value: 30 },
        { time: new Date("2024-01-10").toLocaleDateString("en-CA"), value: 28 },
      ];

      // Add the line series with the data
      lineSeries.setData(data);

      // Add area series with color options (top and bottom colors)
      const areaSeries = chart.addSeries(AreaSeries, {
        lineColor: "#26a69a",
        topColor: "#26a69a20",
        bottomColor: "transparent",
        lineWidth: 2,
      });

      // Use the same data for the area series
      areaSeries.setData(data);

      // Fit the chart content
      chart.timeScale().fitContent();

      const handleResize = () => {
        if (chartContainerRef.current) {
          chart.applyOptions({
            width: chartContainerRef.current.clientWidth,
            height: chartContainerRef.current.clientHeight,
          });
        }
      };

      window.addEventListener("resize", handleResize);

      return () => {
        chart.remove();
        window.removeEventListener("resize", handleResize);
      };
    }
  }, []);

  return (
    <div className="w-full h-full">
      <div ref={chartContainerRef} className="w-full h-full" />
    </div>
  );
}
