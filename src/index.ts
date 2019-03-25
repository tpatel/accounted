require('@snyk/nodejs-runtime-agent')({
  projectId: '97245c66-97e3-436d-a82b-9da37bc4abbf',
});
import 'reflect-metadata';
import { createConnection } from 'typeorm';
import { Account } from './entity/Account';
import { Organization } from './entity/Organization';
import { Role } from './entity/Role';

createConnection()
  .then(async connection => {
    const account = await Account.registerAccount(
      'Joe',
      'joe@example.com',
      'insecurepassword'
    );
    const organization = await Organization.registerOrganization(
      'Newco',
      account
    );

    console.log('Loading accounts from the database...');
    const accounts = await connection.manager.find(Account, {
      relations: ['roles', 'roles.organization'],
    });
    console.log('Loaded accounts: ', JSON.stringify(accounts, null, 2));

    console.log(
      await Account.authenticate('joe@example.com', 'insecurepassword')
    );
    console.log(await Account.authenticate('joe@example.com', 'false'));

    let success = await Account.updatePassword(
      'joe@example.com',
      'insecurepassword',
      'insecure123456'
    );
    console.log('Password update succeeded:', success);

    console.log(
      await Account.authenticate('joe@example.com', 'insecurepassword')
    );
    console.log(await Account.authenticate('joe@example.com', 'false'));

    const account2 = await Account.registerAccount(
      'Jane',
      'jane@example.com',
      'insecurepassword'
    );
    console.log(account2);
    const token = await account2.createEmailVerificationToken();
    console.log(await account2.verifyEmail('faketoken'));
    console.log(await account.verifyEmail(token));
    console.log(await account2.verifyEmail(token));
    console.log(await account2.verifyEmail(token));
    console.log(account);
  })
  .catch(error => console.log(error));
