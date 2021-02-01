const main = () => {
    getCalendarEvents();
};

const CALENDAR_ID = ''; //カレンダーID
const KEY_WORD = '#hoge';

const getCalendarEvents = () => {

    const calendar = CalendarApp.getCalendarById(CALENDAR_ID);
    const dateObj = new Date();
    const month = getTargetMonth(dateObj.getMonth());
    const year = getTargetYear(dateObj.getFullYear(), month);
    const startTime = new Date(year + '/' + month + '/1 00:00:00');
    const endTime = new Date(year + '/' + month + '/31 00:00:00');

    const events = calendar.getEvents(startTime, endTime);

    const filteredEvents = events.filter((event) => event.getTitle().indexOf(KEY_WORD) > -1);
    console.log(filteredEvents.map(
        (event) => 
            (
                new Object(
                    {
                        title: event.getTitle(),
                        date: (
                                (event) => {
                                    const date = new Date(event.getStartTime());
                                    return date.getFullYear() + '/' + (date.getMonth() + 1) + '/' + date.getDate();
                                }
                                )(event),
                        dur: convMillisecondToMinute(event.getEndTime() - event.getStartTime()),
                        description: event.getDescription()
                    }
                )
            )
        )
    );
    //console.log(event.getTitle() + event.getStartTime() + event.getEndTime() + event.getDescription()

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

const convMillisecondToMinute = (milliSecond) => milliSecond / 60000;