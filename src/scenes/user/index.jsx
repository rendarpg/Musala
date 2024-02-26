import { Alert, Box, Button, Stack, TextField } from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import useMediaQuery from "@mui/material/useMediaQuery";
import Header from "../../components/Header";
import { useState } from "react";
import UserService from "../services/user.service";
import { useNavigate, useParams } from 'react-router-dom';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';

const User = () => {

  const checkoutSchema = yup.object().shape({
    name: yup
      .string()
      .required("The name is required"),
    email: yup
      .string()
      .required("The email is required")
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

  const initialValues = {
    name: "",
    email: "",
    password: ""
  };

  const isNonMobile = useMediaQuery("(min-width:600px)");
  let navigate = useNavigate();

  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  //Backdrop
  const [openBackdrop, setOpenBackdrop] = useState(false);
  const [isLoadingBackdrop, setIsLoadingBackdrop] = useState(false);

  const handleCloseBackdrop = () => {
    if (!isLoadingBackdrop) {
      setOpenBackdrop(false);
    }
  };

  const handleOpenBackdrop = () => {
    setIsLoadingBackdrop(true);
    setOpenBackdrop(true);
  };

  const createUser = async (values, setSubmitting) => {
    const user = {
      name: values.name,
      email: values.email,
      password: values.password,
    };

    await UserService.addUser(user)
      .then(() => {
        navigate('/flights', { replace: true });
      })
      .catch((error) => {
        if (error.response) {
          const resMessage = 'The data provided is incorrect. Please try again';
          setMessage(resMessage);
        } else if (error.request) {
          const resMessage = 'Connection error';
          setMessage(resMessage);
        } else {
          const resMessage = 'Error sending request';
          setMessage(resMessage);
        }
        setLoading(false);
        setSubmitting(false);
      });
  }

  const handleFormSubmit = (values, { setStatus, setSubmitting }) => {
    setStatus();
    createUser(values, setSubmitting)
  };

  return (
    <Box m="20px">
      <Header title='CREATE USER' />

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
              <Box
                display="grid"
                gap="30px"
                gridTemplateColumns="repeat(4, minmax(0, 1fr))"
                sx={{
                  "& > div": { gridColumn: isNonMobile ? undefined : "span 4" },
                }}
              >
                <TextField
                  fullWidth
                  variant="filled"
                  type="text"
                  label="Name"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.name}
                  name="name"
                  error={!!touched.name && !!errors.name}
                  helperText={touched.name && errors.name}
                  sx={{ gridColumn: "span 2" }}
                />
                <TextField
                  fullWidth
                  variant="filled"
                  type="email"
                  label="Email"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.email}
                  name="email"
                  error={!!touched.email && !!errors.email}
                  helperText={touched.email && errors.email}
                  sx={{ gridColumn: "span 2" }}
                />

                <TextField
                  fullWidth
                  variant="filled"
                  type="password"
                  label="Password"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.password}
                  name="password"
                  error={!!touched.password && !!errors.password}
                  helperText={touched.password && errors.password}
                  sx={{ gridColumn: "span 4" }}
                />

              </Box>
              <Box display="flex" justifyContent="end" mt="20px">
                <Button type="submit" color="secondary" variant="contained" disabled={isSubmitting}>
                  {isSubmitting ? "Enviando..." : "Enviar"}
                  <Backdrop
                    sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                    open={isSubmitting}
                    onClick={handleCloseBackdrop}
                  >
                    <CircularProgress color="inherit" />
                  </Backdrop>
                </Button>
              </Box>
              <Box sx={{ mt: 2 }}>
                {message && (
                  <Stack sx={{ width: '100%' }} spacing={2}>
                    <Alert variant="filled" severity="error">
                      {message}
                    </Alert>
                  </Stack>
                )}
              </Box>

            </form>
          )
        }
        }
      </Formik>
    </Box>
  );
};

export default User;