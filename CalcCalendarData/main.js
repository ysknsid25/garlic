const main = () => {
    const calendarEvents = getCalendarEvents();
    const inputSheet = getNewSheet();

    inputSheet.getRange(4, 4).setValue(getYearMonth());

    let nowLine = 12; //12行目からスタート
    const sumDur = durSum();

    calendarEvents.map((event) => {
        inputSheet.getRange(nowLine, 3).setValue(event.date);
        inputSheet.getRange(nowLine, 4).setValue(event.title);
        inputSheet.getRange(nowLine, 6).setValue(event.beginTime);
        inputSheet.getRange(nowLine, 7).setValue(event.endTime);
        inputSheet.getRange(nowLine, 8).setValue(event.dur);
        inputSheet.getRange(43, 8).setValue(sumDur(event.dur));
        nowLine++;
    });
};

const getCalendarEvents = () => {

    const calendar = CalendarApp.getCalendarById(CALENDAR_ID);
    const dateObj = new Date();
    const month = getTargetMonth(dateObj.getMonth());
    const year = getTargetYear(dateObj.getFullYear(), month);
    const startTime = new Date(year + '/' + month + '/1 00:00:00');
    const endTime = new Date(year + '/' + month + '/31 00:00:00');

    return calendar
    .getEvents(startTime, endTime)
    .filter((event) => event.getTitle().indexOf(KEY_WORD) > -1)
    .map(
    (event) => 
        (
            new Object(
                {
                    title: event.getTitle().replace(KEY_WORD, "").trim(),
                    date: (
                            (event) => {
                                const date = new Date(event.getStartTime());
                                return date.getFullYear() + '/' + (date.getMonth() + 1) + '/' + date.getDate();
                            }
                            )(event),
                    dur: convMillisecondToHour(event.getEndTime() - event.getStartTime()),
                    beginTime: getTime(event.getStartTime()),
                    endTime: getTime(event.getEndTime()),
                    description: event.getDescription()
                }
            )
        )
    );

};

const getTime = (dateTime) => {
    const date = new Date(dateTime);
    return complementZero(date.getHours()) + ':' + complementZero(date.getMinutes());
};

const complementZero = (time) => {
    if(0 <= time && time <= 9){
        return '0' + time;
    }
    return time;
};

const durSum = () => {
    let sum = 0;
    const add = (dur) => {
        return sum += dur;
    };
    return add;
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

const convMillisecondToHour = (milliSecond) => milliSecond / 3600000;

const getNewSheet = () => {
    const DRIVEINFO = getGoogleDriveInfo(); 
    const spreadsheet = SpreadsheetApp.openByUrl(DRIVEINFO.SP_URL);
    const newSheet = spreadsheet.getSheetByName(DRIVEINFO.ORIGINAL_SHEET_NM).copyTo(spreadsheet);
    newSheet.setName(getYearMonth());
    spreadsheet.setActiveSheet(newSheet);
    spreadsheet.moveActiveSheet(1);
    return newSheet;
};

const getYearMonth = () => {
    const dateObj = new Date();
    return dateObj.getFullYear() + '年' + getTargetMonth(dateObj.getMonth()) + '月度';
};
