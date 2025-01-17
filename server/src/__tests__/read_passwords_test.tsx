import request from 'supertest';
import app from '../server';
import { Pool } from 'pg';
import { getEnvVariable } from '../utils';

const endpoints = {
  getList: getEnvVariable("API_GET_LIST"),
  addPass: getEnvVariable("API_ADD_PASS"),
  updatePass: getEnvVariable("API_UPDATE_PASS"),
  deletePass: getEnvVariable("API_DELETE_PASS"),
  loginChallenge: getEnvVariable("API_LOGIN_CHALLENGE"),
  verifyChallenge: getEnvVariable("API_LOGIN_VERIFY"),
  register: getEnvVariable("API_REGISTER"),
  logout: getEnvVariable("API_LOGOUT")
};

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Set up the database before tests
beforeAll(async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(256) NOT NULL,
      key_hash VARCHAR(256) NOT NULL,
      salt VARCHAR(256) NOT NULL,
      challenge VARCHAR(256),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      last_modified TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS user_passwords (
      id SERIAL PRIMARY KEY,
      user_id INT NOT NULL,
      username VARCHAR(30),
      email VARCHAR(256),
      url VARCHAR(256),
      label VARCHAR(256),
      encrypted_pass VARCHAR(256) NOT NULL,
      salt VARCHAR(256) NOT NULL,
      iv VARCHAR(256) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      last_modified TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS sessions (
      sid varchar(255) PRIMARY KEY,
      expire TIMESTAMP NOT NULL,
      sess json
    );
  `);

  // Insert mock data
  await pool.query(`
    INSERT INTO users (id, username, key_hash, salt)
    VALUES (1, 'testuser', 'hashed_key', 'salt_value');
  `);

  await pool.query(`
    INSERT INTO user_passwords (user_id, username, email, url, label, encrypted_pass, salt, iv)
    VALUES
      (1, 'testaccount', 'test@example.com', 'https://example.com', 'Example', 'encryptedpass', 'salt', 'iv');
  `);

  console.log(endpoints)
});

// Clean up the database after tests
afterAll(async () => {
  await pool.query(`DROP TABLE IF EXISTS users;`);
  await pool.query(`DROP TABLE IF EXISTS user_passwords;`);
  await pool.query(`DROP TABLE IF EXISTS sessions;`);
  await pool.end();
});

describe('Read user password endpoint', () => {
  it('should fetch user passwords for an authenticated user', async () => {
    // Simulate session cookie for an authenticated user
    const session = { userId: 1 };
    const sessionCookie = `connect.sid=${Buffer.from(JSON.stringify(session)).toString('base64')}`;

    // Use Supertest to send the request with the session cookie
    const response = await request(app)
      .get(`/${endpoints.getList}`)
      .set('Cookie', sessionCookie);

    // Assertions
    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          user_id: 1,
          username: 'testaccount',
          email: 'test@example.com',
          url: 'https://example.com',
          label: 'Example',
        }),
      ])
    );
  });

  it('should deny access to unauthenticated users', async () => {
    // No session cookie sent
    const response = await request(app).get(`/${endpoints.getList}`);

    // Assertions
    expect(response.status).toBe(403); // Assuming your `isAuthenticated` middleware sends 403 for unauthorized access
    expect(response.body.error).toBe('Access denied');
  });
});
