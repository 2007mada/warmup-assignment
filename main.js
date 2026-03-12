const fs = require("fs");

// ============================================================
// Function 1: getShiftDuration(startTime, endTime)
// startTime: (typeof string) formatted as hh:mm:ss am or hh:mm:ss pm
// endTime: (typeof string) formatted as hh:mm:ss am or hh:mm:ss pm
// Returns: string formatted as h:mm:ss
// ============================================================
function getShiftDuration(startTime, endTime) {
    let startParts = startTime.split(" ");
    let startHMS = startParts[0].split(":");
    let startH = parseInt(startHMS[0]);
    let startM = parseInt(startHMS[1]) || 0;
    let startS = parseInt(startHMS[2]) || 0;
    let startAMPM = startParts[1].toLowerCase();
    if (startAMPM === "pm" && startH < 12) {
        startH = startH + 12;
    } else if (startAMPM === "am" && startH === 12) {
        startH = 0;
    }
    let startTotalSeconds = (startH * 3600) + (startM * 60) + startS;

    let endParts = endTime.split(" ");
    let endHMS = endParts[0].split(":");
    let endH = parseInt(endHMS[0]);
    let endM = parseInt(endHMS[1]) || 0;
    let endS = parseInt(endHMS[2]) || 0;
    let endAMPM = endParts[1].toLowerCase();
    if (endAMPM === "pm" && endH < 12) {
        endH = endH + 12;
    } else if (endAMPM === "am" && endH === 12) {
        endH = 0;
    }
    let endTotalSeconds = (endH * 3600) + (endM * 60) + endS;

    if (endTotalSeconds < startTotalSeconds) {
        endTotalSeconds = endTotalSeconds + (24 * 3600);
    }
    let diffSeconds = endTotalSeconds - startTotalSeconds;
    let h = Math.floor(diffSeconds / 3600);
    let m = Math.floor((diffSeconds % 3600) / 60);
    let s = diffSeconds % 60;
    let mm = m;
    if (m < 10) {
        mm = "0" + m;
    }
    let ss = s;
    if (s < 10) {
        ss = "0" + s;
    }
    return h + ":" + mm + ":" + ss;
}

// ============================================================
// Function 2: getIdleTime(startTime, endTime)
// startTime: (typeof string) formatted as hh:mm:ss am or hh:mm:ss pm
// endTime: (typeof string) formatted as hh:mm:ss am or hh:mm:ss pm
// Returns: string formatted as h:mm:ss
// ============================================================
function getIdleTime(startTime, endTime) {
    let startParts = startTime.split(" ");
    let startHMS = startParts[0].split(":");
    let startH = parseInt(startHMS[0]);
    let startM = parseInt(startHMS[1]) || 0;
    let startS = parseInt(startHMS[2]) || 0;
    let startAMPM = startParts[1].toLowerCase();

    if (startAMPM === "pm" && startH < 12) {
        startH = startH + 12;
    } else if (startAMPM === "am" && startH === 12) {
        startH = 0;
    }
    let startTotalSeconds = (startH * 3600) + (startM * 60) + startS;

    let endParts = endTime.split(" ");
    let endHMS = endParts[0].split(":");
    let endH = parseInt(endHMS[0]);
    let endM = parseInt(endHMS[1]) || 0;
    let endS = parseInt(endHMS[2]) || 0;
    let endAMPM = endParts[1].toLowerCase();

    if (endAMPM === "pm" && endH < 12) {
        endH = endH + 12;
    } else if (endAMPM === "am" && endH === 12) {
        endH = 0;
    }
    let endTotalSeconds = (endH * 3600) + (endM * 60) + endS;

    if (endTotalSeconds <= startTotalSeconds) {
        endTotalSeconds = endTotalSeconds + (24 * 3600);
    }

    let deliveryStart = 28800;
    let deliveryEnd = 79200;
    let oneDayInSeconds = 86400;

    let activeSeconds = 0;

    if (endTotalSeconds <= oneDayInSeconds) {
        let activeBegin = Math.max(startTotalSeconds, deliveryStart);
        let activeFinish = Math.min(endTotalSeconds, deliveryEnd);
        if (activeFinish > activeBegin) {
            activeSeconds = activeFinish - activeBegin;
        }
    } else {
        let day1ActiveBegin = Math.max(startTotalSeconds, deliveryStart);
        if (day1ActiveBegin < deliveryEnd) {
            activeSeconds = activeSeconds + (deliveryEnd - day1ActiveBegin);
        }

        let day2Clock = endTotalSeconds - oneDayInSeconds;
        let day2ActiveEnd = Math.min(day2Clock, deliveryEnd);
        if (day2ActiveEnd > deliveryStart) {
            activeSeconds = activeSeconds + (day2ActiveEnd - deliveryStart);
        }
    }

    let totalShiftSeconds = endTotalSeconds - startTotalSeconds;
    let idleSeconds = totalShiftSeconds - activeSeconds;

    let h = Math.floor(idleSeconds / 3600);
    let leftover = idleSeconds % 3600;
    let m = Math.floor(leftover / 60);
    let s = leftover % 60;

    let mm = m;
    if (m < 10) mm = "0" + m;
    let ss = s;
    if (s < 10) ss = "0" + s;

    return h + ":" + mm + ":" + ss;
}

// ============================================================
// Function 3: getActiveTime(shiftDuration, idleTime)
// shiftDuration: (typeof string) formatted as h:mm:ss
// idleTime: (typeof string) formatted as h:mm:ss
// Returns: string formatted as h:mm:ss
// ============================================================
function getActiveTime(shiftDuration, idleTime) {
    let durationParts = shiftDuration.split(":");
    let dH = parseInt(durationParts[0]);
    let dM = parseInt(durationParts[1]) || 0;
    let dS = parseInt(durationParts[2]) || 0;
    let durationSec = (dH * 3600) + (dM * 60) + dS;

    let idleParts = idleTime.split(":");
    let iH = parseInt(idleParts[0]);
    let iM = parseInt(idleParts[1]) || 0;
    let iS = parseInt(idleParts[2]) || 0;
    let idleSec = (iH * 3600) + (iM * 60) + iS;

    let activeSec = durationSec - idleSec;

    let h = Math.floor(activeSec / 3600);
    let leftover = activeSec % 3600;
    let m = Math.floor(leftover / 60);
    let s = leftover % 60;
    let mm = m;
    if (m < 10) mm = "0" + m;
    let ss = s;
    if (s < 10) ss = "0" + s;
    return h + ":" + mm + ":" + ss;
}

// ============================================================
// Function 4: metQuota(date, activeTime)
// date: (typeof string) formatted as yyyy-mm-dd
// activeTime: (typeof string) formatted as h:mm:ss
// Returns: boolean
// ============================================================
function metQuota(date, activeTime) {
    let dateParts = date.split("-");
    let year = parseInt(dateParts[0]);
    let month = parseInt(dateParts[1]);
    let day = parseInt(dateParts[2]);

    let isEidPeriod = false;
    if (year === 2025 && month === 4 && day >= 10 && day <= 30) {
        isEidPeriod = true;
    }

    let requiredSeconds = 30240;
    if (isEidPeriod === true) {
        requiredSeconds = 21600;
    }

    let timeParts = activeTime.split(":");
    let activeH = parseInt(timeParts[0]);
    let activeM = parseInt(timeParts[1]);
    let activeS = parseInt(timeParts[2]);
    let totalActiveSeconds = (activeH * 3600) + (activeM * 60) + activeS;

    if (totalActiveSeconds >= requiredSeconds) {
        return true;
    } else {
        return false;
    }
}

// ============================================================
// Function 5: addShiftRecord(textFile, shiftObj)
// textFile: (typeof string) path to shifts.txt text file
// shiftObj: (typeof object) has driverID, driverName, date, startTime, endTime
// Returns: object with 10 properties or empty object {}
// ============================================================
function addShiftRecord(textFile, shiftObj) {
    let lines = readLines(textFile);

    for (let i = 0; i < lines.length; i++) {
        let currentLine = lines[i];
        if (currentLine.trim() === "") {
            continue;
        }
        let columns = currentLine.split(",");
        let existingID = columns[0].trim();
        let existingDate = "";
        if (columns[2]) {
            existingDate = columns[2].trim();
        }
        if (existingID === shiftObj.driverID && existingDate === shiftObj.date) {
            return {};
        }
    }

    let duration = getShiftDuration(shiftObj.startTime, shiftObj.endTime);
    let idle = getIdleTime(shiftObj.startTime, shiftObj.endTime);
    let active = getActiveTime(duration, idle);
    let quotaMet = metQuota(shiftObj.date, active);
    let bonus = false;

    let fullRecord = {
        driverID: shiftObj.driverID,
        driverName: shiftObj.driverName,
        date: shiftObj.date,
        startTime: shiftObj.startTime,
        endTime: shiftObj.endTime,
        shiftDuration: duration,
        idleTime: idle,
        activeTime: active,
        metQuota: quotaMet,
        hasBonus: bonus
    };

    let newLine = fullRecord.driverID + "," +
        fullRecord.driverName + "," +
        fullRecord.date + "," +
        fullRecord.startTime + "," +
        fullRecord.endTime + "," +
        fullRecord.shiftDuration + "," +
        fullRecord.idleTime + "," +
        fullRecord.activeTime + "," +
        fullRecord.metQuota + "," +
        fullRecord.hasBonus;

    let lastIndex = -1;
    for (let i = 0; i < lines.length; i++) {
        let columns = lines[i].split(",");
        if (columns[0].trim() === shiftObj.driverID) {
            lastIndex = i;
        }
    }

    if (lastIndex === -1) {
        lines.push(newLine);
    } else {
        lines.splice(lastIndex + 1, 0, newLine);
    }

    let finalContent = lines.join("\n");
    fs.writeFileSync(textFile, finalContent, "utf8");

    return fullRecord;
}

// ============================================================
// Function 6: setBonus(textFile, driverID, date, newValue)
// textFile: (typeof string) path to shifts.txt text file
// driverID: (typeof string)
// date: (typeof string) formatted as yyyy-mm-dd
// newValue: (typeof boolean)
// Returns: nothing (void)
// ============================================================
function setBonus(textFile, driverID, date, newValue) {
    if (fs.existsSync(textFile) === false) {
        return;
    }
    let lines = readLines(textFile);
    let wasChanged = false;
    for (let i = 0; i < lines.length; i++) {
        let currentLine = lines[i];
        let columns = currentLine.split(",");
        if (columns[0].trim() === driverID && columns[2] && columns[2].trim() === date) {
            if (newValue === true) {
                columns[9] = "true";
            } else {
                columns[9] = "false";
            }
            lines[i] = columns.join(",");
            wasChanged = true;
        }
    }
    if (wasChanged === true) {
        let finalOutput = lines.join("\n");
        fs.writeFileSync(textFile, finalOutput, "utf8");
    }
}

// ============================================================
// Function 7: countBonusPerMonth(textFile, driverID, month)
// textFile: (typeof string) path to shifts.txt text file
// driverID: (typeof string)
// month: (typeof string) formatted as mm or m
// Returns: number (-1 if driverID not found)
// ============================================================
function countBonusPerMonth(textFile, driverID, month) {
    if (fs.existsSync(textFile) === false) {
        return -1;
    }
    let lines = readLines(textFile);
    let bonusTotal = 0;
    let driverWasFound = false;
    let targetMonth = parseInt(month);
    for (let i = 0; i < lines.length; i++) {
        let columns = lines[i].split(",");
        let currentID = columns[0].trim();
        if (currentID === driverID) {
            driverWasFound = true;
            if (columns[2]) {
                let dateString = columns[2].trim();
                let dateSegments = dateString.split("-");
                let monthFromDate = parseInt(dateSegments[1]);
                if (monthFromDate === targetMonth) {
                    let bonusValue = "";
                    if (columns[9]) {
                        bonusValue = columns[9].trim();
                    }
                    if (bonusValue === "true") {
                        bonusTotal = bonusTotal + 1;
                    }
                }
            }
        }
    }
    if (driverWasFound === true) {
        return bonusTotal;
    } else {
        return -1;
    }
}

// ============================================================
// Function 8: getTotalActiveHoursPerMonth(textFile, driverID, month)
// textFile: (typeof string) path to shifts text file
// driverID: (typeof string)
// month: (typeof number)
// Returns: string formatted as hhh:mm:ss
// ============================================================
function getTotalActiveHoursPerMonth(textFile, driverID, month) {
    // TODO: Implement this function
}

// ============================================================
// Function 9: getRequiredHoursPerMonth(textFile, rateFile, bonusCount, driverID, month)
// textFile: (typeof string) path to shifts text file
// rateFile: (typeof string) path to driver rates text file
// bonusCount: (typeof number) total bonuses for given driver per month
// driverID: (typeof string)
// month: (typeof number)
// Returns: string formatted as hhh:mm:ss
// ============================================================
function getRequiredHoursPerMonth(textFile, rateFile, bonusCount, driverID, month) {
    // TODO: Implement this function
}

// ============================================================
// Function 10: getNetPay(driverID, actualHours, requiredHours, rateFile)
// driverID: (typeof string)
// actualHours: (typeof string) formatted as hhh:mm:ss
// requiredHours: (typeof string) formatted as hhh:mm:ss
// rateFile: (typeof string) path to driver rates text file
// Returns: integer (net pay)
// ============================================================
function getNetPay(driverID, actualHours, requiredHours, rateFile) {
    // TODO: Implement this function
}

module.exports = {
    getShiftDuration,
    getIdleTime,
    getActiveTime,
    metQuota,
    addShiftRecord,
    setBonus,
    countBonusPerMonth,
    getTotalActiveHoursPerMonth,
    getRequiredHoursPerMonth,
    getNetPay
};
