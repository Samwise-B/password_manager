import request from "supertest";
import app from "../server";
import { getEnvVariable } from "../utils";

const { Pool } = require('pg');

const endpoints = {
    getList: getEnvVariable("API_GET_LIST"),
    addPass: getEnvVariable("API_ADD_PASS"),
    updatePass: getEnvVariable("API_UPDATE_PASS"),
    deletePass: getEnvVariable("API_DELETE_PASS"),
    loginChallenge: getEnvVariable("API_LOGIN_CHALLENGE"),
    verifyChallenge: getEnvVariable("API_LOGIN_VERIFY"),
    register: getEnvVariable("API_REGISTER"),
    logout: getEnvVariable("API_LOGOUT")
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

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
});

afterAll(async () => {
  await pool.query(`DROP TABLE IF EXISTS users;`);
  await pool.end();
});

describe('User registration endpoint', () => {
  it('should create a new user', async () => {
    console.log("running test on", endpoints.register);
    const res = await request(app).post(`/${endpoints.register}`).send({ username: 'testuser', hashedKey: 'testpassword', salt: "salt" });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    const {rows} = await pool.query(`SELECT * FROM users;`);
    expect(rows[0].username).toBe("testuser");
    expect(rows[0].hashedKey).toBe("testpassword");
    expect(rows[0].salt).toBe("salt");
  });

  it('should return user already registered', async () => {
    const res = await request(app).post(`/${endpoints.register}`).send({ username: 'testuser', hashedKey: 'testpassword', salt: "salt" });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error', "Username already taken");
    await pool.query("TRUNCATE TABLE users;");
  });

  it('should return 400 error as request invalid', async () => {
    const res = await request(app).post(`/${endpoints.register}`).send({ username: '', hashedKey: 'testpassword', salt: "salt" });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error', "Unable to register, please try again later");
    const {rows} = await pool.query(`SELECT * FROM users;`);
    expect(rows.length).toBe(0);
  });

  it('should return 400 error as request invalid', async () => {
    const res = await request(app).post(`/${endpoints.register}`).send({ username: 'testuser', hashedKey: '', salt: "salt" });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error', "Unable to register, please try again later");
    const {rows} = await pool.query(`SELECT * FROM users;`);
    expect(rows.length).toBe(0);
  });

  it('should return 400 error as request invalid', async () => {
    const res = await request(app).post(`/${endpoints.register}`).send({ username: 'testuser', hashedKey: 'testpassword', salt: "" });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error', "Unable to register, please try again later");
    const {rows} = await pool.query(`SELECT * FROM users;`);
    expect(rows.length).toBe(0);
  });
});
