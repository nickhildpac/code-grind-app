import axios from "axios";

export const getJudge0LanguageId = (language) => {
  const languageMap = {
    "PYTHON": 71,
    "JAVA": 62,
    "JAVASCRIPT": 63
  }
  return languageMap[language.toUpperCase()]
}

export const submitBatch = async (submission) => {
  console.log('------------------------------');
  // console.log(submissions);
  const sub = [{ "source_code": "const fs = require('fs');\n\n// Reading input from stdin (using fs to read all input)\nconst input = fs.readFileSync(0, 'utf-8').trim();\nconst [a,b] = input.spilt(' ').map(Number);\n\nconsole.log(a+b)", "language_id": 63, "stdin": "100 200", "expected_output": "300" }, { "source_code": "const fs = require('fs');\n\n// Reading input from stdin (using fs to read all input)\nconst input = fs.readFileSync(0, 'utf-8').trim();\nconst [a,b] = input.spilt(' ').map(Number);\n\nconsole.log(a+b)", "language_id": 63, "stdin": "10 20", "expected_output": "30" }, { "source_code": "const fs = require('fs');\n\n// Reading input from stdin (using fs to read all input)\nconst input = fs.readFileSync(0, 'utf-8').trim();\nconst [a,b] = input.spilt(' ').map(Number);\n\nconsole.log(a+b)", "language_id": 63, "stdin": "0 0", "expected_output": "0" }];
  const { data } = await axios.post(`${process.env.JUDGE0_API_URL}/submissions/batch?base64_encoded=false`, {
    submissions: submission
  });
  console.log('------------------------------');
  console.log(data);
  return data;
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const pollBatchResults = async (tokens) => {
  while (true) {
    console.log(tokens.join(','));
    const { data } = await axios.get(`${process.env.JUDGE0_API_URL}/submissions/batch`, {
      params: {
        base64_encoded: false,
        tokens: tokens.join(',')
      }
    })
    const results = data.submissions;
    console.log(results);
    const isAllDone = results.every((result) => result.status.id !== 1 && result.status.id !== 2);
    if (isAllDone) {
      console.log(tokens);
      return results;
    }
    await sleep(1000);
  }
}
