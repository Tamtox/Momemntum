//Styles
import './Habits.scss';
//Dependencies
import {useSelector} from 'react-redux';
import React,{ useState,useEffect } from 'react';
import {Container,TextField,Button,Box,Typography,Card} from '@mui/material';
import { DatePicker } from '@mui/lab';
import Cookies from 'js-cookie';
import {HiSwitchVertical} from 'react-icons/hi';
import {FiEdit} from 'react-icons/fi';
import {IoCheckmarkCircleOutline,IoCloseCircleOutline,IoEllipseOutline} from 'react-icons/io5';
//Components
import Loading from '../Misc/Loading';
import AddNewHabit from './Add-new-habit';
import type {RootState} from '../../Store/Store';
import useHabitHooks from '../../Hooks/useHabitHooks';
import useAuthHooks from '../../Hooks/useAuthHooks';

const Habits:React.FC = () => {
    const token = Cookies.get('token');
    const AuthHooks = useAuthHooks();
    const habitHooks = useHabitHooks();
    const loading = useSelector<RootState,boolean>(state=>state.authSlice.loading);
    const isDarkMode = useSelector<RootState,boolean|undefined>(state=>state.authSlice.darkMode);
    const sidebarFull = useSelector<RootState,boolean>(state=>state.authSlice.sidebarFull);
    const sidebarVisible = useSelector<RootState,boolean>(state=>state.authSlice.sidebarVisible);
    const datepickerDate = useSelector<RootState,string>(state=>state.habitsSlice.datepickerDate);
    const habitList = useSelector<RootState,{habitTitle:string,habitTime:string|null,habitCreationDate:string,habitWeekdays:{0:boolean,1:boolean,2:boolean,3:boolean,4:boolean,5:boolean,6:boolean},goalId:string|null,goalTargetDate:string|null,_id:string}[]>(state=>state.habitsSlice.habitList);
    // Date selection and max date for datepicker
    const currentWeekStartTime = new Date().getTime() + 86400000 * (new Date().getDay()? 1 - new Date().getDay() : -6);
    const currentWeekEnd = new Date(new Date(currentWeekStartTime+86400000*6).setHours(23,59,59,999));
    const [selectedDate, setSelectedDate] = useState(new Date(datepickerDate));
    const selectedDateWeekStart = selectedDate.getTime() + 86400000 * (selectedDate.getDay()? 1 - selectedDate.getDay() : -6);
    // Weekday list for labels 
    const weekdaysList = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
    // Set detailed item
    const [detailedHabit,setDetailedItem] = useState();
    // Toggle new/detailed habit
    const [toggleNewHabit,setToggleNewHabit] = useState(false);
    // Toggle Habit List / Habit Entries
    const [habitListMode,setHabitListMode] = useState(false);
    // Load selected date's data
    const loadSelectedDateData = async (newDate:Date|null) => {
        if(newDate === null) {
            newDate = new Date()
        }
        // Load new week date only when week changes
        const selectedWeekStartTime = selectedDate.getTime() + 86400000 * (selectedDate.getDay()? 1 - selectedDate.getDay() : -6);
        const selectedWeekStart = new Date(new Date(selectedWeekStartTime).setHours(0,0,0,0));
        const selectedWeekEnd = new Date(new Date(selectedWeekStartTime+86400000*6).setHours(23,59,59,999));
        if(newDate.getTime()<selectedWeekStart.getTime() || newDate.getTime()> selectedWeekEnd.getTime()) {
            habitHooks.loadHabitsData(newDate)
        }
        setSelectedDate(newDate);
    }
    useEffect(() => {
        if (token) {
            habitList.length<1 && habitHooks.loadHabitsData(new Date());
        } else { 
            AuthHooks.logout();
        }
    }, [])
    return (
        <Container component="main" className={`habits ${sidebarVisible?`page-${sidebarFull?'compact':'full'}`:'page'}`}>
            <Box className={`habit-controls${isDarkMode?'-dark':''}`}>
                <DatePicker 
                inputFormat="dd/MM/yyyy" className={`habit-date-picker date-picker`} desktopModeMediaQuery='@media (min-width:769px)' maxDate={currentWeekEnd}
                renderInput={(props) => <TextField size='small' className={`focus date-picker journal-date`}  {...props} />}
                value={selectedDate} onChange={newDate=>{loadSelectedDateData(newDate);}}
                />
                <Card variant='elevation' className={`habit-list-label`} onClick={()=>{setHabitListMode(!habitListMode)}}>
                    {habitListMode? "Habit List" : `Week : ${new Date(selectedDateWeekStart).toLocaleDateString()} - ${new Date(selectedDateWeekStart+86400000*6).toLocaleDateString()}`}
                    <HiSwitchVertical className='habit-list-label-icon' />
                </Card>
                <Button variant="outlined" className={`add-new-habit button`} onClick={()=>{setToggleNewHabit(!toggleNewHabit)}}>New Habit</Button>
            </Box>
            {loading ? <Loading height='80vh'/> :
            <Box className={`habit habit-${habitListMode ? 'list' : 'entries'} scale-in`}>
                {!habitListMode && 
                <Card variant='elevation' className={`habit-item habit-entry-item`}>
                    <Typography className={`habit-list-item-habit-title`}>Habit</Typography>
                    <Box className={`habit-entries-weekdays`}>
                        {weekdaysList.map(weekday=>{
                            return <Typography className={`habit-entry-weekday`}>{weekday}</Typography>
                        })}
                    </Box>
                </Card>}
                {habitList.map((habitListItem:any)=>{
                    if(habitListMode) {
                        return(
                        <Card variant='elevation' className={`habit-item habit-list-item`} key={habitListItem._id}>
                            <Box className='habit-list-item-icons'>
                                <FiEdit onClick={()=>{setDetailedItem(habitListItem);setToggleNewHabit(!toggleNewHabit)}} className={`icon-interactive detailed-habit-icon`} />
                                <IoCloseCircleOutline onClick={()=>{habitHooks.deleteHabit(habitListItem._id,habitListItem.goalId)}} className={`icon-interactive delete-habit-icon`} />
                            </Box>
                            <Typography className={`habit-list-item-habit-title`}>{habitListItem.habitTitle}</Typography>
                        </Card>)
                    } else {
                        if(habitListItem.habitEntries.length>0) {
                            return (
                                <Card variant='elevation' className={`habit-item habit-entry-item`} key={habitListItem._id}>
                                    <Typography className={`habit-list-item-habit-title`}>{habitListItem.habitTitle}</Typography>
                                    <Box className={`habit-entries-weekdays`}>
                                    {habitListItem.habitEntries.map((habitEntry:any)=>{
                                        return (
                                            <Box key={habitEntry._id} className={`habit-entry-weekday habit-entry-weekday${habitEntry.weekday}`}>
                                                {habitEntry.habitEntryStatus === 'Complete' ? <IoCheckmarkCircleOutline className={`icon-interactive habit-entry-icon ${habitEntry.habitEntryStatus}`} onClick={()=>{habitHooks.changeHabitStatus(habitListItem._id,habitEntry._id,habitEntry.habitEntryStatus)}}/> : <IoEllipseOutline className={`icon-interactive habit-entry-icon ${habitEntry.habitEntryStatus}`} onClick={()=>{habitHooks.changeHabitStatus(habitListItem._id,habitEntry._id,habitEntry.habitEntryStatus)}}/>}
                                            </Box>
                                        )
                                    })}
                                    </Box>
                                </Card>
                            )
                        } else {return null}
                    }
                })}
            </Box>
            } 
            {toggleNewHabit && <AddNewHabit detailedHabit={detailedHabit} setDetailedItem={():any=>{setDetailedItem(undefined)}} returnToHabits={():any=>setToggleNewHabit(false)} />}
        </Container>
    )
}

export default Habits