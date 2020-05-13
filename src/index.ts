try {
  require("./cli");
} catch (err) {
  console.error("An error occurred before the cli could run! Have you run \"npm install\"?");
  console.error(err);
}
