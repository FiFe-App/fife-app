const mongodb = require("mongodb");
const request = require("supertest");
const app = require("../index");

require("dotenv").config();

beforeEach(async () => {
    const mongoClient = new mongodb.MongoClient(process.env.ATLAS_URI);
    const clientPromise = mongoClient.connect();
    db = (await clientPromise).db('fifeapp');
  });
  
  /* Closing database connection after each test. */
  afterEach(async () => {
    //mongodb.
  });

  describe("GET /users", () => {
    it("should return all products", async () => {
      const res = await request(app).get("/users");
      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBeGreaterThan(0);
    });
  });