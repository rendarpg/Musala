import React, { useEffect, useState } from 'react';
import { Box, Card, CardContent, CardHeader, FormControl, FormHelperText, Grid, InputAdornment, InputLabel, LinearProgress, OutlinedInput, Typography, useMediaQuery } from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import { useTheme } from "@mui/material";
import FlightsService from "../services/flights.service";
import { useLocation, useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import FindIcon from '@mui/icons-material/FindInPage';
import Fab from '@mui/material/Fab';
import { Formik, Field, ErrorMessage } from "formik";
// import { IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import { IconButton, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@mui/material';
import { TextField } from '@mui/material';
import { AccountCircle } from '@mui/icons-material';
import { Helmet } from 'react-helmet';
import CircularProgress from '@mui/material/CircularProgress';

const Flights = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  let navigate = useNavigate();

  const [flights, setFlights] = useState([]);
  const [selection, setSelection] = useState([]);

  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(5);

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedFlightId, setSelectedFlightId] = useState(null);

  const [open, setOpen] = useState(false);
  const [openPhoto, setOpenPhoto] = useState(false);
  const [imageURL, setImageURL] = useState("");
  const [selectedImg, setSelectedImg] = useState("");

  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const initialCode = searchParams.get('code') || '';

  const [code, setCode] = useState(initialCode);
  const [filteredRows, setFilteredRows] = useState([]);
  const [timeoutId, setTimeoutId] = useState(null);

  const usuario = JSON.parse(localStorage.getItem('user'));

  const user = {
    // avatar: AccountCircleIcon,
    email: usuario ? usuario.email : '',
    id: usuario ? usuario.id : '',
    name: usuario ? usuario.name : '',
    refreshToken: usuario ? usuario.passsword : '',
    token: usuario ? usuario.token : ''
  };

  useEffect(() => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    const id = setTimeout(() => {
      const filteredRows = flights.filter(row => row.code.toLowerCase().includes(code.toLowerCase()));
      setFilteredRows(filteredRows);

      const params = new URLSearchParams();
      if (code) {
        params.set('code', code);
      } else {
        params.delete('code');
      }
      navigate({ search: params.toString() });
    }, 500); // wait 500 milliseconds after the user finishes typing

    setTimeoutId(id);

    return () => {
      clearTimeout(id);
    };
  }, [code, navigate, flights]);

  const handleModelCange = (model, details) => {
    setCurrentPage(model.page)
    setPageSize(model.pageSize)
    const current = model.page + 1
    const page = pageSize
    navigate(`/flights?page=${current}&size=${model.pageSize}`);
  };

  const handleRowClick = (params, event) => {
    const target = event.target;
    const isActionIcon = target.classList.contains('action-icon') || target.tagName.toLowerCase() === 'a';
    if (isActionIcon) {
      // El clic se realizó en un icono de acción, no realizar la redirección
      return;
    }
    const { code } = params.row;
    const current = currentPage + 1
    const page = pageSize
    navigate(`/flights?page=${current}&size=${page}&code=${code}`)
  };

  const handleSearchChange = (e) => {
    const inputCode = e.target.value;
    if (/^[a-zA-Z]*$/.test(inputCode)) {
      setCode(inputCode);
    } else {
      setCode('');
    }
  };

  const handleView = async (id) => {
    try {
      const response = await fetch(`http://localhost:3000/flights/${id}/photo`);
      console.log("response", response);
      if (response.ok) {
        const imgData = await response.blob();
        const imgUrl = URL.createObjectURL(imgData);
        setSelectedImg(imgUrl);
        setOpen(true);
      } else {
        console.error("Error al obtener la imagen");
      }
    } catch (error) {
      console.error("Error al obtener la imagen", error);
    }
  };

  const handleEditPhoto = async (event, id) => {
    event.stopPropagation();
    navigate(`/fligths/edit-photo/${id}`);
    console.log(id);
  };

  const handleClose = () => {
    setOpen(false);
  };
  const handleClosePhoto = () => {
    setOpenPhoto(false);
  };

  const handleEdit = (event, id) => {
    // if (!isSmallScreen && !isMediumScreen) {
    event.stopPropagation();
    // }
    navigate(`/fligths/edit/${id}`);
    console.log(id);
  };

  const handleDelete = (id) => {
    setSelectedFlightId(id);
    setOpenDeleteDialog(true);
  };

  const confirmDelete = async () => {
    console.log("Eliminar vuelo con ID:", selectedFlightId);
    setOpenDeleteDialog(false);
    deleteFlight(selectedFlightId);
  };

  const cancelDelete = () => {
    setOpenDeleteDialog(false);
  };

  const deleteFlight = async (id) => {
    await FlightsService.deleteFlight(id).then(
      (response) => {
        setFlights(
          flights.filter(
            (el) => el.id !== id
          )
        );
      }
    );
  };

  const getFlights = async () => {
    const response = await FlightsService.getFlights().catch((err) => console.log("Error", err));
    if (response && response.data) {
      setFlights(response.data.resources);
    }
  };

  const handleAddFlightClick = () => {
    navigate('/flights/add-flights', { replace: true })
  }

  useEffect(() => {
    getFlights();
  }, [])

  const columns = [
    { field: "code", headerName: "Code" },
    {
      field: "capacity",
      headerName: "Capacity",
      flex: 1,
      cellClassName: "name-column--cell",
    },
    {
      field: "departureDate",
      headerName: "Departure of Date",
      flex: 1,
      cellClassName: "name-column--cell",
    },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      cellClassName: "name-column--cell",
      renderCell: (params) => {
        if (params.row.status === "processing") {
          return (
            <Box sx={{ display: 'flex' }}>
              <CircularProgress />
            </Box>
          );
        }
      },
    },
    {
      field: "view",
      headerName: "View",
      // width: 150,
      renderCell: (params) => {
        if (params.row.img != "") {
          return (
            <div>
              <IconButton aria-label="Buscar" onClick={() => handleView(params.row.id)}>
                <SearchIcon />
              </IconButton>
            </div>
          );
        }
      },
    },
    {
      field: "Edit image",
      headerName: "Edit image",
      // width: 150,
      renderCell: (params) => {
        if (params.row.img != "") {
          return (
            <div>
              <IconButton aria-label="Edit image" onClick={(event) => handleEditPhoto(event, params.row.id)}>
                <PhotoCameraIcon />
              </IconButton>
            </div>
          );
        } else {
          return (
            <div>
              <IconButton aria-label="Add image" onClick={(event) => handleEditPhoto(event, params.row.id)}>
                <AddPhotoAlternateIcon />
              </IconButton>
            </div>
          );
        }
      },
    },
    {
      field: "actions",
      headerName: "Actions",
      // width: 150,
      renderCell: (params) => {
        return (
          <div>
            <IconButton className="action-icon" aria-label="Editar" onClick={(event) => handleEdit(event, params.row.id)}>
              <EditIcon />
            </IconButton>
            <IconButton className="action-icon" aria-label="Eliminar" onClick={() => handleDelete(params.row.id)}>
              <DeleteIcon />
            </IconButton>
          </div>
        );
      },
    },
  ];

  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const isMediumScreen = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  return (
    <>
      <Helmet>
        <title>Flights</title>
      </Helmet>
      <Box m="20px">
        <Header
          title="FLIGHTS"
          subtitle="List of flights"
        />

        <Box
          m="40px 0 0 0"
          height="75vh"
          sx={{
            "& .MuiDataGrid-root": {
              border: "none",
            },
            "& .MuiDataGrid-cell": {
              borderBottom: "none",
            },
            "& .name-column--cell": {
              color: colors.greenAccent[300],
            },
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: colors.blueAccent[700],
              borderBottom: "none",
            },
            "& .MuiDataGrid-virtualScroller": {
              backgroundColor: colors.primary[400],
            },
            "& .MuiDataGrid-footerContainer": {
              borderTop: "none",
              backgroundColor: colors.blueAccent[700],
            },
            "& .MuiCheckbox-root": {
              color: `${colors.greenAccent[200]} !important`,
            },
            "& .MuiDataGrid-toolbarContainer .MuiButton-text": {
              color: `${colors.grey[100]} !important`,
            },
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', flexFlow: 'wrap' }}>
            <FormControl fullWidth sx={{ mb: 2, width: "20vh" }}>
              <InputLabel htmlFor="label-search">Search by code</InputLabel>
              <OutlinedInput
                error={code !== '' && filteredRows.length === 0}
                helperText={code !== '' && filteredRows.length === 0 ? 'There are no results for this code' : ''}
                labelId="label-search"
                endAdornment={
                  <InputAdornment position="end">
                    <SearchIcon />
                  </InputAdornment>
                }
                label="Search by code"
                margin="normal"
                onChange={handleSearchChange}
                value={code}
                variant="outlined"
              />
              <FormHelperText error sx={{ mx: 2 }}>{code !== '' && filteredRows.length === 0 ? 'There are no results for this code' : ''}</FormHelperText>
            </FormControl>

            <Fab sx={{ mb: 2 }} color="secondary" aria-label="add" onClick={handleAddFlightClick}>
              <AddIcon />
            </Fab>
          </Box>

          {
            isSmallScreen &&
            (
              <Grid container spacing={2} alignItems="center">
                {filteredRows.map((item) => (
                  // {flights.map((item) => (
                  <Grid item key={item.id} xs={12}>
                    <Card sx={{ bgcolor: "##1a1818", width: "100%" }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-around' }}>
                          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                            <Typography sx={{ mb: 4 }} variant="h6" gutterBottom>Code: {item.code}</Typography>
                            <Typography sx={{ mb: 4 }} variant="body1" gutterBottom>Capacity: {item.capacity}</Typography>
                            <Typography sx={{ mb: 4 }} variant="body1" gutterBottom>Departure Date: {item.departureDate}</Typography>
                            <Typography sx={{ mb: 4 }} variant="body1" gutterBottom>Status: {item.status}</Typography>
                          </Box>

                          <Box >
                            <Grid container spacing={2} sx={{ display: 'flex', flexDirection: 'column', flexFlow: 'no wrap', justifyContent: 'flex-start', alignItems: 'flex-end' }}>
                              <Grid item>
                                {
                                  (item.img != '') &&
                                  (<IconButton aria-label="Buscar" onClick={() => handleView(item.id)}>
                                    <SearchIcon />
                                  </IconButton>)
                                }
                              </Grid>

                              <Grid item>
                                {
                                  (item.img != '') ?
                                    (
                                      <IconButton aria-label="Edit photo" onClick={(event) => handleEditPhoto(event, item.id)}>
                                        <PhotoCameraIcon />
                                      </IconButton>
                                    )
                                    :
                                    (
                                      <IconButton aria-label="Add photo" onClick={(event) => handleEditPhoto(event, item.id)}>
                                        <AddPhotoAlternateIcon />
                                      </IconButton>
                                    )
                                }
                              </Grid>
                              <Grid item>
                                <IconButton>
                                  <EditIcon onClick={(event) => handleEdit(event, item.id)} />
                                </IconButton>
                              </Grid>
                              <Grid item>
                                <IconButton>
                                  <DeleteIcon onClick={() => handleDelete(item.id)} />
                                </IconButton>
                              </Grid>
                            </Grid>
                          </Box>
                        </Box>

                      </CardContent>


                    </Card>
                  </Grid>
                ))}
              </Grid>
            )
          }

          {
            isMediumScreen &&
            (
              <Grid container spacing={2} alignItems="center">
                {filteredRows.map((item) => (
                  // {flights.map((item) => (
                  <Grid item key={item.id} xs={12} md={12}>
                    <Card sx={{ bgcolor: "#1a1818", width: "100%" }}>
                      <CardContent sx={{ color: '#ededed', display: 'flex', flexFlow: 'no wrap', justifyContent: 'space-around', p: 2, mb: 2 }}>
                        <CardHeader
                          subheaderTypographyProps={{ color: 'white' }}
                          subheader={item.code}
                          title="Code"
                        />
                        <CardHeader
                          subheaderTypographyProps={{ color: 'white' }}
                          subheader={item.capacity}
                          title="Capacity"
                        />
                        <CardHeader
                          subheaderTypographyProps={{ color: 'white' }}
                          subheader={item.departureDate}
                          title="Departure Date"
                        />
                        <CardHeader
                          subheaderTypographyProps={{ color: 'white' }}
                          subheader={item.status}
                          title="Status"
                        />
                        <Grid item>
                          {
                            (item.img != '') &&
                            (<IconButton sx={{ color: '#ededed' }} aria-label="Buscar" onClick={() => handleView(item.id)}>
                              <SearchIcon />
                            </IconButton>)
                          }
                        </Grid>
                        <Grid item >
                          {
                            (item.img != '') ?
                              (
                                <IconButton sx={{ color: '#ededed' }} aria-label="Edit photo" onClick={(event) => handleEditPhoto(event, item.id)}>
                                  <PhotoCameraIcon />
                                </IconButton>
                              )
                              :
                              (
                                <IconButton sx={{ color: '#ededed' }} aria-label="Add photo" onClick={(event) => handleEditPhoto(event, item.id)}>
                                  <AddPhotoAlternateIcon />
                                </IconButton>
                              )
                          }
                          <IconButton sx={{ color: '#ededed' }} aria-label="Editar" onClick={(event) => handleEdit(event, item.id)}>
                            <EditIcon />
                          </IconButton>
                          <IconButton sx={{ color: '#ededed' }} aria-label="Eliminar" onClick={() => handleDelete(item.id)}>
                            <DeleteIcon />
                          </IconButton>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )
          }

          {
            (!isSmallScreen && !isMediumScreen) &&
            (
              <div>
                <DataGrid
                  rows={filteredRows}
                  // rows={flights}
                  columns={columns}
                  components={{ Toolbar: GridToolbar }}
                  initialState={{
                    pagination: { paginationModel: { pageSize: 5 } },
                  }}
                  pageSizeOptions={[5, 10, 25]}
                  onRowClick={handleRowClick}
                  onPaginationModelChange={handleModelCange}
                />
              </div>
            )
          }

          <Dialog open={open} onClose={handleClose}>
            <DialogTitle>Image selected</DialogTitle>
            <DialogContent>
              <DialogContentText>
                <img src={selectedImg} alt="Imagen seleccionada" />
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose} color="primary">
                Cerrar
              </Button>
            </DialogActions>
          </Dialog>

          <Dialog open={openPhoto} onClose={handleClosePhoto}>
            <DialogTitle>Image</DialogTitle>
            <DialogContent>
              <DialogContentText>
                <div>
                  <label htmlFor="photo">Photo:</label>
                  {/* <Field */}
                  {/* name="photo" */}
                  {/* render={({ field, form }) => ( */}
                  <input
                    id="photo"
                    name="photo"
                    type="file"
                    // onBlur={handleBlur}
                    onChange={(event) => {
                      setFieldValue("photo", event.currentTarget.files[0]);
                      setImageURL(URL.createObjectURL(event.currentTarget.files[0]));
                    }}
                  />
                  {/* )} */}
                  {/* /> */}
                  {imageURL && <img src={imageURL} alt="Vista previa de la imagen" style={{ maxWidth: 200, maxHeight: 200 }} />}
                  {/* <ErrorMessage name="photo" component="div" /> */}
                </div>
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClosePhoto} color="primary">
                Cerrar
              </Button>
            </DialogActions>
          </Dialog>

          <Dialog open={openDeleteDialog} onClose={cancelDelete}>
            <DialogTitle>Delete Flight</DialogTitle>
            <DialogContent>
              <DialogContentText>Are you sure you want to delete this flight?</DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={cancelDelete} color="primary">Cancel</Button>
              <Button onClick={confirmDelete} color="secondary">Yes</Button>
            </DialogActions>
          </Dialog>

        </Box>
      </Box>
    </>
  );
};

export default Flights;

