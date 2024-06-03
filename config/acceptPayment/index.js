const axios = require("axios");
require("dotenv").config();

const initializePayment = async (form) => {
  try {
    const amount = form.amount * 100;
    form = { ...form, amount };
    const options = {
      url: "https://api.paystack.co/transaction/initialize",
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.Test_Secret_Key}`,
        "Content-Type": "application/json",
      },
      data: form,
    };
    const response = await axios(options);
    return response;
  } catch (error) {
    return { error: error.message };
  }
};

module.exports = { initializePayment };
