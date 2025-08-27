import { useEffect, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

// material-ui
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import MenuItem from '@mui/material/MenuItem';
import axios from 'axios';
import Select from '@mui/material/Select';

// third party
import * as Yup from 'yup';
import { Formik } from 'formik';

// project import
import AnimateButton from 'components/@extended/AnimateButton';
import { strengthColor, strengthIndicator } from 'utils/password-strength';

// assets
import EyeOutlined from '@ant-design/icons/EyeOutlined';
import EyeInvisibleOutlined from '@ant-design/icons/EyeInvisibleOutlined';

// ============================|| JWT - REGISTER ||============================ //

export default function AuthRegister() {
  const navigate = useNavigate();

  const [level, setLevel] = useState();
  const [showPassword, setShowPassword] = useState(false);

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const changePassword = (value) => {
    const temp = strengthIndicator(value);
    setLevel(strengthColor(temp));
  };

  useEffect(() => {
    changePassword('');
  }, []);

  const handleSubmit = async (values, { setErrors, setStatus, setSubmitting }) => {
    try {
      const response = await axios.post('http://localhost:5000/api/register', values);
      if (response.data.success) {
        localStorage.setItem('userName', values.username); // Store the username in local storage
        localStorage.setItem('userRole', values.role); // Store the role in local storage
        localStorage.setItem('canteenName', response.data.canteenName || ''); // Store canteenName if available
        navigate('/'); // Use navigate instead of window.location.href
        console.log(response.data.message);
      } else {
        setErrors({ submit: response.data.message });
      }
    } catch (error) {
      setErrors({ submit: error.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Formik
        initialValues={{
          firstname: '',
          lastname: '',
          role: '',
          canteenName: '',
          email: '',
          username: '',
          password: '',
          submit: null
        }}
        validationSchema={Yup.object().shape({
          firstname: Yup.string().max(255).required('First Name is required'),
          lastname: Yup.string().max(255).required('Last Name is required'),
          role: Yup.string().required('Role is required'),
          canteenName: Yup.string().when('role', {
            is: 'Canteen Owner', // Directly check if the role is "Canteen Owner"
           // then: Yup.string().required('Canteen Name is required'), // Make canteenName required
           //then: (validationSchema) => validationSchema.required('Canteen Name is required'), 
           then: () => Yup.string().required('Canteen Name is required'),
           //otherwise: Yup.string().notRequired(), // Not required for other roles
           otherwise: () => Yup.string().notRequired(),
          }),
          email: Yup.string().email('Must be a valid email').max(255).required('Email is required'),
          username: Yup.string().max(255).required('Username is required'),
          password: Yup.string().max(255).required('Password is required')
        })} 
        onSubmit={handleSubmit}
      >
        {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }) => (
          <form noValidate onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Stack spacing={1}>
                  <InputLabel htmlFor="firstname-signup">First Name*</InputLabel>
                  <OutlinedInput
                    id="firstname-login"
                    type="firstname"
                    value={values.firstname}
                    name="firstname"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    placeholder="John"
                    fullWidth
                    error={Boolean(touched.firstname && errors.firstname)}
                  />
                </Stack>
                {touched.firstname && errors.firstname && (
                  <FormHelperText error id="helper-text-firstname-signup">
                    {errors.firstname}
                  </FormHelperText>
                )}
              </Grid>
              <Grid item xs={12} md={6}>
                <Stack spacing={1}>
                  <InputLabel htmlFor="lastname-signup">Last Name*</InputLabel>
                  <OutlinedInput
                    fullWidth
                    error={Boolean(touched.lastname && errors.lastname)}
                    id="lastname-signup"
                    type="lastname"
                    value={values.lastname}
                    name="lastname"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    placeholder="Doe"
                    inputProps={{}}
                  />
                </Stack>
                {touched.lastname && errors.lastname && (
                  <FormHelperText error id="helper-text-lastname-signup">
                    {errors.lastname}
                  </FormHelperText>
                )}
              </Grid>

              {/* Role Field */}
              <Grid item xs={12}>
                <Stack spacing={1}>
                  <InputLabel htmlFor="role-signup">Role*</InputLabel>
                  <Select
                    fullWidth
                    error={Boolean(touched.role && errors.role)}
                    id="role-signup"
                    value={values.role}
                    name="role"
                    onBlur={handleBlur}
                    /*onChange={handleChange}*/
                    onChange={(e) => {
                      handleChange(e);
                      if (e.target.value === 'Canteen Owner') {
                        values.canteenName = ''; // Reset canteenName when role changes to Canteen Owner
                      }
                    }}
                    displayEmpty
                  >
                    <MenuItem value="" disabled>
                      Select Role
                    </MenuItem>
                    <MenuItem value="Admin">Admin</MenuItem>
                    <MenuItem value="Canteen Owner">Canteen Owner</MenuItem>
                    <MenuItem value="Medical Officer">Medical Officer</MenuItem>
                  </Select>
                </Stack>
                {touched.role && errors.role && (
                  <FormHelperText error id="helper-text-role-signup">
                    {errors.role}
                  </FormHelperText>
                )}
              </Grid>

              {/* Conditionally render the canteen name field */}
              {values.role === 'Canteen Owner' && (
                <Grid item xs={12}>
                  <Stack spacing={1}>
                    <InputLabel htmlFor="canteen-name-signup">Canteen Name*</InputLabel>
                    <Select
                      fullWidth
                      error={Boolean(touched.canteenName && errors.canteenName)}
                      id="canteen-name-signup"
                      value={values.canteenName}
                      name="canteenName"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      displayEmpty
                    >
                      <MenuItem value="" disabled>
                        Select Canteen Name
                      </MenuItem>
                      <MenuItem value="Goda Uda Canteen">Goda Uda Canteen</MenuItem>
                      <MenuItem value="Goda Yata Canteen">Goda Yata Canteen</MenuItem>
                      <MenuItem value="Wala Canteen">Wala Canteen</MenuItem>
                      <MenuItem value="L Canteen">L Canteen</MenuItem>
                      <MenuItem value="Civil Canteen">Civil Canteen</MenuItem>
                      <MenuItem value="Staff Canteen">Staff Canteen</MenuItem>
                    </Select>
                  </Stack>
                  {touched.canteenName && errors.canteenName && (
                    <FormHelperText error id="helper-text-canteen-name-signup">
                      {errors.canteenName}
                    </FormHelperText>
                  )}
                </Grid>
              )}

              <Grid item xs={12}>
                <Stack spacing={1}>
                  <InputLabel htmlFor="email-signup">Email Address*</InputLabel>
                  <OutlinedInput
                    fullWidth
                    error={Boolean(touched.email && errors.email)}
                    id="email-login"
                    type="email"
                    value={values.email}
                    name="email"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    placeholder="demo@company.com"
                    inputProps={{}}
                  />
                </Stack>
                {touched.email && errors.email && (
                  <FormHelperText error id="helper-text-email-signup">
                    {errors.email}
                  </FormHelperText>
                )}
              </Grid>

              {/* Username Field */}
              <Grid item xs={12}>
                <Stack spacing={1}>
                  <InputLabel htmlFor="username-signup">Username*</InputLabel>
                  <OutlinedInput
                    fullWidth
                    error={Boolean(touched.username && errors.username)}
                    id="username-signup"
                    type="text"
                    value={values.username}
                    name="username"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    placeholder="Username"
                  />
                </Stack>
                {touched.username && errors.username && (
                  <FormHelperText error id="helper-text-username-signup">
                    {errors.username}
                  </FormHelperText>
                )}
              </Grid>

              <Grid item xs={12}>
                <Stack spacing={1}>
                  <InputLabel htmlFor="password-signup">Password</InputLabel>
                  <OutlinedInput
                    fullWidth
                    error={Boolean(touched.password && errors.password)}
                    id="password-signup"
                    type={showPassword ? 'text' : 'password'}
                    value={values.password}
                    name="password"
                    onBlur={handleBlur}
                    onChange={(e) => {
                      handleChange(e);
                      changePassword(e.target.value);
                    }}
                    endAdornment={
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleClickShowPassword}
                          onMouseDown={handleMouseDownPassword}
                          edge="end"
                          color="secondary"
                        >
                          {showPassword ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                        </IconButton>
                      </InputAdornment>
                    }
                    placeholder="******"
                    inputProps={{}}
                  />
                </Stack>
                {touched.password && errors.password && (
                  <FormHelperText error id="helper-text-password-signup">
                    {errors.password}
                  </FormHelperText>
                )}
                <FormControl fullWidth sx={{ mt: 2 }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item>
                      <Box sx={{ bgcolor: level?.color, width: 85, height: 8, borderRadius: '7px' }} />
                    </Grid>
                    <Grid item>
                      <Typography variant="subtitle1" fontSize="0.75rem">
                        {level?.label}
                      </Typography>
                    </Grid>
                  </Grid>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2">
                  By Signing up, you agree to our &nbsp;
                  <Link variant="subtitle2" component={RouterLink} to="#">
                    Terms of Service
                  </Link>
                  &nbsp; and &nbsp;
                  <Link variant="subtitle2" component={RouterLink} to="#">
                    Privacy Policy
                  </Link>
                </Typography>
              </Grid>
              {errors.submit && (
                <Grid item xs={12}>
                  <FormHelperText error>{errors.submit}</FormHelperText>
                </Grid>
              )}
              <Grid item xs={12}>
                <AnimateButton>
                  <Button disableElevation disabled={isSubmitting} fullWidth size="large" type="submit" variant="contained" color="primary">
                    Create Account
                  </Button>
                </AnimateButton>
              </Grid>
            </Grid>
          </form>
        )}
      </Formik>
    </>
  );
}
