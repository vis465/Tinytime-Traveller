const express = require('express');

const router = express.Router();
API_KEY = "5I09C2ZTRGVEBSHB";

app.get("/api/top-stocks", async (req, res) => {
    try {
      const { symbol, interval } = req.query; // Get stock symbol and interval from frontend
  
      if (!symbol || !interval) {
        return res.status(400).json({ error: "Symbol and interval are required" });
      }
  
      // Determine the date based on interval
      let startDate;
      const today = new Date();
      switch (interval) {
        case "1week":
          startDate = new Date(today.setDate(today.getDate() - 7));
          break;
        case "1month":
          startDate = new Date(today.setMonth(today.getMonth() - 1));
          break;
        case "1year":
          startDate = new Date(today.setFullYear(today.getFullYear() - 1));
          break;
        case "overall":
          startDate = new Date("2008-01-01"); // API supports data since 2008
          break;
        default:
          return res.status(400).json({ error: "Invalid interval" });
      }
  
      const formattedDate = startDate.toISOString().split("T")[0]; // Convert to YYYY-MM-DD format
  
      // Fetch data from Alpha Vantage
      const url = `https://www.alphavantage.co/query?function=HISTORICAL_OPTIONS&symbol=${symbol}&date=${formattedDate}&apikey=${API_KEY}`;
      console.log("Fetching data from:", url);
  
      const response = await axios.get(url, {
        headers: { "User-Agent": "request" },
      });
      console.log(response)
      console.log("Data fetched successfully");
      res.json(response.data);
    } catch (error) {
      console.error("Error fetching stock data:", error.message);
      res.status(500).json({ error: "Failed to fetch stock data" });
    }
  });
  
  