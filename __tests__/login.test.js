const connection = require("../DbConnect");
const { login } = require("../controllers/userController");

jest.mock("../DbConnect", () => ({ query: jest.fn() }));

describe("login function", () => {
  let req, res;

  beforeEach(() => {
    req = { body: { email: "hart@gmail.com", password: "123" } };
    res = { json: jest.fn() };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return error if any field is missing", async () => {
    req.body = {};
    await login(req, res);
    expect(res.json).toHaveBeenCalledWith({ error: "All fields are required" });
  });

  it("should return error if there is internal server error when searching for user", async () => {
    connection.query.mockImplementationOnce((query, params, callback) => {
      callback(new Error("Database error"));
    });

    await login(req, res);
    expect(res.json).toHaveBeenCalledWith({
      error: "Internal server error",
    });
  });

  it("should return error if user is not found", async () => {
    const mockedResult = [];
    connection.query.mockImplementationOnce((query, params, callback) => {
      callback(null, mockedResult);
    });

    await login(req, res);
    expect(res.json).toHaveBeenCalledWith({ error: "User not found" });
  });
});
