import { useEffect, useState } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';

// third-party
import ReactApexChart from 'react-apexcharts';

// chart options
const areaChartOptions = {
  chart: {
    height: 340,
    type: 'line',
    toolbar: {
      show: false
    }
  },
  dataLabels: {
    enabled: false
  },
  stroke: {
    curve: 'smooth',
    width: 1.5
  },
  grid: {
    strokeDashArray: 4
  },
  xaxis: {
    categories: ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'],
    axisBorder: {
      show: false
    },
    axisTicks: {
      show: false
    }
  },
  yaxis: {
    show: false
  },
  tooltip: {
    x: {
      format: 'MM'
    }
  }
};

// ==============================|| REPORT AREA CHART ||============================== //

export default function ReportAreaChart({ data = [] }) {
  const theme = useTheme();

  const { primary, secondary } = theme.palette.text;
  const line = theme.palette.divider;

  const [options, setOptions] = useState(areaChartOptions);
  const [series, setSeries] = useState([
    {
      name: 'Customer Activity',
      data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    }
  ]);

  useEffect(() => {
    if (data && data.length > 0) {
      const customerData = data.map(item => item.customers || 0);
      
      setSeries([
        {
          name: 'Customer Activity',
          data: customerData
        }
      ]);
    }
  }, [data]);

  useEffect(() => {
    setOptions((prevState) => ({
      ...prevState,
      colors: [theme.palette.primary.main],
      xaxis: {
        ...prevState.xaxis,
        labels: {
          style: {
            colors: Array(12).fill(secondary)
          }
        }
      },
      grid: {
        borderColor: line
      },
      legend: {
        labels: {
          colors: 'grey.500'
        }
      }
    }));
  }, [primary, secondary, line, theme]);

  return <ReactApexChart options={options} series={series} type="line" height={340} />;
}
