export async function handler(event, context) {
  console.log("👋 HELLO WORLD FUNCTION WAS TRIGGERED");
  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Hello from the test function!" }),
  };
} 