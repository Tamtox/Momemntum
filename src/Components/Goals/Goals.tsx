// Styles
import './Goals.scss';
// Components
import Loading from '../Misc/Loading';
import {RootState} from '../../Store/Store';
import AddNewGoal from './Add-new-goal';
import useGoalHooks from '../../Hooks/userGoalHooks';
// Dependencies
import {useSelector} from 'react-redux';
import React,{useState,useEffect} from 'react';
import {useNavigate,useLocation} from 'react-router-dom';
import {IoCheckmarkCircleOutline,IoEllipseOutline} from 'react-icons/io5';
import { Container,TextField,Button,Box,Typography,FormControl,InputLabel,Select,MenuItem,Card} from '@mui/material';

function filterList(list:any[],sortQuery:string|null,searchQuery:string|null) {
    if(sortQuery) {
        if (sortQuery === 'dateAsc') { list = list.sort((itemA,itemB)=> new Date(itemA.goalCreationDate).getTime() - new Date(itemB.goalCreationDate).getTime()) };
        if (sortQuery === 'dateDesc') { list = list.sort((itemA,itemB)=> new Date(itemB.goalCreationDate).getTime() - new Date(itemA.goalCreationDate).getTime()) };
        if (sortQuery === 'statusPend') { list = list.filter(item=>item.goalStatus === 'Pending') };
        if (sortQuery === 'statusComp') { list = list.filter(item=>item.goalStatus === 'Complete') };
    }
    if(searchQuery) {
        list = list.filter(item=>item.goalTitle.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    return list
}

const Goals:React.FC = () => {
    const goalHooks = useGoalHooks();
    const isDarkMode = useSelector<RootState,boolean|undefined>(state=>state.authSlice.darkMode);
    const goalList = useSelector<RootState,{goalTitle:string,goalCreationDate:string,goalTargetDate:string|null,goalStatus:string,habitId:string|null,_id:string}[]>(state=>state.goalSlice.goalList);
    const goalListLoaded = useSelector<RootState,boolean>(state=>state.goalSlice.goalListLoaded);
    const loading = useSelector<RootState,boolean>(state=>state.authSlice.loading);
    const sidebarFull = useSelector<RootState,boolean>(state=>state.authSlice.sidebarFull);
    const sidebarVisible = useSelector<RootState,boolean>(state=>state.authSlice.sidebarVisible);
     // Sorting by query params
    const [navigate,location] = [useNavigate(),useLocation()];
    const queryParams = new URLSearchParams(location.search);
    const [sortQuery,searchQuery] = [queryParams.get('sort'),queryParams.get('search')] 
    function setQueries(sortQuery:string|null,searchQuery:string|null) {
        const sortQueryString = sortQuery ? `?sort=${sortQuery}` : ''
        const searchQueryString = searchQuery ? sortQuery ? `&search=${searchQuery}` : `?search=${searchQuery}` : ''
        navigate(`/goals${sortQueryString}${searchQueryString}`);
    }
    const [queries,setNewQueries] = useState({sortQuery:searchQuery || '',searchQuery:searchQuery || ''}) ;
    const sortQueryHandler = (e:any) => {
        setNewQueries((prevState)=>({
            ...prevState,
            sortQuery:e.target.value
        }))
        setQueries(e.target.value,queries.searchQuery);
    }
    const searchQueryHandler = (e:any) => {
        setNewQueries((prevState)=>({
            ...prevState,
            searchQuery:e.target.value
        }))
        setQueries(queries.sortQuery,e.target.value);
    }
    const filteredList = filterList([...goalList],sortQuery,searchQuery);
    // Toggle new/detailed goal
    const [toggleNewGoal,setToggleNewGoal] = useState(false);
    // Set detailed id
    const [detailedItem,setDetailedItem] = useState();
    useEffect(() => {
        goalListLoaded || goalHooks.loadGoalData();
    }, [])
    return (
        <Container component="main" className={`goals ${sidebarVisible?`page-${sidebarFull?'compact':'full'}`:'page'}`}>
            <Box className={`goal-controls${isDarkMode?'-dark':''}`}>
                <FormControl className='sort-goals select' size='small'>
                    <InputLabel id="goal-sort-label">Sort</InputLabel>
                    <Select labelId="goal-sort-label"  value={queries.sortQuery} onChange={sortQueryHandler} size='small' label="Sort">
                        <MenuItem value="">Default</MenuItem>
                        <MenuItem value="dateAsc">Date Ascending</MenuItem>
                        <MenuItem value="dateDesc">Date Descending</MenuItem>
                        <MenuItem value="statusPend">Status Pending</MenuItem>
                        <MenuItem value="statusComp">Status Complete</MenuItem>
                    </Select>
                </FormControl>
                <TextField  className={`search-goals`} sx={{width:"calc(min(100%, 33rem))"}} value={queries.searchQuery} onChange={searchQueryHandler} fullWidth size='small' label="Search"/>
                <Button variant="outlined"  className={`add-new-goal`} onClick={()=>{setToggleNewGoal(!toggleNewGoal)}}>New Goal</Button>
            </Box>
            {loading?
            <Loading height='80vh'/>:
            <Box className="goal-list">
                {filteredList.map((goalItem)=>{
                    return (
                        <Card variant='elevation' className={`goal-item scale-in`} key={goalItem._id}>
                            <Box className={`change-goal-status`} onClick={()=>{goalHooks.changeGoalStatus(goalItem._id,goalItem.goalStatus)}}>
                                {goalItem.goalStatus === 'Complete' ? <IoCheckmarkCircleOutline  className={`icon-interactive ${goalItem.goalStatus}`} /> : <IoEllipseOutline className={`icon-interactive ${goalItem.goalStatus}`} />}
                            </Box>
                            <Box className={`goal-item-title`} onClick={()=>{setDetailedItem(goalItem);setToggleNewGoal(!toggleNewGoal)}}>
                                <Typography className={`goal-item-title-text`}>{goalItem.goalTitle}</Typography>
                            </Box>
                        </Card>
                    )
                })}
            </Box>}
            {toggleNewGoal && <AddNewGoal detailedGoal={detailedItem} setDetailedItem={():any=>{setDetailedItem(undefined)}} returnToGoals={():any=>setToggleNewGoal(false)} />}
        </Container>
    )
}

export default Goals