"use client";

import dynamic from 'next/dynamic'
import { useEffect, useState } from "react";

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });// https://stackoverflow.com/a/68844119
// const ApexCharts: any = dynamic(() => import('react-apexcharts'), { ssr: false });// https://stackoverflow.com/a/70010953
// https://github.com/apexcharts/react-apexcharts/issues/526#issuecomment-1735973058

// After state change of parent component, the graph data is gone.
// I tried: https://github.com/apexcharts/react-apexcharts/issues/180

const LineChart = ({
  options,
  series,
  type,
  style
}: {
  options: object,
  series: Array<any>,
  type: 'line',
  style?: object
}) => {
  const [chartData, setChartData] = useState<{
    options?: object,
    series?: Array<any>
  }>({})

  useEffect(() => {
    setChartData({
      options: options,
      series: series
    });
  }, [
    // options,
    // series
  ]);

  return (
    <div>
      {chartData.options && <Chart
        options={chartData.options}
        series={chartData.series}
        type={type}
        height={360 + Math.floor(Math.random() * 2) + 1}
      />}
    </div>
  )
}

export default LineChart;
