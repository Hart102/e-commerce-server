const parseProductImages = (products) => {
  if (products.length > 0) {
    for (let i = 0; i < products.length; ) {
      products[i] = {
        ...products[i],
        imageId: JSON.parse(products[i].imageId),
      };
      i++;
      if (i == products.length) return products;
    }
  } else {
    return { products: [] };
  }
};

const checkEmptyKeys = (object) => {
  for (let key in object) {
    if (object[key] === "") return true;
  }
  return false;
};

module.exports = { parseProductImages, checkEmptyKeys };
