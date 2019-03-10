import {createConnection} from 'typeorm';
import { expect } from 'chai';
import 'mocha';
import {Account} from './entity/Account';
import {Organization} from './entity/Organization';

describe('Account', () => {
  let connection;

  beforeEach(async function() {
    connection = await createConnection({
      "database": "test.db",
      "type": "sqlite",
      "synchronize": true,
      "logging": false,
      "entities": [
        "src/entity/**/*.ts"
      ],
      "migrations": [
        "src/migration/**/*.ts"
      ],
      "subscribers": [
        "src/subscriber/**/*.ts"
      ],
      "cli": {
        "entitiesDir": "src/entity",
        "migrationsDir": "src/migration",
        "subscribersDir": "src/subscriber"
      }
    });
  })

  afterEach(async function() {
    await connection.close();
    require('fs').unlinkSync(__dirname +'/../test.db');
  })

  it('Should register a correct Account', async () => {
    const account = await Account.registerAccount('Joe', 'joe@example.com', 'insecurepassword');
    expect(account.name).to.equal('Joe');
  })

  it('Should register a correct Organization', async () => {
    const account = await Account.registerAccount('', 'joe@example.com', '');
    const organization = await Organization.registerOrganization('Newco', account);
    expect(organization.name).to.equal('Newco');
  })
})