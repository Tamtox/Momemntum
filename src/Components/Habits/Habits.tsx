//Styles
import './Habits.scss';
//Dependencies
import {useSelector} from 'react-redux';
import React,{ useState,useEffect } from 'react';
import {Container,TextField,Button,Typography,Card,FormControl,InputLabel,Select,MenuItem,OutlinedInput,InputAdornment} from '@mui/material';
import { DatePicker } from '@mui/lab';
import { CgArrowLeft, CgArrowRight } from 'react-icons/cg';
import {IoCheckboxOutline,IoSquareOutline} from 'react-icons/io5';
import { useLocation } from 'react-router-dom';
//Components
import Toolbar from '../UI/Toolbar/Toolbar';
import Loading from '../Misc/Loading';
import AddNewHabit from './Add-new-habit';
import type {RootState} from '../../Store/Store';
import useHabitHooks from '../../Hooks/useHabitHooks';
import type {HabitInterface,HabitEntryInterface} from '../../Misc/Interfaces';

const filterList = (list:any[],sortQuery:string|null,searchQuery:string|null) => {
    if(sortQuery) {
        if (sortQuery === 'dateAsc') { list = list.sort((itemA:HabitInterface,itemB:HabitInterface)=> new Date(itemA.creationDate).getTime() - new Date(itemB.creationDate).getTime()) };
        if (sortQuery === 'dateDesc') { list = list.sort((itemA:HabitInterface,itemB:HabitInterface)=> new Date(itemB.creationDate).getTime() - new Date(itemA.creationDate).getTime()) };
        if (sortQuery === 'noEntries') { list = list.filter((item:HabitInterface)=>item.entries.length<1) };
        if (sortQuery === 'hasEntries') { list = list.filter((item:HabitInterface)=>item.entries.length>0) };
    }
    if(searchQuery) {
        list = list.filter((item:HabitInterface)=>{
            if(item.title.toLowerCase().includes(searchQuery.toLowerCase()) || item._id.includes(searchQuery.toLowerCase())) {
                return item;
            } else {
                return false;
            }
        });
    }
    return list
}

const Habits:React.FC = () => {
    const habitHooks = useHabitHooks();
    const loading = useSelector<RootState,boolean>(state=>state.authSlice.loading);
    const isDarkMode = useSelector<RootState,boolean|undefined>(state=>state.authSlice.darkMode);
    const sidebarFull = useSelector<RootState,boolean>(state=>state.authSlice.sidebarFull);
    const sidebarVisible = useSelector<RootState,boolean>(state=>state.authSlice.sidebarVisible);
    const datepickerDate = new Date(useSelector<RootState,string>(state=>state.habitsSlice.datepickerDate));
    const habitList = useSelector<RootState,HabitInterface[]>(state=>state.habitsSlice.habitList);
    const habitListLoaded = useSelector<RootState,boolean>(state=>state.habitsSlice.habitListLoaded);
    // Sorting by query params
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const [sortQuery,searchQuery] = [queryParams.get('sort'),queryParams.get('search')] 
    const filteredList = filterList([...habitList],sortQuery,searchQuery);
    // Date selection and max date for datepicker
    const currentWeekStartTime = new Date().getTime() + 86400000 * (new Date().getDay()? 1 - new Date().getDay() : -6);
    const currentWeekEnd = new Date(new Date(currentWeekStartTime+86400000*6).setHours(23,59,59,999));
    const datepickerDateWeekStart = datepickerDate.getTime() + 86400000 * (datepickerDate.getDay()? 1 - datepickerDate.getDay() : -6);
    const [selectedDate, setSelectedDate] = useState(new Date(new Date(datepickerDateWeekStart)));
    const [selectedDateWeekEnd, setSelectedDateWeekEnd] = useState(new Date(new Date(datepickerDateWeekStart+86400000*6)));
    // Weekday list for labels 
    const weekdaysList:{[key:string|number]:string} = { 0:'Sun',1:'Mon',2:'Tue',3:'Wed',4:'Thu',5:'Fri',6:'Sat' };
    // Set detailed item
    const [detailedHabit,setDetailedItem] = useState<HabitInterface|undefined>();
    // Toggle new/detailed habit
    const [toggleNewHabit,setToggleNewHabit] = useState(false);
    // Load selected date's data
    const loadSelectedDateData = async (newDate:Date|null) => {
        newDate = newDate || new Date ();
        // Load new week date only when week changes
        const selectedWeekStartTime = selectedDate.setHours(0,0,0,0) + 86400000 * (selectedDate.getDay()? 1 - selectedDate.getDay() : -6);
        const newWeekStartTime = new Date(newDate).setHours(0,0,0,0) + 86400000 * (newDate.getDay()? 1 - newDate.getDay() : -6);
        if(newDate.getTime() < selectedWeekStartTime || newDate.getTime() > new Date(selectedWeekStartTime).setHours(23,59,59,999)) {
            habitHooks.loadHabitsData(new Date(newWeekStartTime))
        }
        setSelectedDate(new Date(newWeekStartTime));
        setSelectedDateWeekEnd(new Date(new Date(newWeekStartTime + 86400000 * 6)));
    }
    useEffect(() => {
        habitListLoaded || habitHooks.loadHabitsData(new Date(new Date().setHours(0,0,0,0) + 86400000 * (new Date().getDay()? 1 - new Date().getDay() : -6)));
    }, [])
    return (
        <Container component="main" className={`habits ${sidebarVisible?`page-${sidebarFull?'compact':'full'}`:'page'}`}>
            <Toolbar mode={'habit'} addNewItem={():any=>{setToggleNewHabit(true)}}/>
            <div className={`habit-week-range${isDarkMode?'-dark':''} scale-in`}>
                    <Button variant='outlined' className={`button habit-date-button`} onClick={()=>{loadSelectedDateData(new Date(selectedDate.getTime() - 86400000 * 7))}}>
                        <CgArrowLeft className='habit-date-icon icon-interactive nav-icon' />
                        <Typography className='habit-date-button-text'>Prev Week</Typography>
                    </Button> 
                    <DatePicker 
                    inputFormat="dd/MM/yyyy" className={`habit-date-picker date-picker`} desktopModeMediaQuery='@media (min-width:769px)' maxDate={currentWeekEnd}
                    renderInput={(props) => <TextField size='small' className={`focus date-picker habit-date`}  {...props} />}
                    value={selectedDate} onChange={newDate=>{loadSelectedDateData(newDate);}}
                    />
                    to
                    <DatePicker 
                    inputFormat="dd/MM/yyyy" className={`habit-date-picker date-picker`} desktopModeMediaQuery='@media (min-width:769px)' maxDate={currentWeekEnd}
                    renderInput={(props) => <TextField size='small' className={`focus date-picker habit-date`}  {...props} />}
                    value={selectedDateWeekEnd} onChange={newDate=>{loadSelectedDateData(newDate);}} disabled
                    />
                    <Button variant='outlined' disabled={selectedDate.getTime() + 86400000 * 7 >= currentWeekEnd.getTime() ? true : false} className={`button habit-date-button`} onClick={()=>{loadSelectedDateData(new Date(selectedDate.getTime() + 86400000 * 7))}}>
                        <Typography className='habit-date-button-text'>Next Week</Typography>
                        <CgArrowRight className='habit-date-icon icon-interactive nav-icon' />
                    </Button> 
                </div>
            {loading ? <Loading height='80vh'/> :
            <div className={`habit-list scale-in`}>
                {filteredList.map((habitListItem:HabitInterface)=>{
                    return(
                        <Card variant='elevation' className={`habit-list-item`} key={habitListItem._id}>
                            <div className={`habit-list-item-title`} onClick={()=>{setDetailedItem(habitListItem);setToggleNewHabit(!toggleNewHabit)}}> 
                                <Typography className={`habit-list-item-title-text`}>{habitListItem.title}</Typography>
                            </div>
                            {habitListItem.entries.length < 1 ? 
                            <Button onClick={()=>{habitHooks.populateHabit(new Date(selectedDate),habitListItem._id)}} className={`populate-week`}>Poplulate with Entries</Button> :
                            <div className={`habit-weekdays`}>
                                {habitListItem.entries.map((habitEntry:HabitEntryInterface)=>{
                                    const isCurrentDay = new Date(habitEntry.date).toLocaleDateString('en-GB') === new Date().toLocaleDateString('en-GB');
                                    return (
                                        <div key={habitEntry._id} className={`habit-weekday`} onClick={()=>{habitHooks.changeHabitStatus(habitListItem._id,habitEntry._id,habitEntry.habitEntryStatus)}}>
                                            <Typography className={`habit-weekday-label ${isCurrentDay && 'current-day'}`}>{weekdaysList[new Date(habitEntry.date).getDay()]}</Typography>
                                            {habitEntry.habitEntryStatus === 'Complete' ? 
                                            <IoCheckboxOutline className={`icon-interactive habit-weekday-icon ${habitEntry.habitEntryStatus}`} /> : 
                                            <IoSquareOutline className={`icon-interactive habit-weekday-icon ${habitEntry.habitEntryStatus}`} />}
                                        </div>
                                    )
                                })}
                            </div>
                            }
                        </Card>
                    )
                })}
            </div>
            } 
            {toggleNewHabit && <AddNewHabit detailedHabit={detailedHabit} setDetailedItem={():any=>{setDetailedItem(undefined)}} returnToHabits={():any=>setToggleNewHabit(false)} />}
        </Container>
    )
}

export default Habits