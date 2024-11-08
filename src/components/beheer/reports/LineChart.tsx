import dynamic from 'next/dynamic'
import { useEffect } from "react";

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });// https://stackoverflow.com/a/68844119

const LineChart = () => {
  useEffect(() => {

  }, []);

  const chart_data = {
    options: {
      chart: {
        id: "line-chart",
        zoom: {
          enabled: true
        },
        toolbar: {
          show: true
        }
      },
      // colors: ['#77B6EA', '#545454'],
      dataLabels: {
        enabled: false,
      },
      stroke: {
        // curve: 'smooth'
      },
      title: {
        text: 'Aantal afgeronde transacties per dag',
        align: 'left'
      },
      grid: {
        borderColor: '#e7e7e7',
        row: {
          colors: ['#f3f3f3', 'transparent'], // takes an array which will be repeated on columns
          opacity: 0.5
        },
      },
      markers: {
        // size: 1
      },
      xaxis: {
        categories: ['ma', 'di', 'wo', 'do', 'vr', 'za', 'zo'],
        title: {
          text: 'Weekdag',
          align: 'left'
        }
      },
      yaxis: {
        title: {
          text: 'Aantal afgeronde transacties'
        },
        // min: 5,
        // max: 40
      },
      legend: {
        position: 'right',
        horizontalAlign: 'center',
        // floating: true,
        offsetY: 25,
        // offsetX: -5
      }
    },
    series: [
      {
        name: "Concordiastraat",
        data: [40, 17, 348, 0, 5, 129, 12]
      },
      {
        name: "Turfschip",
        data: [43, 20, 327, 0, 1, 134, 11]
      },
      {
        name: "Oude Vest",
        data: [63, 23, 504, 6, 7, 130, 13]
      },
      {
        name: "Nieuwstraat",
        data: [100, 44, 768, 7, 13, 232, 36]
      },
      {
        name: "Haven",
        data: [99, 42, 876, 9, 15, 207, 50]
      },
    ]
  };

  return (
    <div className="app">
      <div className="row">
        <div className="mixed-chart">
          <Chart
            options={chart_data.options}
            series={chart_data.series}
            type="line"
            width="100%"
            height="500"
          />
        </div>
      </div>
    </div>
  );
}

export default LineChart;
