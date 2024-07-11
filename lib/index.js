const parseProductImages = (products) => {
  return products.map((product) => {
    const productObject = product.toObject();
    productObject.images = JSON.parse(productObject.images);
    return productObject;
  });
};

const errorResponse = (error, res) => {
  if (error.name === "ValidationError") {
    const messages = Object.values(error.errors).map((err) => err.message);
    return res.json({ isError: true, message: messages.join(", ") });
  } else {
    return res.json({
      isError: true,
      message: "An error occurred, please try again.",
    });
  }
};

module.exports = { parseProductImages, errorResponse };
