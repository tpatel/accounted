require('@snyk/nodejs-runtime-agent')({
  projectId: '97245c66-97e3-436d-a82b-9da37bc4abbf',
});
const crypto = require('crypto');
const organizations = {};
const accounts = {};
const verificationTokens = {};
const passwordResetTokens = {};

function randomString() {
  return crypto.randomBytes(32).toString('hex');
}

// Organization
function newOrganization(name) {
  const id = randomString();
  organizations[id] = {
    id,
    name
  };
  return id;
}
function getOrganization(id) {
  return organizations[id] ? organizations[id] : null;
}
function addAccountToOrganization(accountID, organizationID, role) {
  const account = getAccount(accountID);
  if(!account.organizations[organizationID]) {
    account.organizations[organizationID] = [];
  }
  account.organizations[organizationID].push(role);
} //owner, admin, viewer...

function listMyOrganizations(accountID, page, limit) {
  return Object.entries(getAccount(accountID).organizations)
    .map((tuple) => [getOrganization(tuple[0]), tuple[1]])
}
function listOrganizationAccounts(id, page, limit) {
  return Object.values(accounts).filter((account) => account.organizations[id]);
}

// Account
function newAccount(id, name, email, password) {
  const salt = randomString();
  password = crypto.createHash('sha256').update(password + salt).digest('hex');
  accounts[id] = {id, name, email, salt, password, organizations: {}, emailVerified: false};
  return id;
}
function getAccount(id) {
  return accounts[id] ? accounts[id] : null;
}
function createEmailToken(accountID) {
  const id = randomString() + randomString();
  verificationTokens[id] = accountID;
  return id;
}
function verifyEmail(token) {
  const id = verificationTokens[token];
  if(!id) return null;
  getAccount(id).emailVerified = true;
  return getAccount(id);
}
function getAccountWithPassword(id, password) { // Internal
  const account = getAccount(id);
  if(!account) return null;
  const attempt = crypto.createHash('sha256').update(password + account.salt).digest('hex');
  return account.password == attempt ? account : null;
}
function login(id, password) {
  const account = getAccountWithPassword(id, password);
  return account != null;
}

function updateAccountPassword(id, oldPassword, newPassword) {
  const account = getAccountWithPassword(id, oldPassword);
  if(!account) return false;
  account.password = crypto.createHash('sha256').update(newPassword + account.salt).digest('hex');
  return true;
}

function listAccounts(page, limit) {
  throw new Error('not implemented yet');
}

function createPasswordResetToken(accountID, ttl) {
  const id = randomString() + randomString();
  passwordResetTokens[id] = accountID;
  return id;
}
function resetPassword(token, newPassword) {
  const id = passwordResetTokens[token];
  if(!id) return null;
  const account = getAccount(id);
  account.password = crypto.createHash('sha256').update(newPassword + account.salt).digest('hex');
}

const api = {
  newOrganization: newOrganization,
  getOrganization: getOrganization,
  listOrganizationAccounts: listOrganizationAccounts,

  newAccount: newAccount,
  getAccount: getAccount,
  addAccountToOrganization: addAccountToOrganization,
  listMyOrganizations: listMyOrganizations,
  login: login,
  updateAccountPassword: updateAccountPassword,

  resetPassword: resetPassword,

  createEmailToken: createEmailToken,
  verifyEmail: verifyEmail,

  createPasswordResetToken: createPasswordResetToken,
};

function test() {
  console.log('Registering account test@example.com');
  let password = 'notsosecretpwd';
  let email = 'test@example.com';
  const account = api.newAccount(email, 'Mr. Test', email, password);
  console.log(api.getAccount(account));

  console.log('Registering organization test');
  const organization = api.newOrganization('test');
  console.log(api.getOrganization(organization));

  console.log('Adding account test@example.com to the organization test');
  api.addAccountToOrganization(account, organization, 'admin');
  console.log(api.getAccount(account));
  console.log(api.listOrganizationAccounts(organization));
  console.log(api.listMyOrganizations(account));

  console.log('valid login attempt');
  console.log(api.login(email, password));
  console.log('invalid login attempt');
  console.log(api.login(email, password+'NOPE'));
  console.log('invalid login attempt');
  console.log(api.login('NOPE'+email, password));

  console.log('password update');
  console.log(api.updateAccountPassword(email, password, password = 'notsosecretpwd2'));
  console.log('valid login attempt');
  console.log(api.login(email, password));

  console.log('email token')
  const token = api.createEmailToken(email);
  console.log(token);
  console.log(api.verifyEmail(token));
  console.log(api.verifyEmail('invalid-token'));

  console.log('password reset');
  const token2 = api.createPasswordResetToken(email, 1000*3600*24);
  console.log(token2);
  console.log(api.resetPassword(token2, password = 'supernewpwd'));
  console.log('valid login attempt');
  console.log(api.login(email, password));

}
test();