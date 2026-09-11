const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

/* =========================================================
   HELPERS
   ========================================================= */

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function hashText(text) {
  let hash = 0;

  for (let i = 0; i < text.length; i++) {
    hash = (hash * 31 + text.charCodeAt(i)) >>> 0;
  }

  return hash;
}

/* =========================================================
   QUESTION PARSER
   ========================================================= */

function parseQuestion(question) {
  const text = question.toLowerCase();

  // -----------------------------
  // Instrument
  // -----------------------------

  let instrument = "NIFTY";

  if (
    text.includes("banknifty") ||
    text.includes("bank nifty")
  ) {
    instrument = "BANKNIFTY";
  } else if (text.includes("sensex")) {
    instrument = "SENSEX";
  }

  // -----------------------------
  // Percentage
  // -----------------------------

  let percentage = null;

  const percentageMatch = text.match(
    /(\d+(?:\.\d+)?)\s*%/
  );

  if (percentageMatch) {
    percentage = Number(percentageMatch[1]);
  }

  // -----------------------------
  // Direction
  // -----------------------------

  let direction = null;

  const fallWords = [
    "fall",
    "falls",
    "fell",
    "drop",
    "drops",
    "dropped",
    "decline",
    "declines",
    "declined",
    "down",
  ];

  const riseWords = [
    "rise",
    "rises",
    "rose",
    "increase",
    "increases",
    "increased",
    "up",
  ];

  if (fallWords.some((word) => text.includes(word))) {
    direction = "fall";
  } else if (
    riseWords.some((word) => text.includes(word))
  ) {
    direction = "rise";
  }

  // -----------------------------
  // Volatility
  // -----------------------------

  const highVolatility =
    text.includes("high volatility") ||
    text.includes("high-volatility") ||
    text.includes("volatile") ||
    text.includes("high vix");

  const lowVolatility =
    text.includes("low volatility") ||
    text.includes("low-volatility") ||
    text.includes("calm market");

  // -----------------------------
  // Holding period
  // -----------------------------

  let holdingPeriod = "1 trading day";
  let holdingSpecified = false;

  const dayMatch = text.match(
    /(\d+)\s*(?:trading\s*)?days?/
  );

  if (dayMatch) {
    const days = Number(dayMatch[1]);

    holdingPeriod =
      `${days} trading day${days === 1 ? "" : "s"}`;

    holdingSpecified = true;
  }

  if (
    text.includes("week") ||
    text.includes("weekly")
  ) {
    holdingPeriod = "1 trading week";
    holdingSpecified = true;
  }

  if (
    text.includes("month") ||
    text.includes("monthly")
  ) {
    holdingPeriod = "1 trading month";
    holdingSpecified = true;
  }

  // -----------------------------
  // Core research condition
  // -----------------------------

  const hasMarketCondition =
    highVolatility ||
    lowVolatility ||
    direction !== null;

  return {
    instrument,
    percentage,
    direction,
    highVolatility,
    lowVolatility,
    holdingPeriod,
    holdingSpecified,
    hasMarketCondition,
  };
}

/* =========================================================
   ROOT
   ========================================================= */

app.get("/", (req, res) => {
  res.json({
    success: true,
    message:
      "AI Trading Research Assistant API is running",
  });
});

/* =========================================================
   ANALYZE
   ========================================================= */

app.post("/api/analyze", (req, res) => {
  const { question } = req.body;

  if (!question || !question.trim()) {
    return res.status(400).json({
      success: false,
      message: "Please enter a research question.",
    });
  }

  const parsed = parseQuestion(question);

  const {
    instrument,
    percentage,
    direction,
    highVolatility,
    lowVolatility,
    holdingPeriod,
    holdingSpecified,
    hasMarketCondition,
  } = parsed;

  /* =======================================================
     CLARIFICATION ENGINE
     ======================================================= */

  const missingInformation = [];

  if (!hasMarketCondition) {
    missingInformation.push(
      "Market condition or entry trigger"
    );
  }

  if (percentage !== null && direction === null) {
    missingInformation.push(
      "Direction of the percentage move (fall or rise)"
    );
  }

  const needsClarification =
    missingInformation.length > 0;

  /* =======================================================
     UNDERSTANDING
     ======================================================= */

  const understanding = {
    instrument,
    timeframe: "Daily",
    fallPercentage: percentage,
    highVolatility,
    lowVolatility,
    direction,
  };

  /* =======================================================
     CLARIFICATION RESPONSE
     ======================================================= */

  if (needsClarification) {
    const questions = [];

    if (!hasMarketCondition) {
      questions.push(
        "What market condition or entry trigger should be tested?"
      );
    }

    if (percentage !== null && direction === null) {
      questions.push(
        "Should the percentage move represent a fall or a rise?"
      );
    }

    questions.push(
      "What holding period should be used?"
    );

    return res.json({
      success: true,
      needsClarification: true,

      question,

      understanding,

      clarification: {
        missingInformation,
        questions,
      },

      message:
        "The research question needs clarification before a meaningful experiment can be defined.",
    });
  }

  /* =======================================================
     EXPERIMENT DEFINITION
     ======================================================= */

  let entryCondition;

  if (
    percentage !== null &&
    direction === "fall"
  ) {
    entryCondition =
      `Buy ${instrument} after a ${percentage}% fall`;
  } else if (
    percentage !== null &&
    direction === "rise"
  ) {
    entryCondition =
      `Buy ${instrument} after a ${percentage}% rise`;
  } else if (highVolatility) {
    entryCondition =
      `Evaluate ${instrument} during high-volatility periods`;
  } else if (lowVolatility) {
    entryCondition =
      `Evaluate ${instrument} during low-volatility periods`;
  } else {
    entryCondition =
      `Evaluate ${instrument} under the selected market condition`;
  }

  let volatilityFilter = "All market conditions";

  if (highVolatility) {
    volatilityFilter =
      "High-volatility periods";
  }

  if (lowVolatility) {
    volatilityFilter =
      "Low-volatility periods";
  }

  const experiment = {
    instrument,

    timeframe: "Daily",

    entryCondition,

    volatilityFilter,

    holdingPeriod,

    exitCondition:
      `Exit after ${holdingPeriod}`,

    transactionCost: "0.10%",

    hypothesis:
      highVolatility
        ? `Test whether ${instrument} produces stronger returns during high-volatility periods.`
        : lowVolatility
        ? `Test whether ${instrument} performs differently during low-volatility periods.`
        : `Test whether the selected ${instrument} entry condition produces a measurable edge.`,
  };

  /* =======================================================
     SIMULATED RESEARCH ENGINE
     ======================================================= */

  const seed = hashText(question);

  let baseTrades = 120;

  if (instrument === "BANKNIFTY") {
    baseTrades = 105;
  }

  if (instrument === "SENSEX") {
    baseTrades = 95;
  }

  if (percentage !== null) {
    baseTrades -= Math.round(
      percentage * 2
    );
  }

  const trades = Math.max(
    60,
    baseTrades
  );

  // Deterministic variation so different questions
  // produce slightly different simulated results.

  const randomVariation =
    ((seed % 13) - 6) * 0.35;

  let winRate =
    52.5 + randomVariation;

  if (highVolatility) {
    winRate += 4.0;
  }

  if (lowVolatility) {
    winRate -= 1.5;
  }

  if (direction === "fall") {
    winRate += 1.2;
  }

  if (direction === "rise") {
    winRate -= 0.5;
  }

  winRate = clamp(
    winRate,
    45,
    65
  );

  const winningTrades =
    Math.round(
      trades * (winRate / 100)
    );

  const losingTrades =
    trades - winningTrades;

  const normalWinRate =
    clamp(
      winRate -
        (highVolatility ? 4.0 : 0),
      42,
      65
    );

  const highWinRate =
    clamp(
      winRate +
        (highVolatility ? 0 : 4.0),
      42,
      68
    );

  /* =======================================================
     RETURNS
     ======================================================= */

  let averageReturn =
    0.58 +
    ((seed % 7) * 0.035);

  if (highVolatility) {
    averageReturn += 0.22;
  }

  if (lowVolatility) {
    averageReturn -= 0.08;
  }

  if (direction === "fall") {
    averageReturn += 0.08;
  }

  averageReturn =
    Math.max(
      0.25,
      averageReturn
    );

  const normalAverageReturn =
    Math.max(
      0.20,
      averageReturn -
        (highVolatility ? 0.18 : 0)
    );

  const highAverageReturn =
    Math.max(
      0.25,
      averageReturn +
        (highVolatility ? 0 : 0.18)
    );

  /* =======================================================
     SIMULATED EQUITY CURVE
     ======================================================= */

  const chartData = [];

  let equity = 100;
  let peak = 100;
  let maxDrawdown = 0;

  for (let i = 0; i < 12; i++) {
    let monthlyReturn =
      (averageReturn * 0.65) +
      Math.sin(
        i * 1.45 + seed
      ) * 0.55;

    if (i === 4) {
      monthlyReturn -= 0.75;
    }

    if (i === 8) {
      monthlyReturn -= 0.45;
    }

    monthlyReturn =
      Number(
        monthlyReturn.toFixed(2)
      );

    equity =
      equity *
      (1 + monthlyReturn / 100);

    peak =
      Math.max(
        peak,
        equity
      );

    const drawdown =
      ((equity - peak) /
        peak) *
      100;

    maxDrawdown =
      Math.min(
        maxDrawdown,
        drawdown
      );

    chartData.push({
      period: `M${i + 1}`,
      return: monthlyReturn,
      equity: Number(
        equity.toFixed(2)
      ),
    });
  }

  const cumulativeReturn =
    equity - 100;

  /* =======================================================
     TRADE EXTREMES
     ======================================================= */

  const bestTrade =
    Number(
      (
        3.6 +
        (seed % 12) * 0.12
      ).toFixed(2)
    );

  const worstTrade =
    Number(
      (
        -2.2 -
        (seed % 8) * 0.11
      ).toFixed(2)
    );

  const riskReward =
    (
      Math.abs(
        bestTrade /
          worstTrade
      )
    ).toFixed(2);

  /* =======================================================
     COMPARISON
     ======================================================= */

  const comparison = {
    highVolatility: {
      trades,
      winRate:
        `${highWinRate.toFixed(2)}%`,
      averageReturn:
        `${highAverageReturn.toFixed(2)}%`,
    },

    normalVolatility: {
      trades,
      winRate:
        `${normalWinRate.toFixed(2)}%`,
      averageReturn:
        `${normalAverageReturn.toFixed(2)}%`,
    },
  };

  /* =======================================================
     INSIGHTS
     ======================================================= */

  const winRateDifference =
    highWinRate -
    normalWinRate;

  const returnDifference =
    highAverageReturn -
    normalAverageReturn;

  const insights = [
    `The simulated sample contains ${trades} observations for ${instrument}.`,

    `High-volatility conditions show a ${winRateDifference.toFixed(
      2
    )} percentage-point difference in win rate versus the normal-volatility baseline.`,

    `Average return differs by approximately ${returnDifference.toFixed(
      2
    )}% between the two conditions.`,

    "The experiment is illustrative because the dataset is simulated rather than historical market data.",
  ];

  /* =======================================================
     CONCLUSION
     ======================================================= */

  let conclusion;

  if (highVolatility) {
    conclusion =
      `In this simulated sample, ${instrument} performed better during high-volatility periods, with a ${highWinRate.toFixed(
        2
      )}% win rate compared with ${normalWinRate.toFixed(
        2
      )}% under the normal-volatility baseline. The result is a research signal, not proof of a real trading edge.`;
  } else if (lowVolatility) {
    conclusion =
      `In this simulated sample, ${instrument} showed different behavior during low-volatility periods. The result should be treated as exploratory evidence rather than a validated trading strategy.`;
  } else {
    conclusion =
      `The simulated experiment produced a ${winRate.toFixed(
        2
      )}% win rate with an average return of ${averageReturn.toFixed(
        2
      )}%. Historical data and robustness testing would be required before drawing real-world conclusions.`;
  }

  /* =======================================================
     RESPONSE
     ======================================================= */

  res.json({
    success: true,

    needsClarification: false,

    question,

    understanding,

    experiment,

    results: {
      trades,

      winningTrades,

      losingTrades,

      winRate:
        `${winRate.toFixed(2)}%`,

      averageReturn:
        `${averageReturn.toFixed(2)}%`,

      cumulativeReturn:
        `${cumulativeReturn.toFixed(2)}%`,

      bestTrade:
        `${bestTrade}%`,

      worstTrade:
        `${worstTrade}%`,

      riskReward:
        `${riskReward}:1`,

      maxDrawdown:
        `${Math.abs(
          maxDrawdown
        ).toFixed(2)}%`,
    },

    comparison,

    chartData,

    insights,

    conclusion,

    assumptions: [
      holdingSpecified
        ? `Holding period: ${holdingPeriod}`
        : `Holding period was not specified; prototype assumption: ${holdingPeriod}`,

      "Transaction cost: 0.10%",

      "Timeframe: Daily",

      "Data source: Simulated sample data",
    ],

    limitations: [
      "No live market data is used.",
      "Results are illustrative only.",
      "Slippage and execution quality are simplified.",
      "A larger historical backtest would be required for validation.",
    ],

    explanation:
      "This prototype demonstrates an AI-style trading research workflow using structured natural-language parsing and simulated market observations. It is not financial advice.",
  });
});

/* =========================================================
   SERVER
   ========================================================= */

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});