const readline = require("readline");
const axios = require("axios");
const dotenv = require("dotenv");

// Load environment variables from .env file
dotenv.config();

// Get environment variables or use defaults
const API_BASE_URL = process.env.API_BASE_URL || "https://admin.winlads.lk";
const GIVEAWAY_ID = process.env.GIVEAWAY_ID || "cm69b6cia0002ez4iwz8mj01w";
const API_ENDPOINT = `${API_BASE_URL}/entries/add-entries-for-giveaway`;

// Create readline interface for CLI input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Function to ask a question and get user input
function askQuestion(query) {
  return new Promise((resolve) => {
    rl.question(query, (answer) => {
      resolve(answer);
    });
  });
}

// Main function to run the program
async function main() {
  try {
    console.log(`Using API: ${API_BASE_URL}`);
    console.log(`Using Giveaway ID: ${GIVEAWAY_ID}`);
    console.log("-----------------------------------\n");

    // Get the authentication token at the start
    let authToken = await askQuestion("Enter your authentication token: ");

    // Flag to control the loop
    let continueRunning = true;

    while (continueRunning) {
      try {
        // Get user inputs
        const userId = await askQuestion("Enter userId: ");
        const entries = parseInt(
          await askQuestion("Enter number of entries: ")
        );
        const times = await askQuestion("Enter times value (e.g., 2): ");

        // Format the reason
        const reason = `PADDOCK PROMO ${times}x`;

        // Prepare request body
        const requestBody = {
          userId: userId,
          giveawayId: GIVEAWAY_ID,
          entries: entries,
          reason: reason,
        };

        // Make the API call
        console.log("\nSending request...");
        const response = await axios.post(API_ENDPOINT, requestBody, {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        });

        // Print the response
        console.log("\nResponse Status:", response.status);
        console.log("Response Data:", JSON.stringify(response.data, null, 2));
        console.log("\n-----------------------------------\n");
      } catch (error) {
        console.error("\nError occurred:");

        if (error.response && error.response.status === 500) {
          console.error(error.response.data);
          console.error("Maybe authentication token expired (500 error).");
          authToken = await askQuestion(
            "Please enter a new authentication token: "
          );
          continue;
        } else {
          console.error(
            error.response
              ? `Status: ${error.response.status}, Message: ${JSON.stringify(
                  error.response.data
                )}`
              : error.message
          );
        }
      }

      const continueAnswer = await askQuestion(
        "Do you want to enter another user? (y/n): "
      );
      continueRunning = continueAnswer.toLowerCase() === "y";
    }

    console.log("Program finished. Goodbye!");
    rl.close();
  } catch (mainError) {
    console.error("A critical error occurred:", mainError);
    rl.close();
  }
}

// Start the program
main();
