import { Alert, Box, Button, Stack, TextField } from "@mui/material";
import { Formik, Field, ErrorMessage } from "formik";
import * as yup from "yup";
import useMediaQuery from "@mui/material/useMediaQuery";
import Header from "../../components/Header";
import { useState, useEffect } from "react";
import FlightsService from "../services/flights.service";
import { useNavigate, useParams } from 'react-router-dom';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';

import { Card, CardContent, Typography, IconButton } from '@mui/material';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import { styled } from '@mui/system';
import { Helmet } from 'react-helmet';

const StyledAddIcon = styled(AddPhotoAlternateIcon)({
  fontSize: '2em',
  color: '#fff',
  cursor: 'pointer',
});

const Form = () => {

  const checkoutSchema = yup.object().shape({
    code: yup
      .string()
      .required("The code is required")
      .matches(/^[a-zA-Z]{6}$/, "The code must contain 6 uppercase or lowercase letters")
      .test('is-unique', 'This code has already been used', async function (value) {
        const res = await FlightsService.getFlights().catch((err) => console.log("Error", err));
        const tmp = res.data.resources
        for (let i = 0; i < tmp.length; i++) {
          if (isAddMode) {
            if (tmp[i].code === value) {
              return false
            }
          } else {
            if (tmp[i].code === value && tmp[i].id === id) {
              return true
            }
          }
        }
        return true
      }),
    capacity: yup.number()
      .required("Capacity is required")
      .min(1, "The minimum capacity is 1").max(200, "The maximum capacity is 200"),
    photo: yup.mixed().test('fileType', 'Only images allowed', (value) => {
      if (value) {
        return value && ['image/jpeg', 'image/png', 'image/gif'].includes(value.type);
      }
      return true;
    })
  });

  const initialValues = {
    code: "",
    capacity: 0,
    departureDate: "",
    photo: ""
  };

  const { id } = useParams();
  const isAddMode = !id;

  const [message, setMessage] = useState('');
  const [loadingForm, setLoadingForm] = useState(false);

  const isNonMobile = useMediaQuery("(min-width:600px)");

  const [imageURL, setImageURL] = useState("");
  const [isEditPhoto, setIsEditPhoto] = useState(false);
  const [fileIn, setFileIn] = useState({});
  const [photo, setPhoto] = useState({});
  const [loadPhoto, setLoadPhoto] = useState(false);

  let navigate = useNavigate();

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

  const [flightPhoto, setFlightPhoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showCameraIcon, setCameraIcon] = useState(false);

  useEffect(() => {
    const fetchFlightPhoto = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:3000/flights/${id}/photo`);
        if (response.ok) {
          const data = await response.blob();
          setFlightPhoto(URL.createObjectURL(data));
          setCameraIcon(true);
        }
      } catch (error) {
        console.error('Error al obtener la foto del vuelo', error);
      } finally {
        setLoading(false);
      }
    };

    if (!isAddMode && id) {
      fetchFlightPhoto();
    }
  }, [isAddMode, id]);

  const handleChoosePhoto = () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.name = 'photo';
    fileInput.accept = 'image/*';
    setFileIn(fileInput);
    console.log("fileInput", fileInput);

    fileInput.addEventListener('change', (e) => {
      const file = e.currentTarget.files[0];
      const imgURL = URL.createObjectURL(file);
      setFileIn(file);
      setFlightPhoto(imgURL);
      setCameraIcon(true);
      setLoadPhoto(true);
      console.log("file", file);
    });
    fileInput.click();
  };

  const createFlight = async (values, setSubmitting) => {
    const flight = {
      code: values.code,
      capacity: values.capacity,
      departureDate: values.departureDate,
    };
    await FlightsService.addFlight(flight)
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
        setLoadingForm(false);
        setSubmitting(false);
      });
  }

  const createFlightWithPhoto = async (values, setSubmitting) => {
    const formData = new FormData();
    formData.append("code", values.code);
    formData.append("capacity", values.capacity);
    formData.append("departureDate", values.departureDate);
    formData.append("photo", fileIn);
    // formData.append("photo", photo);

    await FlightsService.addFlightWithPhoto(formData)
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
        setLoadingForm(false);
        setSubmitting(false);
      });
  }

  const updateFlight = async (id, values, setSubmitting) => {
    const flight = {
      code: values.code,
      capacity: values.capacity,
      departureDate: values.departureDate,
    };

    await FlightsService.updateFlight(id, flight)
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
        setLoadingForm(false);
        setSubmitting(false);
      });
  }

  const updateFlightWithPhoto = async (id, values, setSubmitting) => {

    console.log("selectedImg", values);
    const formData = new FormData();

    formData.append("code", values.code);
    formData.append("capacity", values.capacity);
    formData.append("departureDate", values.departureDate);

    formData.append('photo', values.img);

    await FlightsService.updateFlightWithPhoto(id, formData)
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
        setLoadingForm(false);
        setSubmitting(false);
      });
  }

  const handleFormSubmit = (values, { setStatus, setSubmitting }) => {
    setStatus();
    console.log("photo", photo);
    console.log("values", values);
    console.log("fileIn", fileIn);
    if (isAddMode) {
      if (loadPhoto) {
        // if (values.photo != "") {
        createFlightWithPhoto(values, setSubmitting)
      } else {
        createFlight(values, setSubmitting)
      }
    } else {
      // if (fileIn.isEmpty != {}) {
      if (values.img != "") {
        updateFlightWithPhoto(id, values, setSubmitting);
      } else {
        updateFlight(id, values, setSubmitting);
      }
    }
    // setTimeout(() => {
    //   navigate('/flights', { replace: true });
    //   setSubmitting(false);
    // }, 2000);
  };
  // const handleFormSubmit = (values, { setStatus, setSubmitting }) => {
  //   setStatus();
  //   if (isAddMode) {
  //     if (values.photo != "") {
  //       createFlightWithPhoto(values, setSubmitting)
  //     } else {
  //       createFlight(values, setSubmitting)
  //     }
  //   } else {
  //     if (values.img != "") {
  //       updateFlightWithPhoto(id, values, setSubmitting);
  //     } else {
  //       updateFlight(id, values, setSubmitting);
  //     }
  //   }
  //   // setTimeout(() => {
  //   //   navigate('/flights', { replace: true });
  //   //   setSubmitting(false);
  //   // }, 2000);
  // };

  return (
    <>
      <Helmet>
        <title>{isAddMode ? 'Create Flight' : 'Edit Flight'}</title>
      </Helmet>
      <Box m="20px">
        <Header title={isAddMode ? 'CREATE FLIGHT' : 'EDIT FLIGHT'} subtitle={isAddMode ? 'Create a new flight' : 'Edit a flight'} />

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
            useEffect(() => {
              let objeto = new Object()
              let img = new String()
              if (!isAddMode) {
                // get flight and set form fields
                FlightsService.getFlightById(id).then(f => {
                  const fields = ['id', 'img', 'status', 'code', 'capacity', 'departureDate'];
                  fields.forEach(field => setFieldValue(field, f[field], false));
                  objeto.id = f.data.id
                  objeto.img = f.data.img
                  objeto.status = f.data.status
                  objeto.code = f.data.code
                  objeto.capacity = f.data.capacity
                  objeto.departureDate = f.data.departureDate
                  img = f.data.img
                  setValues(f.data);

                  // const handleView = async (id) => {
                  if (img.trim().length !== 0) {
                    fetch(`http://localhost:3000/flights/${id}/photo`)
                      .then((response) => response.blob()) // Convertir la respuesta a un objeto Blob
                      .then((imageBlob) => {
                        // Crear un objeto File a partir del Blob recibido
                        const imageFile = new File([imageBlob], objeto.code + '.png', { type: 'image/*' });
                        const updatedValues = {
                          ...objeto, // Mantén las demás propiedades iguales
                          img: imageFile, // Actualiza solamente el campo 'photo' con la nueva ruta de la imagen
                        };
                        setValues(updatedValues);
                        console.log("updatedValues", updatedValues);
                        console.log('Imagen como archivo:', imageFile);
                      })
                      .catch((error) => {
                        console.error('Error to get image:', error);
                      });
                  }
                });

              }

              // };

            }, []);

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
                    label="Code"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.code}
                    name="code"
                    error={!!touched.code && !!errors.code}
                    helperText={touched.code && errors.code}
                    sx={{ gridColumn: "span 2" }}
                  />
                  <TextField
                    fullWidth
                    variant="filled"
                    type="number"
                    label="Capacity"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.capacity}
                    name="capacity"
                    error={!!touched.capacity && !!errors.capacity}
                    helperText={touched.capacity && errors.capacity}
                    sx={{ gridColumn: "span 2" }}
                  />

                  <TextField
                    fullWidth
                    variant="filled"
                    type="date"
                    label="Departure of Date"
                    InputLabelProps={{ shrink: true, required: true }}
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.departureDate}
                    name="departureDate"
                    error={!!touched.departureDate && !!errors.departureDate}
                    helperText={touched.departureDate && errors.departureDate}
                    sx={{ gridColumn: "span 4" }}
                  />

                  {
                    isAddMode &&
                    (
                      <Card sx={{ width: 300, bgcolor: 'background.default' }}>

                        <CardContent style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#ccc', position: 'relative' }}>
                          {loading ? (
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
                              <CircularProgress />
                            </div>
                          ) : flightPhoto ? (
                            <>
                              <img src={flightPhoto} alt="Flight photo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              {showCameraIcon && (
                                <IconButton
                                  style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
                                  onClick={handleChoosePhoto}

                                >
                                  <PhotoCameraIcon style={{ color: '#fff' }} />
                                </IconButton>
                              )}
                            </>
                          ) : (
                            <IconButton
                              style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
                              onClick={handleChoosePhoto}

                            >
                              <StyledAddIcon />
                            </IconButton>
                          )}
                        </CardContent>

                      </Card>
                    )
                  }
                  {/* {
                    isAddMode &&
                    (
                      <div>
                        <label htmlFor="photo">Photo:</label>
                        <Field
                          name="photo"
                          render={({ field, form }) => (
                            <input
                              id="photo"
                              name="photo"
                              type="file"
                              onBlur={handleBlur}
                              onChange={(event) => {
                                setFieldValue("photo", event.currentTarget.files[0]);
                                setImageURL(URL.createObjectURL(event.currentTarget.files[0]));
                              }}
                            />
                          )}
                        />
                        {imageURL && <img src={imageURL} alt="Vista previa de la imagen" style={{ maxWidth: 200, maxHeight: 200 }} />}
                        <ErrorMessage name="photo" component="div" />
                      </div>
                    )
                  } */}

                </Box>
                <Box display="flex" justifyContent="start" mt="20px">
                  <Button type="submit" color="secondary" variant="contained" disabled={isSubmitting}>
                    {isSubmitting ? "Sending..." : "Send"}
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
    </>

  );
};




export default Form;