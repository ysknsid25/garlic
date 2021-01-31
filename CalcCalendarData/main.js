const main = () => {
    getCalendarEvents();
};

const CALENDAR_ID = ''; //カレンダーID

const getCalendarEvents = () => {

    const calendar = CalendarApp.getCalendarById(CALENDAR_ID);
    const dateObj = new Date();
    const month = getTargetMonth(dateObj.getMonth());
    const year = getTargetYear(dateObj.getFullYear(), month);
    const startTime = new Date(year + '/' + month + '/1 00:00:00');
    const endTime = new Date(year + '/' + month + '/31 00:00:00');

    const events = calendar.getEvents(startTime, endTime);

    events.map((event) => console.log(event.getTitle()));

};

const getTargetMonth = (month) => {
    if(month == 0){
        return 12;
    }
    return month;
};

const getTargetYear = (year, month) => {
    if(month == 12){
        return year - 1;
    }
    return year;
};