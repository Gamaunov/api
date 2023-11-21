export const loginEmailFilter = (login?: string, email?: string) => {
  let filter = {};

  if (login && email) {
    filter = {
      $or: [
        { 'accountData.login': { $regex: login, $options: 'i' } },
        { 'accountData.email': { $regex: email, $options: 'i' } },
      ],
    };
  } else if (login) {
    filter = { 'accountData.login': { $regex: login, $options: 'i' } };
  } else if (email) {
    filter = { 'accountData.email': { $regex: email, $options: 'i' } };
  }

  return filter;
};
