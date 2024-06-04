const parseProductImages = (products) => {
  if (products.length > 0) {
    for (let i = 0; i < products.length; ) {
      products[i] = {
        ...products[i],
        images: JSON.parse(products[i].images),
      };
      i++;
      if (i == products.length) return products;
    }
  } else {
    return { products: [] };
  }
};


module.exports = { parseProductImages };
