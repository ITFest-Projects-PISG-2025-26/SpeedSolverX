let startTime, interval;
function startTimer() {
  startTime = Date.now();
  interval = setInterval(() => {
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    document.getElementById('timer').innerText = `${elapsed}s`;
  }, 100);
}
function stopTimer() {
  clearInterval(interval);
}
