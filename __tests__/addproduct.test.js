const { addProduct } = require("../controllers/products");
const { storage } = require("../appWrite/index");

jest.mock("../DbConnect", () => ({ query: jest.fn() }));
jest.mock("node-appwrite", () => ({
  Client: jest.fn().mockReturnValue({
    setEndpoint: jest.fn().mockReturnThis(),
    setProject: jest.fn().mockReturnThis(),
    setKey: jest.fn().mockReturnThis(),
  }),
  Storage: jest.fn().mockReturnValue({
    createFile: jest.fn().mockResolvedValue({ $id: "mocked-file-id" }),
  }),
  InputFile: {
    fromBuffer: jest.fn().mockReturnValue({}), // Mock the fromBuffer method
  },
}));

describe("addProduct", () => {
  let req, res;

  beforeEach(() => {
    req = {
      session: { user: { id: 123 } },
      body: {
        name: "Test Product",
        price: "100.00",
        description: "Test description",
        category: "Test category",
        quantity: 10,
      },
      file: {
        originalname: "test-image.jpg",
        buffer: Buffer.from("test-image-content"),
      },
    };
    res = {
      json: jest.fn(),
    };
  });

  it("should return error if user is unauthorized", async () => {
    req.session.user = undefined;
    await addProduct(req, res);
    expect(res.json).toHaveBeenCalledWith({ error: "UnAthorised access!" });
  });

  it("should return error if no file is uploaded", async () => {
    req.file = undefined;
    await addProduct(req, res);
    expect(res.json).toHaveBeenCalledWith({ error: "No file uploaded" });
  });

  it("should return error if file format is not supported", async () => {
    req.file.originalname = "test-image.txt"; // Change file extension to unsupported format
    await addProduct(req, res);
    expect(res.json).toHaveBeenCalledWith({
      error: "Only JPG, JPEG, or PNG files are allowed",
    });
  });

  it("should return error if any field is empty", async () => {
    req.body.name = ""; // Make name field empty
    await addProduct(req, res);
    expect(res.json).toHaveBeenCalledWith({
      error: "All fields are required!",
    });
  });

  it("should return error if image id is undefined", async () => {
    req.body.name = ""; // Make name field empty
    await addProduct(req, res);
    expect(res.json).toHaveBeenCalledWith({
      error: "All fields are required!",
    });
  });

  it('should return "Internal server error" if an error occurs during file upload', async () => {
    storage.createFile.mockRejectedValue(new Error("File upload failed"));
    await addProduct(req, res);
    expect(res.json).toHaveBeenCalledWith({ error: "Internal server error!" });
  });

  it('should return "Internal server error" if an error occurs during database insertion', async () => {
    require("../DbConnect").query.mockImplementation(
      (sql, params, callback) => {
        callback(new Error("Database error"), null);
      }
    );
    await addProduct(req, res);
    expect(res.json).toHaveBeenCalledWith({
      error: "Internal server error!",
    });
  });

  //   it("should return 'Upload successful' if product is successfully added", async () => {
  //     await addProduct(req, res);
  //     expect(res.json).toHaveBeenCalledWith({
  //       message: "Upload successful",
  //       productId: 1,
  //     });
  //   });
});
