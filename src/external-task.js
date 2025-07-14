// external-task.js
let count = 0;
setInterval(() => {
  console.log(`External task says: ${++count}`);
  if (count >= 5) process.exit(0);
}, 1000);
