export function getDateWithoutTime(dateString) {
    const [date] = dateString.split('T');
    return date;
}
