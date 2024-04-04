const { register } = require("../controllers/userController");
const connection = require("../DbConnect");

// Mocking the connection.query method
jest.mock("../DbConnect", () => ({
  query: jest.fn(),
}));

describe("register function", () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {
        firstname: "John",
        lastname: "Doe",
        email: "chi@gmail.com",
        phone: "1234567890",
        address: "123 Main St",
        password: "password123",
      },
    };
    res = {
      json: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return an error if any field is missing", async () => {
    req.body = {}; // Simulating missing fields intentionally
    await register(req, res);
    expect(res.json).toHaveBeenCalledWith({ error: "All fields are required" });
  });

  it("should return an error if the email already exists", async () => {
    const mockedResult = [{ count: 1 }];
    connection.query.mockImplementationOnce((query, params, callback) => {
      callback(null, mockedResult);
    });

    await register(req, res);
    expect(res.json).toHaveBeenCalledWith({ error: "Email already exists" });
  });

  it("should return an error if there is an internal server error during email check", async () => {
    connection.query.mockImplementationOnce((query, params, callback) => {
      callback(new Error("Database error"));
    });

    await register(req, res);
    expect(res.json).toHaveBeenCalledWith({ error: "Internal server error" });
  });

  it("should return an error if there is an internal server error during user registration", async () => {
    const mockedResult = [{ count: 0 }];
    connection.query.mockImplementationOnce((query, params, callback) => {
      callback(null, mockedResult);
    });

    connection.query.mockImplementationOnce((query, params, callback) => {
      callback(new Error("Database error"));
    });

    await register(req, res);
    expect(res.json).toHaveBeenCalledWith({ error: "Internal server error" });
  });

  it("should register a new user successfully", async () => {
    const mockedResult = [{ count: 0 }];
    connection.query.mockImplementationOnce((query, params, callback) => {
      callback(null, mockedResult);
    });

    const insertResult = { insertId: 1 };
    connection.query.mockImplementationOnce((query, params, callback) => {
      callback(null, insertResult);
    });

    await register(req, res);
    expect(res.json).toHaveBeenCalledWith({
      message: "User registered successfully",
      userId: insertResult.insertId,
    });
  });
});
