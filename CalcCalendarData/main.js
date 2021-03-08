const main = () => {

    const calendarEvents = getCalendarEvents();
    const inputSheet = getNewSheet();

    inputSheet.getRange(5, 4).setValue(getYearMonth());

    let valuesArr = inputSheet.getRange(1, 1, 11, 9).getValues();
    let no = 1;
    let totalFunc = 0;
    let tripCount = 0;

    const sumDur = durSum();
    const searchFuncEvent = (event) => {
        if(isContainKeyWord(TRIP_KEY_WORD, event.title)){
            tripCount++;
        }else{
            valuesArr.push(['', no, event.name, event.date, event.title, '', event.beginTime, event.endTime, event.dur]);
            totalFunc = sumDur(event.dur);
            no++;
        }
    }

    calendarEvents.map((event) => searchFuncEvent(event));
    inputSheet.getRange(1, 1, valuesArr.length, valuesArr[0].length).setValues(valuesArr);

    inputSheet.getRange(40, 9).setValue(getFuncOverFee(totalFunc));
    inputSheet.getRange(41, 9).setValue(getFuncDeductionFee(totalFunc));
    inputSheet.getRange(44, 9).setValue(tripCount * tripfee);

    inputSheet.getRange(8, 4).setValue(inputSheet.getRange(45, 9).getValue());

};

const getCalendarEvents = () => getAllEvents().reduce((pre,current) => {pre.push(...current);return pre},[]).sort(function(a, b){return sortDateAsc(a, b)});

const sortDateAsc = (a, b) => {
    const adate = new Date(a.date);
    const bdate = new Date(b.date);
    if( adate > bdate ) return 1;
    if( adate < bdate ) return -1;
    return 0;
};

const getAllEvents = () => calendarIdList.map(calendarId => {

    const calendar = CalendarApp.getCalendarById(calendarId);
    const dateObj = new Date();
    const month = getTargetMonth(dateObj.getMonth());
    const year = getTargetYear(dateObj.getFullYear(), month);
    const startTime = new Date(year + '/' + month + '/1 00:00:00');
    const endTime = new Date(year + '/' + month + '/31 00:00:00');

    return calendar
    .getEvents(startTime, endTime)
    .filter((event) => isContainKeyWord(KEY_WORD, event.getTitle()) || isContainKeyWord(TRIP_KEY_WORD, event.getTitle()))
    .map(
        (event) => 
            (
                {
                    "name": calendarNmList[calendarId.replace(DOMAIN, "")],
                    "title": event.getTitle().replace(KEY_WORD, "").trim(),
                    "date": getDate(event.getStartTime()),
                    "dur": convMillisecondToHour(event.getEndTime() - event.getStartTime()),
                    "beginTime": getTime(event.getStartTime()),
                    "endTime": getTime(event.getEndTime()),
                    "description": event.getDescription()
                }
            )
    );

});

const isContainKeyWord = (keyword, searchTarget) => searchTarget.indexOf(keyword) > -1;

const getFuncOverFee = (sumdur) => {
    if(sumdur > maxfuncpoint){
        return basefee * (sumdur - maxfuncpoint);
    }
    return 0;
};

const getFuncDeductionFee = (sumdur) => {
    if(sumdur < minfuncpoint){
        return basefee * (minfuncpoint - sumdur);
    }
    return 0;
};

const getDate = (dateTime) => {
    const date = new Date(dateTime);
    return date.getFullYear() + '/' + (date.getMonth() + 1) + '/' + date.getDate();
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
    //return month;
    return 3;
};

const getTargetYear = (year, month) => {
    if(month == 12){
        return year - 1;
    }
    return year;
};

/**
 * カレンダーに入力された工数を返す。
 * 8時間を超えている場合、休憩時間1hが入ってくるので、-1して返す。
 */
const convMillisecondToHour = (milliSecond) => {
    let hours = milliSecond / 3600000;
    if(hours > 8){
        return hours-1;
    }
    return hours;
};

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
