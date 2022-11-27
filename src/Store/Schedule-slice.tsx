import {createSlice} from '@reduxjs/toolkit';
import type {ScheduleInterface} from "../Misc/Interfaces";

const currentDate = new Date().getDate() - 1;

const generateMonthHash = (date:Date = new Date()) => {
    const monthStart:Date = new Date(date.getFullYear(),date.getMonth(),date.getDate() - (date.getDate()  - 1),0,0,0,0);
    const monthEnd:Date = new Date(new Date(date.getFullYear(),date.getMonth() + 1,1,0,0,0,0).getTime() - 1);
    const month:{[date:string]:ScheduleInterface[]} = {}
    for (let i = monthStart.getDate(); i < monthEnd.getDate() + 1; i++) {
        const monthDate:Date = new Date(date.getFullYear(),date.getMonth(),i,0,0,0,0);
        month[monthDate.toLocaleDateString('en-Gb')] = []
    }
    return month
}

interface ScheduleSchema {
    scheduleLoading:boolean,
    scheduleList:{[date:string]:ScheduleInterface[]}, // toLocaleDateString('en-Gb')
    scheduleListLoaded:boolean,
    scheduleDate:string
}

const initialScheduleState:ScheduleSchema = {
    scheduleLoading:false,
    scheduleList:{},
    scheduleListLoaded:false,
    scheduleDate: new Date().toISOString(),
}

const scheduleSlice = createSlice({
    name:'schedule',
    initialState:initialScheduleState,
    reducers: {
        setScheduleLoading(state,action) {
            state.scheduleLoading = action.payload;
        },
        addScheduleItem(state,action) {
            const date = new Date(action.payload.date).toLocaleDateString('en-Gb');
            if (!state.scheduleList[date]) {
                state.scheduleList[date] = [];
            }
            state.scheduleList[date].push(action.payload);
        },
        deleteScheduleItem(state,action) {
            if (action.payload.parentType === 'habit') {
                const dates = Object.keys(state.scheduleList);
                dates.forEach((date:string) => {
                    state.scheduleList[date] = state.scheduleList[date].filter((item:ScheduleInterface)=>{
                        return item.parentId !== action.payload._id;
                    })
                });
            } else {
                const date = new Date(action.payload.targetDate).toLocaleDateString('en-Gb');
                state.scheduleList[date] = state.scheduleList[date].filter((item:ScheduleInterface)=>{
                    return item.parentId !== action.payload._id;
                })
            }
        },
        updateScheduleItem(state,action) {
            const newDate = new Date(action.payload.newTodo.targetDate).toLocaleDateString('en-Gb');
            const oldDate = new Date(action.payload.oldTodo.targetDate).toLocaleDateString('en-Gb');
            if (!state.scheduleList[newDate]) {
                state.scheduleList[newDate] = [];
            }
            if (newDate === oldDate) {

            } else {
                
            }
            state.scheduleList[newDate] = state.scheduleList[date].map((item:ScheduleInterface)=>{
                if (action.payload._id === item.parentId) {
                    item.date = action.payload.targetDate
                    item.time = action.payload.time
                    item.parentTitle = action.payload.title
                    item.alarmUsed = action.payload.alarmUsed
                    item.isArchived = action.payload.isArchived
                }
                return item;
            })
        },  
        updateScheduleItemStatus(state,action) {
            const date = new Date(action.payload.date).toLocaleDateString('en-Gb');
            state.scheduleList[date] = state.scheduleList[date].map((item:ScheduleInterface)=>{
                if (action.payload._id === item.parentId) {
                    item.dateCompleted = action.payload.dateCompleted;
                    item.status = action.payload.dateCompleted ? "Complete" : "Pending";
                }
                return item;
            })
        },  
        setScheduleList(state,action) {
            const date = new Date(action.payload.date).toLocaleDateString('en-Gb');
            state.scheduleList[date] = action.payload.scheduleList;
            state.scheduleListLoaded = true;
            state.scheduleDate = action.payload.date
        },
        clearScheduleList(state) {
            state.scheduleDate = new Date().toISOString();
            state.scheduleList = {};
            state.scheduleListLoaded = false;
        }
    }
})

export default scheduleSlice