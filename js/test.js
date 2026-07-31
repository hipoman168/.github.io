"use strict";

/*
  TrueLife 真實人生
  test.js

  功能：
  1. 讀取 data/questions.json
  2. 顯示題目與 A / B 選項
  3. 記錄使用者答案
  4. 自動切換下一題
  5. 更新題數與進度條
  6. 完成後顯示結果畫面
  7. 支援重新測驗
*/

// ==============================
// 基本狀態
// ==============================

let questions = [];
let currentQuestionIndex = 0;
let answers = [];

// ==============================
// 取得 HTML 元素
// ==============================

const questionContainer = document.getElementById("question-container");
const resultContainer = document.getElementById("result-container");

const questionTitle = document.getElementById("question-title");
const questionText = document.getElementById("question-text");

const optionAButton = document.getElementById("option-a");
const optionBButton = document.getElementById("option-b");

const currentQuestionElement = document.getElementById("current-question");
const totalQuestionElement = document.getElementById("total-question");
const progressFill = document.getElementById("progress-fill");

const restartButton = document.getElementById("restart-button");

// ==============================
// 載入題目
// ==============================

async function loadQuestions() {
  try {
    setButtonsDisabled(true);

    const response = await fetch("data/questions.json");

    if (!response.ok) {
      throw new Error(`題目檔案讀取失敗：HTTP ${response.status}`);
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      throw new Error("questions.json 最外層必須是陣列。");
    }

    if (data.length === 0) {
      throw new Error("questions.json 裡沒有任何題目。");
    }

    validateQuestions(data);

    questions = data;
    currentQuestionIndex = 0;
    answers = [];

    totalQuestionElement.textContent = questions.length;

    showQuestion();
  } catch (error) {
    console.error(error);
    showLoadError(error.message);
  }
}

// ==============================
// 驗證題目資料
// ==============================

function validateQuestions(data) {
  data.forEach((question, index) => {
    const requiredFields = [
      "id",
      "title",
      "question",
      "optionA",
      "optionB"
    ];

    requiredFields.forEach((field) => {
      if (
        question[field] === undefined ||
        question[field] === null ||
        String(question[field]).trim() === ""
      ) {
        throw new Error(
          `第 ${index + 1} 筆題目缺少必要欄位：${field}`
        );
      }
    });
  });
}

// ==============================
// 顯示目前題目
// ==============================

function showQuestion() {
  if (currentQuestionIndex >= questions.length) {
    showCompletionScreen();
    return;
  }

  const currentQuestion = questions[currentQuestionIndex];

  questionContainer.hidden = false;
  resultContainer.hidden = true;

  questionTitle.textContent = currentQuestion.title;
  questionText.textContent = currentQuestion.question;

  optionAButton.textContent = `A．${currentQuestion.optionA}`;
  optionBButton.textContent = `B．${currentQuestion.optionB}`;

  currentQuestionElement.textContent = currentQuestionIndex + 1;
  totalQuestionElement.textContent = questions.length;

  updateProgressBar();
  setButtonsDisabled(false);

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

// ==============================
// 使用者選擇答案
// ==============================

function selectAnswer(choice) {
  if (
    questions.length === 0 ||
    currentQuestionIndex >= questions.length
  ) {
    return;
  }

  setButtonsDisabled(true);

  const currentQuestion = questions[currentQuestionIndex];

  answers.push({
    questionId: currentQuestion.id,
    choice: choice,
    selectedText:
      choice === "A"
        ? currentQuestion.optionA
        : currentQuestion.optionB
  });
  currentQuestionIndex += 1;
  saveProgress();
 
  window.setTimeout(() => {
    showQuestion();
  }, 200);
}

// ==============================
// 更新進度條
// ==============================

function updateProgressBar() {
  if (questions.length === 0) {
    progressFill.style.width = "0%";
    return;
  }

  const progress =
    ((currentQuestionIndex + 1) / questions.length) * 100;

  progressFill.style.width = `${progress}%`;
}

// ==============================
// 顯示完成畫面
// ==============================

function showCompletionScreen() {
  questionContainer.hidden = true;
  resultContainer.hidden = false;

  currentQuestionElement.textContent = questions.length;
  totalQuestionElement.textContent = questions.length;
  progressFill.style.width = "100%";

  localStorage.setItem(
    "truelifeAnswers",
    JSON.stringify(answers)
  );

  localStorage.setItem(
    "truelifeCompletedAt",
    new Date().toISOString()
  );

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

  console.log("TrueLife 測驗答案：", answers);
}

// ==============================
// 儲存目前作答進度
// ==============================

function saveProgress() {
  const progressData = {
    currentQuestionIndex: currentQuestionIndex,
    answers: answers
  };

  localStorage.setItem(
    "truelifeProgress",
    JSON.stringify(progressData)
  );
}

// ==============================
// 重新開始測驗
// ==============================

function restartTest() {
  const confirmed = window.confirm("確定要重新開始測驗嗎？");

  if (!confirmed) {
    return;
  }

  currentQuestionIndex = 0;
  answers = [];

  localStorage.removeItem("truelifeProgress");
  localStorage.removeItem("truelifeAnswers");
  localStorage.removeItem("truelifeCompletedAt");

  questionContainer.hidden = false;
  resultContainer.hidden = true;

  showQuestion();
}

// ==============================
// 題目載入失敗
// ==============================

function showLoadError(message) {
  questionContainer.hidden = false;
  resultContainer.hidden = true;

  questionTitle.textContent = "題目載入失敗";
  questionText.textContent =
    `${message} 請確認 data/questions.json 的路徑及 JSON 格式是否正確。`;

  optionAButton.style.display = "none";
  optionBButton.style.display = "none";

  currentQuestionElement.textContent = "0";
  totalQuestionElement.textContent = "0";
  progressFill.style.width = "0%";
}

// ==============================
// 控制按鈕狀態
// ==============================

function setButtonsDisabled(disabled) {
  optionAButton.disabled = disabled;
  optionBButton.disabled = disabled;
}

// ==============================
// 綁定按鈕事件
// ==============================

optionAButton.addEventListener("click", () => {
  selectAnswer("A");
});

optionBButton.addEventListener("click", () => {
  selectAnswer("B");
});

restartButton.addEventListener("click", restartTest);

// ==============================
// 啟動程式
// ==============================

document.addEventListener("DOMContentLoaded", loadQuestions);
