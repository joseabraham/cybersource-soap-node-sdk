const setNames = (Data, fullName) => {
  const fullNameSplited = fullName.split(' ');
  if (fullNameSplited.length == 2) {
    Data.firstName = fullNameSplited[0];
    Data.lastName = fullNameSplited[1];
  } else if (fullNameSplited.length >= 3) {
    Data.firstName = fullNameSplited[0];
    Data.lastName = fullNameSplited[2];
  }
  return Data;
};

module.exports = {
  setNames,
};
