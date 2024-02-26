import React, { useState } from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import UserService from '../scenes/services/user.service'
import { Formik } from 'formik';
import * as yup from "yup";
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardMedia } from '@mui/material';
import Alert from '@mui/material/Alert';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { Helmet } from 'react-helmet';

const defaultTheme = createTheme();

const SignIn = () => {

  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const [open, setOpen] = useState(true);

  const initialValues = {
    email: "",
    password: ""
  };

  const checkoutSchema = yup.object().shape({
    email: yup
      .string()
      .required("Email is required")
      .email("Please enter a valid email"),
    password: yup
      .string()
      .required("Password is required")
      .min(8, 'Password must be 8 characters long')
      .matches(/[0-9]/, 'Password requires a number')
      .matches(/[a-z]/, 'Password requires a lowercase letter')
      .matches(/[A-Z]/, 'Password requires an uppercase letter')
      .matches(/[^\w]/, 'Password requires a symbol'),
  });

  let navigate = useNavigate();

  const login = async (values, setSubmitting) => {
    const user = {
      email: values.email,
      password: values.password,
    };
    await UserService.login(user.email, user.password)
      .then(() => {
        navigate('/flights', { replace: true });
      })
      .catch((error) => {
        // Manejar errores de solicitud
        if (error.response) {
          // Error en respuesta de la API
          const resMessage = 'Incorrect credentials. The username or password is not correct';
          // resetForm();
          setMessage(resMessage);
        } else if (error.request) {
          // No recibió respuesta de la API (error de conexión)
          const resMessage = 'Connection error';
          setMessage(resMessage);
        } else {
          // Error en la configuración de la solicitud
          const resMessage = 'Error sending request';
          setMessage(resMessage);
        }
        setLoading(false);
        setSubmitting(false);
      });
  }

  const handleFormSubmit = async (values, { setStatus, setSubmitting, resetForm }) => {
    setStatus()
    const user = {
      email: values.email,
      password: values.password,
    };
    await UserService.login(user.email, user.password)
      .then(() => {
        navigate('/flights', { replace: true });
      })
      .catch((error) => {
        if (error.response) {
          const resMessage = 'Incorrect credentials. The username or password is not correct';
          resetForm();
          setMessage(resMessage);
          setOpen(true);
        } else if (error.request) {
          const resMessage = 'Connection error';
          resetForm();
          setMessage(resMessage);
          setOpen(true);
        } else {
          const resMessage = 'Error sending request';
          resetForm();
          setMessage(resMessage);
          setOpen(true);
        }
        setLoading(false);
        setSubmitting(false);
      });
  };

  return (
    <>
      <Helmet>
        <title>Sign in</title>
      </Helmet>
      <ThemeProvider theme={defaultTheme}>
        <Container component="main" maxWidth="xs">
          <CssBaseline />
          <Box
            sx={{
              marginTop: 8,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            {/* <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
            <LockOutlinedIcon />
          </Avatar> */}

            <Formik
              onSubmit={handleFormSubmit}
              initialValues={initialValues}
              validationSchema={checkoutSchema}
            >
              {({
                values,
                errors,
                touched,
                handleBlur,
                handleChange,
                handleSubmit,
                setFieldValue,
                setValues,
                isSubmitting
              }) => {

                return (
                  <form onSubmit={handleSubmit}>
                    <Grid
                      container
                      spacing={2}>
                      <Grid item xs={12}>
                        <Card sx={{ boxShadow: "0 19px 38px rgba(0,0,0,0.30), 0 15px 12px rgba(0,0,0,0.22)", borderRadius: '14px', bgcolor: "#ffffff", maxHeight: '100%', maxWidth: '100%', p: 8 }}>
                          <Typography sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }} component="h1" variant="h3">
                            Welcome
                          </Typography>
                          <Box sx={{ mt: 1 }}>

                            <TextField
                              margin="normal"
                              required
                              fullWidth
                              id="email"
                              label="Email"
                              value={values.email}
                              name="email"
                              error={!!touched.email && !!errors.email}
                              helperText={touched.email && errors.email}
                              autoComplete="email"
                              autoFocus
                              onBlur={handleBlur}
                              onChange={handleChange}
                            />
                            <TextField
                              margin="normal"
                              required
                              fullWidth
                              value={values.password}
                              name="password"
                              error={!!touched.password && !!errors.password}
                              helperText={touched.password && errors.password}
                              label="Password"
                              type="password"
                              id="password"
                              autoComplete="current-password"
                              onBlur={handleBlur}
                              onChange={handleChange}
                            />
                            {/* <FormControlLabel
                      control={<Checkbox value="remember" color="primary" />}
                      label="Remember me"
                    /> */}
                            <Button
                              type="submit"
                              fullWidth
                              variant="contained"
                              color="primary"
                              size="large"
                              disabled={loading}
                              sx={{ mt: 3, mb: 2, height: '45px' }}
                            >
                              Sign In
                            </Button>
                            <Box sx={{ mt: 2 }}>
                              {message && (
                                <Collapse in={open}>
                                  <Alert variant="filled" severity="error"
                                    action={
                                      <IconButton
                                        aria-label="close"
                                        color="inherit"
                                        size="small"
                                        onClick={() => {
                                          setOpen(false);
                                        }}
                                      >
                                        <CloseIcon fontSize="inherit" />
                                      </IconButton>
                                    }
                                    sx={{ mb: 2 }}
                                  >
                                    {message}
                                  </Alert>
                                </Collapse>
                              )}
                            </Box>
                            {/* <Grid container>
                      <Grid item xs>
                        <Link href="#" variant="body2">
                          Forgot password?
                        </Link>
                      </Grid>
                      <Grid item>
                        <Link href="#" variant="body2">
                          {"Don't have an account? Sign Up"}
                        </Link>
                      </Grid>
                    </Grid> */}
                          </Box>
                        </Card>
                      </Grid>
                    </Grid>
                  </form>
                )
              }
              }
            </Formik>

          </Box>

        </Container>
      </ThemeProvider>
    </>
  );
}

export default SignIn;