const fs = require("fs").promises;
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const read = async (reportPath) => {
  const data = await fs.readFile(reportPath, "binary");
  return data;
};

const summary = async (html, selector) => {
  const dom = new JSDOM(html);
  return dom.window.document.querySelector(selector).textContent;
};

module.exports = { read, summary };
