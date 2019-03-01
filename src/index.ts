import "reflect-metadata";
import {createConnection} from "typeorm";
import {Account} from "./entity/Account";

createConnection().then(async connection => {

    // console.log("Inserting a new user into the database...");
    // const user = new User();
    // user.firstName = "Timber";
    // user.lastName = "Saw";
    // user.age = 25;
    // await connection.manager.save(user);
    // console.log("Saved a new user with id: " + user.id);

    console.log("Loading accounts from the database...");
    const accounts = await connection.manager.find(Account);
    console.log("Loaded accounts: ", accounts);

}).catch(error => console.log(error));
