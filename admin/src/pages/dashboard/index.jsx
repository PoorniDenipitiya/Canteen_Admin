// react
import { useEffect, useState } from 'react';

// material-ui
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';

// project import
import MainCard from 'components/MainCard';
import AnalyticEcommerce from 'components/cards/statistics/AnalyticEcommerce';
import MonthlyBarChart from './MonthlyBarChart';
import ReportAreaChart from './ReportAreaChart';

// config
import config from 'config/appConfig';

// Third-party for charts
import ReactApexChart from 'react-apexcharts';

// ==============================|| DASHBOARD - CANTEEN OWNER ||============================== //

export default function DashboardDefault() {
  const [dashboardData, setDashboardData] = useState({
    customers: { total: 0 },
    orders: { total: 0 },
    refundOrders: 0,
    finedOrders: 0,
    complaints: 0,
    salesHistory: [],
    customerActivity: []
  });
  const [adminData, setAdminData] = useState({
    complaintsByCanteen: [],
    complaintTypes: [],
    actions: [],
    categories: [],
    foods: [],
    canteenNames: []
  });
  const [medicalOfficerData, setMedicalOfficerData] = useState({
    actions: [],
    complaintsByCanteen: []
  });
  const [loading, setLoading] = useState(true);

  const canteenName = localStorage.getItem('canteenName') || '';
  const userRole = localStorage.getItem('userRole') || '';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const baseUrl = config.api_base_urls.admin;
        const userBaseUrl = config.api_base_urls.user;

        if (userRole === 'Canteen Owner') {
          if (!canteenName) {
            setLoading(false);
            return;
          }

          const dashRes = await fetch(`${baseUrl}/api/admin/orders/dashboard/${encodeURIComponent(canteenName)}`);
          if (!dashRes.ok) throw new Error(`Dashboard API error: ${dashRes.status}`);
          const dashJson = await dashRes.json();

          const compRes = await fetch(`${baseUrl}/api/complaints/canteen/${encodeURIComponent(canteenName)}`);
          if (!compRes.ok) throw new Error(`Complaints API error: ${compRes.status}`);
          const complaints = await compRes.json();

          const processed = processCanteenData(dashJson, complaints);
          setDashboardData(processed);

        } else if (userRole === 'Admin') {
          // Fetch all complaints, categories and foods for admin
          const complaintsRes = await fetch(`${userBaseUrl}/api/complaints/all`, { withCredentials: true });
          if (!complaintsRes.ok) throw new Error('Failed to fetch complaints');
          const allComplaints = await complaintsRes.json();

          const categoriesRes = await fetch(`${baseUrl}/api/categories`);
          if (!categoriesRes.ok) throw new Error('Failed to fetch categories');
          const categories = await categoriesRes.json();

          const foodsRes = await fetch(`${baseUrl}/api/foods`);
          if (!foodsRes.ok) throw new Error('Failed to fetch foods');
          const foods = await foodsRes.json();

          const processed = processAdminData(allComplaints, categories, foods);
          setAdminData(processed);

        } else if (userRole === 'Medical Officer') {
          // Fetch complaints for medical officer
          const complaintsRes = await fetch(`${userBaseUrl}/api/complaints/all`, { withCredentials: true });
          if (!complaintsRes.ok) throw new Error('Failed to fetch complaints');
          const allComplaints = await complaintsRes.json();

          const processed = processMedicalOfficerData(allComplaints);
          setMedicalOfficerData(processed);
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('Dashboard load error', e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [canteenName, userRole]);

  const processCanteenData = (dash, complaints) => {
    const totalCustomers = dash.totalCustomers || 0;
    const salesHistory = (dash.monthlyData || []).map((m) => ({ name: m.month, sales: m.sales }));
    const customerActivity = (dash.monthlyData || []).map((m) => ({ name: m.month, customers: m.customers }));
    const refundOrders = complaints.filter(
      (c) => c.action === 'Refund' && ['MO Investigation Completed', 'Investigation Completed', 'Complaint Closed'].includes(c.status)
    ).length;

    return {
      customers: { total: totalCustomers },
      orders: { total: dash.totalOrders || 0 },
      refundOrders,
      finedOrders: dash.finedOrders || 0,
      complaints: complaints.length || 0,
      salesHistory,
      customerActivity
    };
  };

  const processAdminData = (complaints, categories, foods) => {
    // Complaints by canteen
    const complaintsByCanteen = {};
    complaints.forEach(complaint => {
      complaintsByCanteen[complaint.canteenName] = (complaintsByCanteen[complaint.canteenName] || 0) + 1;
    });

    // Complaint types
    const complaintTypes = {};
    complaints.forEach(complaint => {
      complaintTypes[complaint.complaintType] = (complaintTypes[complaint.complaintType] || 0) + 1;
    });

    // Actions
    const actions = { Refund: 0, Reject: 0, Pending: 0 };
    complaints.forEach(complaint => {
      if (complaint.action === 'Refund') actions.Refund++;
      else if (complaint.action === 'Reject') actions.Reject++;
      else actions.Pending++;
    });

    // Food items with canteen and categories list
    const canteenNamesSet = new Set();
    const foodRows = (foods || []).map(f => {
      if (f.canteen) canteenNamesSet.add(f.canteen);
      return { canteen: f.canteen || '-', category: f.category || '-', food: f.food || f.name || '-', price: f.price };
    });

    return {
      complaintsByCanteen: Object.entries(complaintsByCanteen).map(([name, count]) => ({ name, count })),
      complaintTypes: Object.entries(complaintTypes).map(([type, count]) => ({ type, count })),
      actions: Object.entries(actions).map(([action, count]) => ({ action, count })),
      categories: categories.map(c => ({ category: c.name || c.categoryName || '-' })),
      foods: foodRows,
      canteenNames: Array.from(canteenNamesSet)
    };
  };

  const processMedicalOfficerData = (complaints) => {
    // Filter complaints that were ever assigned to MO
    const moComplaintIds = JSON.parse(localStorage.getItem('moComplaintIds') || '[]');
    const moComplaints = complaints.filter(c => moComplaintIds.includes(c._id || c.id));

    // Actions taken by MO
    const actions = { Refund: 0, Reject: 0, Pending: 0 };
    moComplaints.forEach(complaint => {
      if (complaint.action === 'Refund') actions.Refund++;
      else if (complaint.action === 'Reject') actions.Reject++;
      else actions.Pending++;
    });

    // Complaints by canteen for MO
    const complaintsByCanteen = {};
    moComplaints.forEach(complaint => {
      complaintsByCanteen[complaint.canteenName] = (complaintsByCanteen[complaint.canteenName] || 0) + 1;
    });

    return {
      actions: Object.entries(actions).map(([action, count]) => ({ action, count })),
      complaintsByCanteen: Object.entries(complaintsByCanteen).map(([name, count]) => ({ name, count }))
    };
  };

  // Chart options for pie charts
  const pieChartOptions = {
    chart: {
      type: 'pie',
      height: 350
    },
    legend: {
      position: 'bottom'
    },
    responsive: [{
      breakpoint: 480,
      options: {
        chart: {
          width: 200
        }
      }
    }]
  };

  // Chart options for bar charts
  const barChartOptions = {
    chart: {
      type: 'bar',
      height: 350
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '55%',
      }
    },
    dataLabels: {
      enabled: false
    },
    xaxis: {
      categories: []
    }
  };

  if (loading) {
    return (
      <Grid container rowSpacing={4.5} columnSpacing={2.75}>
        <Grid item xs={12} sx={{ mb: -2.25 }}>
          <Typography variant="h5">Loading Dashboard...</Typography>
        </Grid>
      </Grid>
    );
  }

  // Medical Officer Dashboard
  if (userRole === 'Medical Officer') {
    return (
      <Grid container rowSpacing={4.5} columnSpacing={2.75}>
        <Grid item xs={12} sx={{ mb: -2.25 }}>
          <Typography variant="h5">Medical Officer Dashboard</Typography>
        </Grid>

        {/* Actions Pie Chart */}
        <Grid item xs={12} md={6}>
          <MainCard title="Actions Taken" content={false}>
            <Box sx={{ p: 3 }}>
              <ReactApexChart
                options={{
                  ...pieChartOptions,
                  labels: medicalOfficerData.actions.map(item => item.action)
                }}
                series={medicalOfficerData.actions.map(item => item.count)}
                type="pie"
                height={350}
              />
            </Box>
          </MainCard>
        </Grid>

        {/* Complaints by Canteen Bar Chart */}
        <Grid item xs={12} md={6}>
          <MainCard title="Complaints by Canteen" content={false}>
            <Box sx={{ p: 3 }}>
              <ReactApexChart
                options={{
                  ...barChartOptions,
                  xaxis: {
                    categories: medicalOfficerData.complaintsByCanteen.map(item => item.name)
                  }
                }}
                series={[{
                  name: 'Complaints',
                  data: medicalOfficerData.complaintsByCanteen.map(item => item.count)
                }]}
                type="bar"
                height={350}
              />
            </Box>
          </MainCard>
        </Grid>
      </Grid>
    );
  }

  // Admin Dashboard
  if (userRole === 'Admin') {
    return (
      <Grid container rowSpacing={4.5} columnSpacing={2.75}>
        <Grid item xs={12} sx={{ mb: -2.25 }}>
          <Typography variant="h5">Admin Dashboard</Typography>
        </Grid>

        {/* Complaints by Canteen Pie Chart */}
        <Grid item xs={12} md={6}>
          <MainCard title="Complaints by Canteen" content={false}>
            <Box sx={{ p: 3 }}>
              <ReactApexChart
                options={{
                  ...pieChartOptions,
                  labels: adminData.complaintsByCanteen.map(item => item.name)
                }}
                series={adminData.complaintsByCanteen.map(item => item.count)}
                type="pie"
                height={350}
              />
            </Box>
          </MainCard>
        </Grid>

        {/* Actions Pie Chart */}
        <Grid item xs={12} md={6}>
          <MainCard title="Actions Overview" content={false}>
            <Box sx={{ p: 3 }}>
              <ReactApexChart
                options={{
                  ...pieChartOptions,
                  labels: adminData.actions.map(item => item.action)
                }}
                series={adminData.actions.map(item => item.count)}
                type="pie"
                height={350}
              />
            </Box>
          </MainCard>
        </Grid>

        {/* Complaint Types Bar Chart */}
        <Grid item xs={12} md={6}>
          <MainCard title="Complaint Types" content={false}>
            <Box sx={{ p: 3 }}>
              <ReactApexChart
                options={{
                  ...barChartOptions,
                  xaxis: {
                    categories: adminData.complaintTypes.map(item => item.type)
                  }
                }}
                series={[{
                  name: 'Count',
                  data: adminData.complaintTypes.map(item => item.count)
                }]}
                type="bar"
                height={350}
              />
            </Box>
          </MainCard>
        </Grid>

        {/* Foods table with filter by canteen */}
        <Grid item xs={12}>
          <MainCard title="Foods by Canteen">
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Canteen</InputLabel>
                  <Select
                    label="Canteen"
                    value={adminData.selectedCanteen || 'all'}
                    onChange={(e) => {
                      const selected = e.target.value;
                      setAdminData((prev) => ({ ...prev, selectedCanteen: selected }));
                    }}
                  >
                    <MenuItem value="all">All Canteens</MenuItem>
                    {adminData.canteenNames.map((name) => (
                      <MenuItem key={name} value={name}>{name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Box sx={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #eee' }}>Canteen</th>
                    <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #eee' }}>Category</th>
                    <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #eee' }}>Food Item</th>
                    <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #eee' }}>Price (Rs.)</th>
                  </tr>
                </thead>
                <tbody>
                  {(adminData.foods || [])
                    .filter(row => (adminData.selectedCanteen && adminData.selectedCanteen !== 'all') ? row.canteen === adminData.selectedCanteen : true)
                    .map((row, idx) => (
                      <tr key={`${row.canteen}-${row.food}-${idx}`}>
                        <td style={{ padding: '8px', borderBottom: '1px solid #f5f5f5' }}>{row.canteen}</td>
                        <td style={{ padding: '8px', borderBottom: '1px solid #f5f5f5' }}>{row.category}</td>
                        <td style={{ padding: '8px', borderBottom: '1px solid #f5f5f5' }}>{row.food}</td>
                        <td style={{ padding: '8px', borderBottom: '1px solid #f5f5f5' }}>{row.price}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </Box>
          </MainCard>
        </Grid>
      </Grid>
    );
  }

  // Canteen Owner Dashboard
  if (userRole === 'Canteen Owner') {
    if (!canteenName) {
      return (
        <Grid container rowSpacing={4.5} columnSpacing={2.75}>
          <Grid item xs={12} sx={{ mb: -2.25 }}>
            <Typography variant="h5">Dashboard</Typography>
          </Grid>
          <Grid item xs={12}>
            <MainCard>
              <Typography variant="h6" color="text.secondary" align="center">
                No canteen information found. Please log in as a canteen owner.
              </Typography>
            </MainCard>
          </Grid>
        </Grid>
      );
    }

    return (
      <Grid container rowSpacing={4.5} columnSpacing={2.75}>
        <Grid item xs={12} sx={{ mb: -2.25 }}>
          <Typography variant="h5">Canteen Owner Dashboard</Typography>
        </Grid>

        {/* key metrics */}
        <Grid item xs={12} sm={6} md={4} lg={2.4}>
          <AnalyticEcommerce title="Customers" count={dashboardData.customers.total.toString()} color="primary" />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2.4}>
          <AnalyticEcommerce title="Orders" count={dashboardData.orders.total.toString()} color="secondary" />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2.4}>
          <AnalyticEcommerce title="Refund Orders" count={dashboardData.refundOrders.toString()} color="warning" />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2.4}>
          <AnalyticEcommerce title="Fined Orders" count={dashboardData.finedOrders.toString()} color="error" />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg={2.4}>
          <AnalyticEcommerce title="Complaints" count={dashboardData.complaints.toString()} color="info" />
        </Grid>

        {/* charts */}
        <Grid item xs={12} md={6}>
          <MainCard title="Sales History" content={false}>
            <Box sx={{ p: 3 }}>
              <MonthlyBarChart data={dashboardData.salesHistory} />
            </Box>
          </MainCard>
        </Grid>
        <Grid item xs={12} md={6}>
          <MainCard title="Overall Customers Activity" content={false}>
            <Box sx={{ p: 3 }}>
              <ReportAreaChart data={dashboardData.customerActivity} />
            </Box>
          </MainCard>
        </Grid>
      </Grid>
    );
  }

  // Default fallback
  return (
    <Grid container rowSpacing={4.5} columnSpacing={2.75}>
      <Grid item xs={12} sx={{ mb: -2.25 }}>
        <Typography variant="h5">Dashboard</Typography>
      </Grid>
      <Grid item xs={12}>
        <MainCard>
          <Typography variant="h6" color="text.secondary" align="center">
            Please log in to view your dashboard.
          </Typography>
        </MainCard>
      </Grid>
    </Grid>
  );
}

