import { Badge, Box, IconButton, ListItemIcon, ListItemText, MenuItem, MenuList, Tooltip, useTheme } from "@mui/material";
import { useContext } from "react";
import { ColorModeContext, tokens } from "../../theme";
import InputBase from "@mui/material/InputBase";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import EmailIcon from "@mui/icons-material/Email";
import UserIcon from "@mui/icons-material/Login";
import SearchIcon from "@mui/icons-material/Search";
import AuthService from '../services/user.service';
import { useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';

const Topbar = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const colorMode = useContext(ColorModeContext);

  const navigate = useNavigate();

  const usuario = JSON.parse(localStorage.getItem('user'));

  const user = {
    avatar: PersonOutlinedIcon,
    email: usuario ? usuario.email : '',
    id: usuario ? usuario.id : '',
    name: usuario ? usuario.name : '',
    refreshToken: usuario ? usuario.passsword : '',
    token: usuario ? usuario.token : ''
  };

  // const [currentUser, setCurrentUser] = useState([]);

  // const getCurrentUser = async () => {
  //   const response = await AuthService.currentUser().catch((err) => console.log("Error", err));
  //   setCurrentUser(response.data);
  //   console.log("currentUser", response.data);
  // }

  // useEffect(() => {
  //   getCurrentUser();
  // }, [])

  const handleLogout = () => {
    AuthService.logout()
    navigate('/login', { replace: true });
  };

  return (
    <Box display="flex" justifyContent="flex-end" p={2}>
      {/* SEARCH BAR */}
      {/* <Box
        display="flex"
        backgroundColor={colors.primary[400]}
        borderRadius="3px"
      >
        <InputBase sx={{ ml: 2, flex: 1 }} placeholder="Search" />
        <IconButton type="button" sx={{ p: 1 }}>
          <SearchIcon />
        </IconButton>
      </Box> */}

      {/* ICONS */}
      <Box display="flex">
        <IconButton onClick={colorMode.toggleColorMode}>
          {theme.palette.mode === "dark" ? (
            <DarkModeOutlinedIcon />
          ) : (
            <LightModeOutlinedIcon />
          )}
        </IconButton>

        <Tooltip title={
          <MenuList>
            <MenuItem>
              <ListItemIcon>
                <AccountCircleIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>{user.name}</ListItemText>
            </MenuItem>
            <MenuItem>
              <ListItemIcon>
                <EmailIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>{user.email}</ListItemText>
            </MenuItem>
          </MenuList>
        } arrow>
          <IconButton color="inherit">

            <PersonOutlinedIcon />

          </IconButton>
        </Tooltip>
        <IconButton onClick={handleLogout}>
          <LogoutOutlinedIcon />
        </IconButton>
      </Box>
    </Box>
  );
};

export default Topbar;
