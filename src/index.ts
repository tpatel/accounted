require('@snyk/nodejs-runtime-agent')({
  projectId: '97245c66-97e3-436d-a82b-9da37bc4abbf',
});
import "reflect-metadata";
import {createConnection} from "typeorm";
import {Account} from "./entity/Account";
import {Organization} from "./entity/Organization";
import {Role} from "./entity/Role";


createConnection().then(async connection => {

    try {
      const account = await Account.registerAccount('Joe', 'joe@example.com', 'password');
      const organization = await Organization.registerOrganization('Newco', account);

    } catch(e) {console.log(e)}


    console.log("Loading accounts from the database...");
    const accounts = await connection.manager.find(Account, {relations: ["roles", "roles.organization"]});
    console.log("Loaded accounts: ", JSON.stringify(accounts, null, 2));

    console.log(await Account.authenticate("joe@example.com", "password"));
    console.log(await Account.authenticate("joe@example.com", "false"));

}).catch(error => console.log(error));
