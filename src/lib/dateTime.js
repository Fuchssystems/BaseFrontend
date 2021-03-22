const serverDateToLocalDateTimeString = function serverDateToLocalDateTimeString(dateTimeString) {
  const dateLastOnline = new Date(`${dateTimeString} UTC`);
  let returnValue = dateLastOnline.toLocaleDateString(this.$t('app_locale_browser'),
    { day: '2-digit', month: '2-digit', year: '2-digit' });
  returnValue += ' ';
  returnValue += dateLastOnline.toLocaleTimeString(this.$t('app_locale_browser'),
    {
      hourCycle: 'h23',
      hour: '2-digit',
      minute: '2-digit',
    });
  return returnValue;
};

export { serverDateToLocalDateTimeString };
