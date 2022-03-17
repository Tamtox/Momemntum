//Styles
import './App.scss';
//Dependencies
import {useSelector} from 'react-redux';
import React,{Suspense} from 'react';
import {Route, Routes} from 'react-router-dom';
import type {RootState} from './Store/Store';
import { CssBaseline,ThemeProvider,createTheme,Box } from '@mui/material';
//Components
import Navbar from './Components/UI/Navbar';
import Loading from './Components/Misc/Loading';
import useAuthHooks from './Hooks/useAuthHooks';
import useTodoHooks from './Hooks/useTodoHooks';
import useHabitHooks from './Hooks/useHabitHooks';
import useGoalHooks from './Hooks/userGoalHooks';

const Home = React.lazy(()=> import('./Components/Misc/Home'));
const Auth = React.lazy(()=> import('./Components/Auth/Auth'));
const Profile = React.lazy(()=> import('./Components/Auth/Profile'));
const Todo = React.lazy(()=> import('./Components/Todo/Todo'));
const Journal = React.lazy(()=> import('./Components/Journal/Journal'));
const Habits = React.lazy(()=> import('./Components/Habits/Habits'));
const Goals = React.lazy(()=> import('./Components/Goals/Goals'));

const App:React.FC = () => {
  // Preload data on app start
  useAuthHooks();
  useTodoHooks();
  useHabitHooks();
  useGoalHooks();
  const isLoggedIn:boolean = !!useSelector<RootState>(state=>state.authSlice.token);
  const verificationStatus = useSelector<RootState,string>(state=>state.authSlice.user.emailConfirmationStatus);
  const isDarkMode = useSelector<RootState,boolean|undefined>(state=>state.authSlice.darkMode);
  // MUI Styles Ovveride
  const theme =  createTheme({
    components: {
      MuiContainer: {
        styleOverrides: {
          root:{
            paddingLeft:'5px',
            paddingRight:'5px',
          }
        }
      },
      MuiTypography: {
        styleOverrides: {
          root:{
            lineHeight: "1",
          }
        }
      },
      MuiCard: {
        styleOverrides: {
          root:{
            boxShadow: "0px 1px 2px black",
            lineHeight: "1",
          }
        }
      },
      MuiTextField: {
        styleOverrides: {
          root:{
            fontSize: '1rem',
            width:'calc(min(100%, 100%))',
            height:'36px',
          }
        }
      },
      MuiButton: {
        styleOverrides: {
          root: {
            fontSize: '1rem',
            width:'calc(min(100%, 150px))',
            height:'40px',
            lineHeight: "1",
            textTransform: 'none',
          },
        },
      },
    },
    palette:{
      mode: isDarkMode ? 'dark' : 'light',
      // primary:{
      //     light: "#757ce8",
      //     main: "#3f50b5",
      //     dark: "#002884",
      //     contrastText: "#fff",
      // },
      // secondary: {
      //     light: "#ff7961",
      //     main: "#f44336",
      //     dark: "#ba000d",
      //     contrastText: "#000"
      // }
    }
  })
  return (
    <ThemeProvider theme={theme}>
      <Box className={`app`} sx={{color:'text.primary',display:'flex',justifyContent:'center',alignItems:'center'}}>
        <CssBaseline/>
        <Navbar />
        <Suspense fallback={<Loading height='100vh'/>}>
            <Routes>
              <Route path='/' element={<Home/>} />
              <Route path='/auth' element={isLoggedIn ? <Home/> : <Auth/>} />
              <Route path='/profile' element={isLoggedIn ? (verificationStatus === "Complete" ? <Profile/> : <Home/>) : <Auth/>} />
              <Route path='/todo' element={isLoggedIn ? (verificationStatus === "Complete" ? <Todo/> : <Home/>) : <Auth />} />
              <Route path='/journal' element={isLoggedIn ? (verificationStatus === "Complete" ? <Journal/> : <Home/>) : <Auth/>} />
              <Route path='/habits' element={isLoggedIn ? (verificationStatus === "Complete" ? <Habits/> : <Home/>) : <Auth/>} />
              <Route path='/goals' element={isLoggedIn ? (verificationStatus === "Complete" ? <Goals/> : <Home/>) : <Auth/>} />
            </Routes>
        </Suspense>
      </Box>
    </ThemeProvider>
  );
}

export default App;
