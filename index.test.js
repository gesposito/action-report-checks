const { read, summary } = require("./lib/report");

test("Reads from a HTML", async () => {
  const HTML = await read("./fixtures/report.html");
  expect(HTML).toBe(`<!DOCTYPE html>
<p>Hello world</p>
<p class="summary">Summary</p>
<p id="summary">Summary with ID</p>
`);
});

test("Reads a summary with a class selector", async () => {
  const HTML = await read("./fixtures/report.html");

  const summaryOutput = await summary(HTML, ".summary");
  expect(summaryOutput).toBe("Summary");
});

test("Reads a summary with a id selector", async () => {
  const HTML = await read("./fixtures/report.html");

  const summaryOutput = await summary(HTML, "#summary");
  expect(summaryOutput).toBe("Summary with ID");
});
