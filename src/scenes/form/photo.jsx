import { Alert, Box, Button, Stack } from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import useMediaQuery from "@mui/material/useMediaQuery";
import Header from "../../components/Header";
import { useState, useEffect } from "react";
import FlightsService from "../services/flights.service";
import { useNavigate, useParams } from 'react-router-dom';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';

import { Card, CardContent, IconButton } from '@mui/material';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import { styled } from '@mui/system';
import { Helmet } from 'react-helmet';

const StyledAddIcon = styled(AddPhotoAlternateIcon)({
  fontSize: '2em',
  color: '#fff',
  cursor: 'pointer',
});

const Photo = () => {

  const checkoutSchema = yup.object().shape({
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

  const [message, setMessage] = useState('');
  const [loadingForm, setLoadingForm] = useState(false);

  const isNonMobile = useMediaQuery("(min-width:600px)");

  const [imageURL, setImageURL] = useState("");
  const [fileIn, setFileIn] = useState("");
  const [photo, setPhoto] = useState([]);

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
        const response = await FlightsService.getPhoto(id).catch((err) => console.log("Error", err));
        // const response = await fetch(`http://localhost:3000/flights/${id}/photo`);
        console.log("response", response.data.type);
        if (response.data.type === 'text/xml') {
          console.log("imagen");
          const response = await fetch(`http://localhost:3000/flights/${id}/photo`);
          const data = await response.blob();
          console.log("url", URL.createObjectURL(data));
          setFlightPhoto(URL.createObjectURL(data));
          setCameraIcon(true);
        } else {
          console.log("no imagen");
          setCameraIcon(false);
        }
      } catch (error) {
        console.error('Error al obtener la foto del vuelo', error);
      } finally {
        setLoading(false);
      }
    };

    // if (!isAddMode && id) {
    fetchFlightPhoto();
    // }
  }, [id]);

  const handleChoosePhoto = () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.name = 'photo';
    fileInput.accept = 'image/*';
    setFileIn(fileInput)
    console.log("fileInput", fileInput);
    fileInput.addEventListener('change', (e) => {
      const file = e.currentTarget.files[0];
      const imgURL = URL.createObjectURL(file);
      setFlightPhoto(imgURL);
      setPhoto(file);
      setCameraIcon(true);
      console.log("file", file);
    });

    fileInput.click();
  };

  const [isDelete, setIsDelete] = useState(false);

  const handleRemoveImage = () => {
    console.log("handleRemove");
    setCameraIcon(false);
    setFileIn("")
    setPhoto([]);
    setFlightPhoto(null);
    setIsDelete(true)
  };

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
    const formData = new FormData();
    formData.append("code", values.code);
    formData.append("capacity", values.capacity);
    formData.append("departureDate", values.departureDate);
    formData.append("photo", values.img);
    // formData.append("photo", photo);

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

  const updateFlightWithPhoto1 = async (id, values, setSubmitting) => {
    const formData = new FormData();
    formData.append("code", values.code);
    formData.append("capacity", values.capacity);
    formData.append("departureDate", values.departureDate);
    // formData.append("photo", values.img);
    formData.append("photo", photo);

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
    console.log("values", values);
    console.log("photo", photo);
    console.log("fileIn", fileIn);

    if (fileIn === "") {
      console.log("no se ha creado el input", values);
      if (values.img != "") {
        if (photo.length === 0 && isDelete) {
          console.log("updateFlight delete sin foto", values);
          updateFlight(id, values, setSubmitting);
        }
        else {
          console.log("updateFlightWithPhoto", values);
          updateFlightWithPhoto(id, values, setSubmitting);
        }
      } else {
        console.log("updateFlight", values);
        updateFlight(id, values, setSubmitting);
      }
    } else {
      console.log("se ha creado el input", values);
      console.log("updateFlightWithPhoto1", values);
      updateFlightWithPhoto1(id, values, setSubmitting);
    }

    // setTimeout(() => {
    //   navigate('/flights', { replace: true });
    //   setSubmitting(false);
    // }, 2000);
  };

  return (
    <>
      <Helmet>
        <title>Edit photo</title>
      </Helmet>
      <Box m="20px">
        <Header title="Edit photo" />

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
              // if (!isAddMode) {
              // get flight and set form fields
              let objeto = new Object()
              let img = new String()
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

                if (img.trim().length !== 0) {
                  fetch(`http://localhost:3000/flights/${id}/photo`)
                    .then((response) => response.blob())
                    .then((imageBlob) => {
                      // Create a File object from the received Blob
                      const imageFile = new File([imageBlob], objeto.code + '.png', { type: 'image/*' });
                      const updatedValues = {
                        ...objeto,
                        img: imageFile,
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

                </Box>
                <Box display="flex" justifyContent="center" mt="20px" sx={{ width: 300 }}>
                  <Button fullWidth size="large" type="submit" color="secondary" variant="contained" disabled={isSubmitting}>
                    {isSubmitting ? "Editing..." : "Edit"}
                    <Backdrop
                      sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                      open={isSubmitting}
                      onClick={handleCloseBackdrop}
                    >
                      <CircularProgress color="inherit" />
                    </Backdrop>
                  </Button>
                </Box>
                {flightPhoto && (
                  <Box display="flex" justifyContent="center" mt="20px" sx={{ width: 300 }}>
                    <Button fullWidth size="large" color="secondary" variant="contained" disabled={isSubmitting} onClick={handleRemoveImage}>
                      Delete
                      {/* <Backdrop
                      sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                      open={isSubmitting}
                      onClick={handleRemoveImage}
                    >
                      <CircularProgress color="inherit" />
                    </Backdrop> */}
                    </Button>
                  </Box>
                )}
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

export default Photo;