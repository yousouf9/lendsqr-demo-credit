import "reflect-metadata";
import path from "path";

beforeEach(async () => {
  const file = path.basename(__filename);
  const currentTest = expect.getState().currentTestName;
  //console.log(`🧪 [${file}] ➜ ${currentTest}`);
});
