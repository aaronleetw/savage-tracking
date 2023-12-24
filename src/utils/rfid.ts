export let lastGotRfid = "";
export const setLastRfid = (uid: string) => {
    lastGotRfid = uid;
};
export let rfidAttendance = true;
export const setRfidAttendance = (value: boolean) => {
    rfidAttendance = value;
};