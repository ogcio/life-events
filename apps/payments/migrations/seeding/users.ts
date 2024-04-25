export const createUser = (authPool) => {
  console.log("Creating user");
  return authPool.query(
    `INSERT INTO users(govid_email, govid, user_name, is_public_servant) 
         VALUES($1, $2, $3, $4)  RETURNING *`,
    // Values has been formatted to not create duplicates during the login
    ["Lorem.Ipsum@mail.ie", "not needed atm", "Lorem Ipsum", true],
  );
};
