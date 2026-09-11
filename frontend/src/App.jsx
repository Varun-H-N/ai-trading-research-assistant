import { useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
} from "recharts";
import "./App.css";

const API_URL = "http://localhost:5000";

const examples = [
  "Does NIFTY perform better during high volatility?",
  "Does buying NIFTY after a 1% fall work better during high-volatility periods?",
  "Does BANKNIFTY perform better during volatile markets?",
  "Does SENSEX perform better after a market fall?",
];

function App() {
  const [question, setQuestion] = useState(
    "Does NIFTY perform better during high volatility?"
  );

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const runResearch = async () => {
    if (!question.trim()) {
      setError("Please enter a research question.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/api/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Research failed.");
      }

      setData(result);

      setTimeout(() => {
        document
          .getElementById("research-results")
          ?.scrollIntoView({ behavior: "smooth" });
      }, 150);
    } catch (err) {
      setError(
        "Could not connect to the research engine. Make sure the backend is running on port 5000."
      );
    } finally {
      setLoading(false);
    }
  };

  const selectExample = (text) => {
    setQuestion(text);
    setData(null);
    setError("");
  };

  const understanding = data?.understanding || {};
  const experiment = data?.experiment || {};
  const results = data?.results || {};

  const chartData = data?.chartData || [];
  const comparison = data?.comparison || {};
  const insights = data?.insights || [];
  const assumptions = data?.assumptions || [];

  const comparisonData = [
    {
      name: "High Volatility",
      winRate:
        Number(comparison.highVolatility?.winRate) ||
        Number(results.winRate?.replace("%", "")) ||
        0,
    },
    {
      name: "Normal Volatility",
      winRate:
        Number(comparison.normalVolatility?.winRate) ||
        Math.max(
          0,
          Number(results.winRate?.replace("%", "")) - 4
        ),
    },
  ];

  const distributionData = [
    {
      name: "Winning",
      value: Number(results.winningTrades) || 0,
    },
    {
      name: "Losing",
      value: Number(results.losingTrades) || 0,
    },
  ];

  return (
    <div className="app">
      {/* NAVIGATION */}
      <header className="topbar">
        <div className="brand">
          <div className="brand-logo">TL</div>

          <div>
            <div className="brand-name">TradeLens</div>
            <div className="brand-subtitle">
              RESEARCH INTELLIGENCE
            </div>
          </div>
        </div>

        <div className="status-pill">
          <span className="status-dot"></span>
          Prototype · Simulated Data
        </div>
      </header>

      {/* HERO */}
      <section className="hero">
        <div className="hero-badge">
          AI TRADING RESEARCH ASSISTANT
        </div>

        <h1>
          Turn trading ideas into
          <span> structured experiments.</span>
        </h1>

        <p>
          Ask a natural-language market research question. The system
          extracts the research intent, defines an experiment, tests it
          using simulated data, and explains the result.
        </p>

        <div className="hero-tags">
          <span>Natural Language</span>
          <span>Experiment Design</span>
          <span>Market Comparison</span>
          <span>Research Insights</span>
        </div>
      </section>

      {/* ASK */}
      <section className="section-card ask-section">
        <div className="section-label">
          <span>01</span> ASK
        </div>

        <div className="section-heading">
          <h2>What do you want to research?</h2>
          <p>
            Describe your trading idea in plain language. You don't
            need to know how to write a backtest.
          </p>
        </div>

        <textarea
          className="research-input"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Example: Does buying NIFTY after a 1% fall work better during high-volatility periods?"
        />

        <div className="example-title">TRY AN EXAMPLE</div>

        <div className="example-buttons">
          <button onClick={() => selectExample(examples[0])}>
            NIFTY + High Volatility
          </button>

          <button onClick={() => selectExample(examples[1])}>
            1% NIFTY Fall
          </button>

          <button onClick={() => selectExample(examples[2])}>
            BANKNIFTY Research
          </button>

          <button onClick={() => selectExample(examples[3])}>
            SENSEX Research
          </button>
        </div>

        <button
          className="research-button"
          onClick={runResearch}
          disabled={loading}
        >
          {loading ? "Running Research..." : "Run Research"}
          <span>→</span>
        </button>

        {error && <div className="error-box">{error}</div>}
      </section>

      {/* WORKFLOW */}
      <div className="workflow">
        {[
          ["01", "Ask"],
          ["02", "Understand"],
          ["03", "Clarify"],
          ["04", "Define"],
          ["05", "Test"],
          ["06", "Learn"],
        ].map(([number, title]) => (
          <div className="workflow-step" key={number}>
            <div className="workflow-circle">{number}</div>
            <strong>{title}</strong>
          </div>
        ))}
      </div>

      {data && (
        <div id="research-results">
          {/* UNDERSTAND */}
          <section className="section-card">
            <div className="section-label">
              <span>02</span> UNDERSTAND
            </div>

            <div className="section-heading split-heading">
              <div>
                <h2>Research intent detected</h2>
                <p>
                  The natural-language question has been converted into
                  structured research parameters.
                </p>
              </div>

              <div className="success-badge">
                ✓ Intent detected
              </div>
            </div>

            <div className="understanding-grid">
              <InfoCard
                icon="◇"
                label="INSTRUMENT"
                value={understanding.instrument || "NIFTY"}
                sub="Market index"
              />

              <InfoCard
                icon="◷"
                label="TIMEFRAME"
                value={understanding.timeframe || "Daily"}
                sub="Observation frequency"
              />

              <InfoCard
                icon="↗"
                label="VOLATILITY"
                value={
                  understanding.highVolatility
                    ? "High"
                    : "Normal"
                }
                sub="Market condition"
              />

              <InfoCard
                icon="%"
                label="MOVE TRIGGER"
                value={
                  understanding.fallPercentage
                    ? `${understanding.fallPercentage}%`
                    : "Not specified"
                }
                sub="Price movement"
              />
            </div>

            <div className="question-preview">
              <span>RESEARCH QUESTION</span>
              <strong>{data.question || question}</strong>
            </div>
          </section>

          {/* CLARIFY */}
          <section className="section-card">
            <div className="section-label">
              <span>03</span> CLARIFY
            </div>

            <div className="section-heading">
              <h2>Research assumptions</h2>
              <p>
                Missing information should be visible rather than
                silently assumed.
              </p>
            </div>

            <div className="clarify-grid">
              <div className="clarify-success">
                <div className="clarify-icon">✓</div>

                <div>
                  <h3>
                    {data.needsClarification
                      ? "Clarification required"
                      : "No critical ambiguity"}
                  </h3>

                  <p>
                    {data.needsClarification
                      ? "Some information is required before the experiment can be fully defined."
                      : "The research question contains enough information for this prototype experiment."}
                  </p>
                </div>
              </div>

              <div className="assumption-card">
                <div className="clarify-icon info-icon">
                  i
                </div>

                <div>
                  <h3>Prototype assumptions</h3>

                  <ul>
                    {assumptions.length > 0 ? (
                      assumptions.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))
                    ) : (
                      <>
                        <li>Holding period: 1 trading day</li>
                        <li>Transaction cost: 0.10%</li>
                        <li>Timeframe: Daily</li>
                        <li>Data source: Simulated sample data</li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            </div>

            {data.needsClarification &&
              data.clarification?.questions && (
                <div className="warning-box">
                  <strong>Information needed</strong>

                  <ul>
                    {data.clarification.questions.map(
                      (item, index) => (
                        <li key={index}>{item}</li>
                      )
                    )}
                  </ul>
                </div>
              )}
          </section>

          {!data.needsClarification && (
            <>
              {/* DEFINE */}
              <section className="section-card">
                <div className="section-label">
                  <span>04</span> DEFINE EXPERIMENT
                </div>

                <div className="section-heading">
                  <h2>Experiment specification</h2>
                  <p>
                    The research question is now expressed as a
                    reproducible experiment.
                  </p>
                </div>

                <div className="experiment-table">
                  <ExperimentRow
                    label="Instrument"
                    value={experiment.instrument}
                  />

                  <ExperimentRow
                    label="Timeframe"
                    value={experiment.timeframe}
                  />

                  <ExperimentRow
                    label="Entry condition"
                    value={experiment.entryCondition}
                  />

                  <ExperimentRow
                    label="Volatility filter"
                    value={experiment.volatilityFilter}
                  />

                  <ExperimentRow
                    label="Holding period"
                    value={experiment.holdingPeriod}
                  />

                  <ExperimentRow
                    label="Exit condition"
                    value={experiment.exitCondition}
                  />

                  <ExperimentRow
                    label="Transaction cost"
                    value={experiment.transactionCost}
                  />
                </div>

                <div className="hypothesis-box">
                  <div className="hypothesis-icon">H</div>

                  <div>
                    <span>HYPOTHESIS</span>
                    <p>
                      {experiment.hypothesis ||
                        `Test whether ${experiment.instrument || "NIFTY"} produces stronger returns under the selected market conditions.`}
                    </p>
                  </div>
                </div>
              </section>

              {/* TEST */}
              <section className="section-card">
                <div className="section-label">
                  <span>05</span> TEST & LEARN
                </div>

                <div className="section-heading split-heading">
                  <div>
                    <h2>Research results</h2>
                    <p>
                      Illustrative output generated from the simulated
                      research dataset.
                    </p>
                  </div>

                  <div className="sample-badge">
                    SIMULATED SAMPLE
                  </div>
                </div>

                <div className="metric-grid">
                  <MetricCard
                    label="WIN RATE"
                    value={results.winRate || "—"}
                    sub="Successful observations"
                    highlight
                  />

                  <MetricCard
                    label="AVG RETURN"
                    value={results.averageReturn || "—"}
                    sub="Average period return"
                  />

                  <MetricCard
                    label="TOTAL TRADES"
                    value={results.trades || "—"}
                    sub="Simulated observations"
                  />

                  <MetricCard
                    label="AGGREGATE RETURN"
                    value={results.totalReturn || "—"}
                    sub="Sample calculation"
                  />
                </div>

                {/* EQUITY */}
                {chartData.length > 0 && (
                  <div className="chart-card">
                    <div className="chart-header">
                      <div>
                        <span>PERFORMANCE PATH</span>
                        <h3>Illustrative equity curve</h3>
                        <p>
                          Simulated growth of a normalized 100-unit
                          starting value.
                        </p>
                      </div>

                      <div className="chart-badge">
                        NORMALIZED
                      </div>
                    </div>

                    <div className="chart">
                      <ResponsiveContainer
                        width="100%"
                        height={360}
                      >
                        <AreaChart data={chartData}>
                          <defs>
                            <linearGradient
                              id="equityGradient"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="0%"
                                stopColor="#8b5cf6"
                                stopOpacity={0.4}
                              />
                              <stop
                                offset="100%"
                                stopColor="#8b5cf6"
                                stopOpacity={0}
                              />
                            </linearGradient>
                          </defs>

                          <CartesianGrid
                            stroke="#252a39"
                            strokeDasharray="4 5"
                          />

                          <XAxis
                            dataKey="period"
                            stroke="#7180a0"
                          />

                          <YAxis
                            stroke="#7180a0"
                          />

                          <Tooltip
                            contentStyle={{
                              background: "#111521",
                              border: "1px solid #343a4d",
                              borderRadius: "10px",
                              color: "#fff",
                            }}
                          />

                          <Area
                            type="monotone"
                            dataKey="equity"
                            stroke="#9b6cff"
                            strokeWidth={3}
                            fill="url(#equityGradient)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                {/* COMPARISON */}
                <div className="chart-card">
                  <div className="chart-header">
                    <div>
                      <span>COMPARISON</span>
                      <h3>Market condition performance</h3>
                      <p>
                        Compare simulated win rates across volatility
                        regimes.
                      </p>
                    </div>

                    <div className="chart-badge">
                      WIN RATE %
                    </div>
                  </div>

                  <div className="chart">
                    <ResponsiveContainer
                      width="100%"
                      height={340}
                    >
                      <BarChart data={comparisonData}>
                        <CartesianGrid
                          stroke="#252a39"
                          strokeDasharray="4 5"
                        />

                        <XAxis
                          dataKey="name"
                          stroke="#7180a0"
                        />

                        <YAxis
                          stroke="#7180a0"
                          domain={[0, 70]}
                        />

                        <Tooltip
                          contentStyle={{
                            background: "#111521",
                            border: "1px solid #343a4d",
                            borderRadius: "10px",
                            color: "#fff",
                          }}
                        />

                        <Bar
                          dataKey="winRate"
                          fill="#8b5cf6"
                          radius={[10, 10, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* DISTRIBUTION */}
                <div className="chart-card">
                  <div className="chart-header">
                    <div>
                      <span>TRADE DISTRIBUTION</span>
                      <h3>Wins vs losses</h3>
                      <p>
                        Distribution of simulated research
                        observations.
                      </p>
                    </div>

                    <div className="chart-badge">
                      TOTAL: {results.trades || 0}
                    </div>
                  </div>

                  <div className="chart">
                    <ResponsiveContainer
                      width="100%"
                      height={320}
                    >
                      <BarChart data={distributionData}>
                        <CartesianGrid
                          stroke="#252a39"
                          strokeDasharray="4 5"
                        />

                        <XAxis
                          dataKey="name"
                          stroke="#7180a0"
                        />

                        <YAxis
                          stroke="#7180a0"
                        />

                        <Tooltip
                          contentStyle={{
                            background: "#111521",
                            border: "1px solid #343a4d",
                            borderRadius: "10px",
                            color: "#fff",
                          }}
                        />

                        <Bar
                          dataKey="value"
                          fill="#22c55e"
                          radius={[10, 10, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* INSIGHTS */}
                {insights.length > 0 && (
                  <div className="insights-section">
                    <div className="insights-title">
                      WHAT THE SAMPLE SAYS
                    </div>

                    <div className="insights-grid">
                      {insights.slice(0, 3).map((item, index) => (
                        <div className="insight-card" key={index}>
                          <span>
                            0{index + 1}
                          </span>

                          <p>{item}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </section>

              {/* LEARN */}
              <section className="section-card">
                <div className="section-label">
                  <span>06</span> RESEARCH SUMMARY
                </div>

                <div className="summary-content">
                  <div className="finding-badge">
                    RESEARCH FINDING
                  </div>

                  <h2>What did the experiment tell us?</h2>

                  <p className="summary-main">
                    {data.summary?.finding ||
                      `In the simulated sample, ${understanding.instrument || "NIFTY"} was evaluated under the selected market conditions. The observed result is illustrative and does not establish a reliable trading edge.`}
                  </p>

                  <div className="summary-grid">
                    <SummaryCard
                      number="01"
                      title="Evidence"
                      text={`The sample produced ${
                        results.winRate || "—"
                      } win rate across ${
                        results.trades || "—"
                      } simulated observations.`}
                    />

                    <SummaryCard
                      number="02"
                      title="Comparison"
                      text="The experiment compares the selected market condition with a baseline to identify whether the observed difference is meaningful."
                    />

                    <SummaryCard
                      number="03"
                      title="Caveat"
                      text="Simulated data cannot establish a real-world trading edge. Historical market data, slippage, liquidity and robust out-of-sample testing would be required."
                    />
                  </div>

                  <div className="limitation-box">
                    <div className="limitation-icon">
                      !
                    </div>

                    <div>
                      <h3>Research limitation</h3>

                      <p>
                        This prototype uses simulated/sample market
                        data. Results are illustrative only and are
                        not financial advice. A real implementation
                        would require validated historical data and
                        proper backtesting.
                      </p>
                    </div>
                  </div>

                  <div className="footer-metrics">
                    <div>
                      <span>DATA SOURCE</span>
                      <strong>Simulated</strong>
                      <small>Prototype research dataset</small>
                    </div>

                    <div>
                      <span>TRANSACTION COST</span>
                      <strong>
                        {experiment.transactionCost || "0.10%"}
                      </strong>
                      <small>Prototype assumption</small>
                    </div>

                    <div>
                      <span>RESEARCH STATUS</span>
                      <strong className="complete">
                        Complete
                      </strong>
                      <small>
                        Experiment successfully evaluated
                      </small>
                    </div>
                  </div>
                </div>
              </section>
            </>
          )}
        </div>
      )}

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-brand">
          <div className="brand-logo small">TL</div>
          <span>TradeLens Research Intelligence</span>
        </div>

        <span>AI Trading Research Assistant · Prototype</span>

        <span>Simulated data · Not financial advice</span>
      </footer>
    </div>
  );
}

function InfoCard({ icon, label, value, sub }) {
  return (
    <div className="info-card">
      <div className="info-icon-large">{icon}</div>
      <span>{label}</span>
      <strong>{value || "Not specified"}</strong>
      <small>{sub}</small>
    </div>
  );
}

function ExperimentRow({ label, value }) {
  return (
    <div className="experiment-row">
      <span>{label}</span>
      <strong>{value || "Not specified"}</strong>
    </div>
  );
}

function MetricCard({ label, value, sub, highlight }) {
  return (
    <div className={`metric-card ${highlight ? "highlight" : ""}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{sub}</small>
    </div>
  );
}

function SummaryCard({ number, title, text }) {
  return (
    <div className="summary-card">
      <span>{number}</span>
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}

export default App;