"use strict";

/*
  TrueLife 真實人生
  完整測驗程式 v1.0

  六個價值維度：
  empathy        同理
  integrity      誠信
  courage        勇氣
  prudence       審慎
  autonomy       自主
  responsibility 責任
*/

// =========================================================
// 基本狀態
// =========================================================

let questions = [];
let currentQuestionIndex = 0;
let answers = [];
let resultChart = null;
let isAnswering = false;

const DIMENSIONS = [
  "empathy",
  "integrity",
  "courage",
  "prudence",
  "autonomy",
  "responsibility"
];

const DIMENSION_INFO = {
  empathy: {
    name: "同理",
    description: "你如何感受他人的處境，並把關係、照顧與情感代價納入決策。"
  },
  integrity: {
    name: "誠信",
    description: "即使沒有人監督，你是否仍重視規則、誠實與一致的道德原則。"
  },
  courage: {
    name: "勇氣",
    description: "面對風險、衝突或不確定性時，你是否願意採取行動並承擔代價。"
  },
  prudence: {
    name: "審慎",
    description: "你是否會衡量風險、資源與長期後果，避免衝動或不可逆的損失。"
  },
  autonomy: {
    name: "自主",
    description: "你是否重視個人界線、自由選擇與按照自身價值安排人生。"
  },
  responsibility: {
    name: "責任",
    description: "你是否願意承擔承諾、角色義務，以及選擇對家庭與群體造成的後果。"
  }
};

/*
  每一題的 A / B 都會對六個維度給分。
  這些分數不是判定對錯，而是描述該選擇較可能反映的價值取向。
*/
const SCORING_MAP = {
  1:  { A: { empathy:3, integrity:1, courage:2, prudence:0, autonomy:0, responsibility:3 }, B: { empathy:2, integrity:1, courage:1, prudence:3, autonomy:1, responsibility:2 } },
  2:  { A: { empathy:0, integrity:2, courage:2, prudence:2, autonomy:2, responsibility:1 }, B: { empathy:3, integrity:1, courage:1, prudence:1, autonomy:0, responsibility:2 } },
  3:  { A: { empathy:1, integrity:1, courage:3, prudence:1, autonomy:3, responsibility:1 }, B: { empathy:3, integrity:1, courage:0, prudence:2, autonomy:0, responsibility:3 } },
  4:  { A: { empathy:1, integrity:1, courage:3, prudence:0, autonomy:3, responsibility:0 }, B: { empathy:1, integrity:1, courage:0, prudence:3, autonomy:1, responsibility:1 } },
  5:  { A: { empathy:3, integrity:1, courage:1, prudence:0, autonomy:0, responsibility:2 }, B: { empathy:1, integrity:1, courage:1, prudence:3, autonomy:3, responsibility:2 } },
  6:  { A: { empathy:1, integrity:3, courage:3, prudence:2, autonomy:1, responsibility:3 }, B: { empathy:3, integrity:1, courage:1, prudence:1, autonomy:1, responsibility:2 } },
  7:  { A: { empathy:1, integrity:3, courage:3, prudence:2, autonomy:1, responsibility:3 }, B: { empathy:2, integrity:0, courage:0, prudence:1, autonomy:1, responsibility:0 } },
  8:  { A: { empathy:0, integrity:0, courage:0, prudence:0, autonomy:2, responsibility:0 }, B: { empathy:1, integrity:3, courage:3, prudence:2, autonomy:2, responsibility:3 } },
  9:  { A: { empathy:3, integrity:1, courage:2, prudence:0, autonomy:0, responsibility:3 }, B: { empathy:3, integrity:1, courage:2, prudence:1, autonomy:0, responsibility:3 } },
  10: { A: { empathy:2, integrity:1, courage:3, prudence:1, autonomy:1, responsibility:3 }, B: { empathy:2, integrity:1, courage:1, prudence:3, autonomy:3, responsibility:2 } },
  11: { A: { empathy:0, integrity:1, courage:1, prudence:0, autonomy:2, responsibility:0 }, B: { empathy:0, integrity:2, courage:1, prudence:3, autonomy:2, responsibility:3 } },
  12: { A: { empathy:1, integrity:1, courage:3, prudence:1, autonomy:3, responsibility:1 }, B: { empathy:2, integrity:1, courage:1, prudence:3, autonomy:1, responsibility:3 } },
  13: { A: { empathy:3, integrity:1, courage:2, prudence:1, autonomy:3, responsibility:2 }, B: { empathy:2, integrity:1, courage:1, prudence:3, autonomy:0, responsibility:3 } },
  14: { A: { empathy:2, integrity:1, courage:2, prudence:0, autonomy:0, responsibility:3 }, B: { empathy:3, integrity:2, courage:2, prudence:3, autonomy:2, responsibility:2 } },
  15: { A: { empathy:3, integrity:2, courage:3, prudence:1, autonomy:3, responsibility:2 }, B: { empathy:2, integrity:1, courage:1, prudence:2, autonomy:0, responsibility:3 } },
  16: { A: { empathy:3, integrity:1, courage:1, prudence:0, autonomy:1, responsibility:2 }, B: { empathy:1, integrity:1, courage:1, prudence:3, autonomy:2, responsibility:1 } },
  17: { A: { empathy:2, integrity:0, courage:1, prudence:1, autonomy:3, responsibility:1 }, B: { empathy:0, integrity:3, courage:1, prudence:2, autonomy:1, responsibility:3 } },
  18: { A: { empathy:2, integrity:3, courage:1, prudence:2, autonomy:1, responsibility:3 }, B: { empathy:0, integrity:0, courage:0, prudence:1, autonomy:2, responsibility:0 } },
  19: { A: { empathy:0, integrity:0, courage:0, prudence:1, autonomy:2, responsibility:0 }, B: { empathy:2, integrity:3, courage:1, prudence:2, autonomy:1, responsibility:3 } },
  20: { A: { empathy:1, integrity:2, courage:3, prudence:0, autonomy:3, responsibility:1 }, B: { empathy:1, integrity:1, courage:0, prudence:3, autonomy:0, responsibility:3 } },
  21: { A: { empathy:1, integrity:3, courage:3, prudence:0, autonomy:3, responsibility:1 }, B: { empathy:1, integrity:1, courage:0, prudence:3, autonomy:0, responsibility:3 } },
  22: { A: { empathy:3, integrity:3, courage:3, prudence:1, autonomy:2, responsibility:3 }, B: { empathy:0, integrity:0, courage:0, prudence:3, autonomy:1, responsibility:1 } },
  23: { A: { empathy:0, integrity:1, courage:3, prudence:0, autonomy:3, responsibility:1 }, B: { empathy:1, integrity:1, courage:0, prudence:3, autonomy:1, responsibility:3 } },
  24: { A: { empathy:3, integrity:1, courage:3, prudence:0, autonomy:1, responsibility:2 }, B: { empathy:0, integrity:1, courage:0, prudence:3, autonomy:2, responsibility:2 } },
  25: { A: { empathy:3, integrity:1, courage:1, prudence:0, autonomy:0, responsibility:2 }, B: { empathy:1, integrity:1, courage:1, prudence:3, autonomy:3, responsibility:1 } },
  26: { A: { empathy:0, integrity:1, courage:2, prudence:3, autonomy:1, responsibility:3 }, B: { empathy:0, integrity:1, courage:0, prudence:0, autonomy:2, responsibility:0 } },
  27: { A: { empathy:2, integrity:2, courage:1, prudence:1, autonomy:1, responsibility:3 }, B: { empathy:0, integrity:1, courage:1, prudence:3, autonomy:3, responsibility:1 } },
  28: { A: { empathy:2, integrity:1, courage:2, prudence:1, autonomy:0, responsibility:2 }, B: { empathy:1, integrity:2, courage:2, prudence:2, autonomy:3, responsibility:1 } },
  29: { A: { empathy:0, integrity:2, courage:3, prudence:0, autonomy:3, responsibility:1 }, B: { empathy:1, integrity:1, courage:0, prudence:3, autonomy:1, responsibility:2 } },
  30: { A: { empathy:0, integrity:1, courage:1, prudence:0, autonomy:2, responsibility:0 }, B: { empathy:1, integrity:1, courage:1, prudence:3, autonomy:3, responsibility:2 } },
  31: { A: { empathy:1, integrity:2, courage:3, prudence:2, autonomy:3, responsibility:3 }, B: { empathy:0, integrity:0, courage:0, prudence:1, autonomy:1, responsibility:0 } }
};

const PROFILE_TEXT = {
  empathy: {
    title: "關係守護者",
    summary: "你傾向先看見人的處境，再衡量事情本身。對你而言，選擇不只涉及利益，也涉及誰會受傷、誰需要被照顧。"
  },
  integrity: {
    title: "原則堅守者",
    summary: "你重視行為是否經得起檢驗。即使短期利益誘人，你仍傾向維持誠實、公平與一致的標準。"
  },
  courage: {
    title: "行動挑戰者",
    summary: "當你認為事情值得，你較願意承擔風險、面對衝突並主動改變現況，而不是只維持安全。"
  },
  prudence: {
    title: "穩健衡量者",
    summary: "你習慣先估算風險、成本與不可逆後果。你並非缺乏行動力，而是不輕易把自己與重要的人推入失控局面。"
  },
  autonomy: {
    title: "自主開路者",
    summary: "你重視界線、選擇權與真實意願。你希望人生由自己負責，而不是長期被角色期待或他人評價牽引。"
  },
  responsibility: {
    title: "責任承擔者",
    summary: "你會把承諾、家庭與群體後果放進考量。你傾向選擇能長期承擔、而非只讓當下好過的方案。"
  }
};

// =========================================================
// HTML 元素
// =========================================================

const progressSection = document.getElementById("progress-section");
const questionContainer = document.getElementById("question-container");
const resultContainer = document.getElementById("result-container");
const questionTitle = document.getElementById("question-title");
const questionText = document.getElementById("question-text");
const optionAButton = document.getElementById("option-a");
const optionBButton = document.getElementById("option-b");
const currentQuestionElement = document.getElementById("current-question");
const totalQuestionElement = document.getElementById("total-question");
const progressFill = document.getElementById("progress-fill");
const resultType = document.getElementById("result-type");
const resultSummary = document.getElementById("result-summary");
const resultComment = document.getElementById("result-comment");
const dimensionResults = document.getElementById("dimension-results");
const restartButton = document.getElementById("restart-button");
const resultCanvas = document.getElementById("result-chart");

// =========================================================
// 啟動與題目載入
// =========================================================

async function loadQuestions() {
  try {
    validateRequiredElements();
    setButtonsDisabled(true);

    const response = await fetch("data/questions.json", { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`題目檔案讀取失敗：HTTP ${response.status}`);
    }

    const data = await response.json();
    validateQuestions(data);

    questions = data;
    currentQuestionIndex = 0;
    answers = [];
    totalQuestionElement.textContent = String(questions.length);

    showQuestion();
  } catch (error) {
    console.error("TrueLife 啟動失敗：", error);
    showLoadError(error instanceof Error ? error.message : "未知錯誤");
  }
}

function validateRequiredElements() {
  const required = {
    progressSection,
    questionContainer,
    resultContainer,
    questionTitle,
    questionText,
    optionAButton,
    optionBButton,
    currentQuestionElement,
    totalQuestionElement,
    progressFill,
    resultType,
    resultSummary,
    resultComment,
    dimensionResults,
    restartButton,
    resultCanvas
  };

  const missing = Object.entries(required)
    .filter(([, element]) => !element)
    .map(([name]) => name);

  if (missing.length > 0) {
    throw new Error(`test.html 缺少必要元素：${missing.join(", ")}`);
  }
}

function validateQuestions(data) {
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error("questions.json 必須是非空陣列。");
  }

  data.forEach((question, index) => {
    ["id", "title", "question", "optionA", "optionB"].forEach((field) => {
      if (question[field] === undefined || String(question[field]).trim() === "") {
        throw new Error(`第 ${index + 1} 筆題目缺少欄位：${field}`);
      }
    });

    if (!SCORING_MAP[question.id]) {
      throw new Error(`題目 ID ${question.id} 沒有計分規則。`);
    }
  });
}

// =========================================================
// 題目流程
// =========================================================

function showQuestion() {
  if (currentQuestionIndex >= questions.length) {
    showCompletionScreen();
    return;
  }

  const currentQuestion = questions[currentQuestionIndex];

  progressSection.hidden = false;
  questionContainer.hidden = false;
  resultContainer.hidden = true;

  questionTitle.textContent = currentQuestion.title;
  questionText.textContent = currentQuestion.question;
  optionAButton.textContent = `A．${currentQuestion.optionA}`;
  optionBButton.textContent = `B．${currentQuestion.optionB}`;
  currentQuestionElement.textContent = String(currentQuestionIndex + 1);
  totalQuestionElement.textContent = String(questions.length);

  updateProgressBar();
  isAnswering = false;
  setButtonsDisabled(false);

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function selectAnswer(choice) {
  if (isAnswering || !["A", "B"].includes(choice)) return;
  if (questions.length === 0 || currentQuestionIndex >= questions.length) return;

  isAnswering = true;
  setButtonsDisabled(true);

  const currentQuestion = questions[currentQuestionIndex];
  answers.push({
    questionId: currentQuestion.id,
    choice,
    selectedText: choice === "A" ? currentQuestion.optionA : currentQuestion.optionB
  });

  currentQuestionIndex += 1;
  saveProgress();

  window.setTimeout(showQuestion, 180);
}

function updateProgressBar() {
  if (questions.length === 0) {
    progressFill.style.width = "0%";
    return;
  }

  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  progressFill.style.width = `${Math.min(progress, 100)}%`;
}

// =========================================================
// 計算結果
// =========================================================

function calculateResults() {
  const rawScores = Object.fromEntries(DIMENSIONS.map((key) => [key, 0]));
  const minimumScores = Object.fromEntries(DIMENSIONS.map((key) => [key, 0]));
  const maximumScores = Object.fromEntries(DIMENSIONS.map((key) => [key, 0]));

  questions.forEach((question) => {
    const rules = SCORING_MAP[question.id];
    DIMENSIONS.forEach((dimension) => {
      const a = Number(rules.A[dimension] || 0);
      const b = Number(rules.B[dimension] || 0);
      minimumScores[dimension] += Math.min(a, b);
      maximumScores[dimension] += Math.max(a, b);
    });
  });

  answers.forEach((answer) => {
    const rule = SCORING_MAP[answer.questionId]?.[answer.choice];
    if (!rule) return;
    DIMENSIONS.forEach((dimension) => {
      rawScores[dimension] += Number(rule[dimension] || 0);
    });
  });

  const percentages = {};
  DIMENSIONS.forEach((dimension) => {
    const range = maximumScores[dimension] - minimumScores[dimension];
    const normalized = range > 0
      ? ((rawScores[dimension] - minimumScores[dimension]) / range) * 100
      : 50;
    percentages[dimension] = Math.max(0, Math.min(100, Math.round(normalized)));
  });

  return { rawScores, percentages };
}

function getDimensionRanking(percentages) {
  return DIMENSIONS
    .map((key) => ({ key, score: percentages[key] }))
    .sort((a, b) => b.score - a.score);
}

// =========================================================
// 顯示結果
// =========================================================

function showCompletionScreen() {
  questionContainer.hidden = true;
  progressSection.hidden = true;
  resultContainer.hidden = false;

  try {
    if (answers.length !== questions.length) {
      throw new Error(`答案數量不完整：${answers.length}/${questions.length}`);
    }

    const results = calculateResults();
    const ranking = getDimensionRanking(results.percentages);

    renderCoreResult(ranking, results.percentages);
    renderDimensionResults(results.percentages);
    renderComment(ranking, results.percentages);
    renderChart(results.percentages);

    localStorage.setItem("truelifeAnswers", JSON.stringify(answers));
    localStorage.setItem("truelifeResults", JSON.stringify(results));
    localStorage.setItem("truelifeCompletedAt", new Date().toISOString());
    localStorage.removeItem("truelifeProgress");
  } catch (error) {
    console.error("結果頁建立失敗：", error);
    resultType.textContent = "結果產生失敗";
    resultSummary.textContent = "程式無法完成分析，請重新測驗或開啟瀏覽器主控台查看錯誤。";
    resultComment.textContent = error instanceof Error ? error.message : "未知錯誤";
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderCoreResult(ranking, percentages) {
  const first = ranking[0];
  const second = ranking[1];
  const profile = PROFILE_TEXT[first.key];

  resultType.textContent = profile.title;
  resultSummary.textContent = `${profile.summary} 你的最高維度是${DIMENSION_INFO[first.key].name}（${first.score}%），其次是${DIMENSION_INFO[second.key].name}（${second.score}%）。`;

  // 讓螢幕閱讀器也能取得結果概要
  resultContainer.setAttribute(
    "aria-label",
    `測驗結果：${profile.title}。最高維度${DIMENSION_INFO[first.key].name}${percentages[first.key]}%。`
  );
}

function renderDimensionResults(percentages) {
  dimensionResults.innerHTML = "";

  getDimensionRanking(percentages).forEach(({ key, score }) => {
    const info = DIMENSION_INFO[key];
    const card = document.createElement("article");
    card.className = "dimension-card";

    const title = document.createElement("h3");
    title.textContent = info.name;

    const description = document.createElement("p");
    description.textContent = info.description;

    const scoreElement = document.createElement("span");
    scoreElement.className = "dimension-score";
    scoreElement.textContent = `${score}%`;

    const track = document.createElement("div");
    track.className = "dimension-bar";
    track.setAttribute("aria-hidden", "true");

    const fill = document.createElement("div");
    fill.className = "dimension-bar-fill";
    fill.style.width = `${score}%`;

    track.appendChild(fill);
    card.append(title, description, scoreElement, track);
    dimensionResults.appendChild(card);
  });
}

function renderComment(ranking, percentages) {
  const high = ranking.slice(0, 2);
  const low = ranking[ranking.length - 1];
  const spread = high[0].score - low.score;

  const balanceText = spread <= 20
    ? "你的六個維度相對均衡，表示你會依情境調整判斷，而不容易只用單一原則處理所有問題。"
    : `你的選擇呈現明顯排序：你最優先考慮${DIMENSION_INFO[high[0].key].name}，相對較少優先考慮${DIMENSION_INFO[low.key].name}。這不是缺點，而是代表你在衝突中通常先保護某一類價值。`;

  const tensionText = buildTensionComment(high[0].key, high[1].key);
  const reflection = buildReflectionQuestion(low.key, percentages[low.key]);

  resultComment.textContent = `${balanceText}\n\n${tensionText}\n\n${reflection}\n\n本結果描述的是你在這 31 個情境中的選擇傾向，不是固定人格，也不代表任何選項具有絕對的對錯。`;
}

function buildTensionComment(first, second) {
  const pair = new Set([first, second]);

  if (pair.has("empathy") && pair.has("responsibility")) {
    return "你常把照顧他人與承擔角色責任放在前面。優勢是可靠而有溫度；需要留意的是，不要把所有人的需要都變成自己的義務。";
  }
  if (pair.has("integrity") && pair.has("courage")) {
    return "你不只重視原則，也較願意為原則採取行動。這使你在不公平或違規情境中較可能站出來，但也要評估行動方式，避免不必要的自我耗損。";
  }
  if (pair.has("prudence") && pair.has("responsibility")) {
    return "你傾向選擇可長期承擔的方案，尤其在家庭、財務與健康問題上較重視穩定。這能降低重大損失，但要小心過度等待而錯過改變機會。";
  }
  if (pair.has("autonomy") && pair.has("courage")) {
    return "你重視由自己決定人生，也願意承擔選擇的風險。你的推進力很強；關鍵是確認行動不是只為了逃離限制，而是朝真正重要的方向前進。";
  }
  if (pair.has("empathy") && pair.has("prudence")) {
    return "你會同時看見人的感受與現實限制。這種判斷通常較細緻，但也可能因為想兼顧所有人而延後決定。";
  }
  if (pair.has("integrity") && pair.has("responsibility")) {
    return "你重視規則，也重視自己對群體的義務。你通常值得信賴；需要留意的是，制度本身不一定永遠公平，守規則之外仍要保留判斷。";
  }

  return `你的主要組合是${DIMENSION_INFO[first].name}與${DIMENSION_INFO[second].name}。你通常會先用這兩種價值篩選選項，再考慮其他代價。`;
}

function buildReflectionQuestion(lowKey, score) {
  const questionsByDimension = {
    empathy: "當效率或原則優先時，你是否仍有為他人的感受留下足夠空間？",
    integrity: "當情勢複雜時，你是否可能為了方便而降低自己原本認同的標準？",
    courage: "當你已經知道什麼需要改變時，是否常因風險而延後真正的行動？",
    prudence: "當你很想做某件事時，是否有充分估算成本、退路與不可逆後果？",
    autonomy: "你做出的選擇有多少是出於真實意願，又有多少只是迎合角色期待？",
    responsibility: "追求自由或當下感受時，你是否也清楚承擔選擇對他人的後果？"
  };

  return `較低的${DIMENSION_INFO[lowKey].name}分數（${score}%）提供一個反思方向：${questionsByDimension[lowKey]}`;
}

function renderChart(percentages) {
  if (!resultCanvas) return;

  if (typeof window.Chart === "undefined") {
    console.error("Chart.js 沒有成功載入；文字結果仍可正常使用。");
    return;
  }

  if (resultChart) {
    resultChart.destroy();
  }

  resultChart = new window.Chart(resultCanvas, {
    type: "radar",
    data: {
      labels: DIMENSIONS.map((key) => DIMENSION_INFO[key].name),
      datasets: [{
        label: "你的價值傾向",
        data: DIMENSIONS.map((key) => percentages[key]),
        backgroundColor: "rgba(244, 241, 235, 0.16)",
        borderColor: "rgba(244, 241, 235, 0.95)",
        pointBackgroundColor: "rgba(244, 241, 235, 1)",
        pointBorderColor: "#111111",
        pointHoverBackgroundColor: "#ffffff",
        borderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 700 },
      plugins: {
        legend: {
          labels: {
            color: "rgba(244, 241, 235, 0.9)",
            font: { size: 14 }
          }
        },
        tooltip: {
          callbacks: {
            label(context) {
              return `${context.dataset.label}：${context.raw}%`;
            }
          }
        }
      },
      scales: {
        r: {
          min: 0,
          max: 100,
          beginAtZero: true,
          ticks: {
            display: true,
            stepSize: 20,
            color: "rgba(244, 241, 235, 0.58)",
            backdropColor: "transparent"
          },
          grid: { color: "rgba(244, 241, 235, 0.16)" },
          angleLines: { color: "rgba(244, 241, 235, 0.16)" },
          pointLabels: {
            color: "rgba(244, 241, 235, 0.95)",
            font: { size: 15, weight: "600" }
          }
        }
      }
    }
  });
}

// =========================================================
// 儲存、重測與錯誤處理
// =========================================================

function saveProgress() {
  localStorage.setItem(
    "truelifeProgress",
    JSON.stringify({ currentQuestionIndex, answers })
  );
}

function restartTest() {
  const confirmed = window.confirm("確定要重新開始測驗嗎？");
  if (!confirmed) return;

  currentQuestionIndex = 0;
  answers = [];
  isAnswering = false;

  if (resultChart) {
    resultChart.destroy();
    resultChart = null;
  }

  localStorage.removeItem("truelifeProgress");
  localStorage.removeItem("truelifeAnswers");
  localStorage.removeItem("truelifeResults");
  localStorage.removeItem("truelifeCompletedAt");

  resultType.textContent = "分析中……";
  resultSummary.textContent = "正在整理你的選擇……";
  resultComment.textContent = "正在產生分析內容……";
  dimensionResults.innerHTML = "";

  showQuestion();
}

function showLoadError(message) {
  if (questionContainer) questionContainer.hidden = false;
  if (resultContainer) resultContainer.hidden = true;
  if (questionTitle) questionTitle.textContent = "題目載入失敗";
  if (questionText) {
    questionText.textContent = `${message} 請確認 data/questions.json 的路徑與 JSON 格式。`;
  }
  if (optionAButton) optionAButton.style.display = "none";
  if (optionBButton) optionBButton.style.display = "none";
  if (currentQuestionElement) currentQuestionElement.textContent = "0";
  if (totalQuestionElement) totalQuestionElement.textContent = "0";
  if (progressFill) progressFill.style.width = "0%";
}

function setButtonsDisabled(disabled) {
  if (optionAButton) optionAButton.disabled = disabled;
  if (optionBButton) optionBButton.disabled = disabled;
}

optionAButton?.addEventListener("click", () => selectAnswer("A"));
optionBButton?.addEventListener("click", () => selectAnswer("B"));
restartButton?.addEventListener("click", restartTest);

document.addEventListener("DOMContentLoaded", loadQuestions);
