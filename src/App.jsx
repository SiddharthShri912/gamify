import { useEffect, useMemo, useState } from "react";
import "./App.css";

const STORAGE_KEY = "life-rpg-v2";

const INITIAL_STATE = {
  xp: {
    dsa: 0,
    guitar: 0,
    gym: 0,
  },

  activities: [],

  week: {
    dsaMinutes: 0,
    contests: 0,
    guitarSessions: 0,
    gymSessions: 0,
  },

  today: {
    date: "",
    dsaMinutes: 0,
    guitarMinutes: 0,
    workout: false,
  },

  streak: {
    weeks: 0,
    completedWeeks: [],
  },

  achievements: [],

  dsaPatterns: {
    arrays: false,
    twoPointers: false,
    slidingWindow: false,
    binarySearch: false,
    stack: false,
    heap: false,
    trees: false,
    graphs: false,
    greedy: false,
    backtracking: false,
    dp: false,
  },

  weekKey: "",
};

/* ------------------------- */
/* DATE HELPERS */
/* ------------------------- */

function getDateKey(date = new Date()) {
  return date.toISOString().split("T")[0];
}

function getWeekKey(date = new Date()) {
  const d = new Date(date);
  const firstDay = new Date(d.getFullYear(), 0, 1);
  const days = Math.floor((d - firstDay) / 86400000);

  return `${d.getFullYear()}-${Math.ceil(
    (days + firstDay.getDay() + 1) / 7
  )}`;
}

function getTodayState(savedToday) {
  const today = getDateKey();

  if (!savedToday || savedToday.date !== today) {
    return {
      date: today,
      dsaMinutes: 0,
      guitarMinutes: 0,
      workout: false,
    };
  }

  return savedToday;
}

/* ------------------------- */
/* DSA TREE */
/* ------------------------- */

const DSA_PATTERNS = [
  {
    id: "arrays",
    name: "Arrays & Hashing",
    description: "Frequency maps, sets, prefix sums",
  },
  {
    id: "twoPointers",
    name: "Two Pointers",
    description: "Opposing and fast/slow pointers",
  },
  {
    id: "slidingWindow",
    name: "Sliding Window",
    description: "Contiguous ranges and frequency windows",
  },
  {
    id: "binarySearch",
    name: "Binary Search",
    description: "Sorted search and search on answer",
  },
  {
    id: "stack",
    name: "Stack",
    description: "Monotonic stacks and matching",
  },
  {
    id: "heap",
    name: "Heap",
    description: "Top K and priority queues",
  },
  {
    id: "trees",
    name: "Trees",
    description: "DFS, BFS and tree recursion",
  },
  {
    id: "graphs",
    name: "Graphs",
    description: "BFS, DFS and connected components",
  },
  {
    id: "greedy",
    name: "Greedy",
    description: "Local choices and optimization",
  },
  {
    id: "backtracking",
    name: "Backtracking",
    description: "Explore, choose and undo",
  },
  {
    id: "dp",
    name: "Dynamic Programming",
    description: "States, transitions and optimization",
  },
];

/* ------------------------- */
/* ACHIEVEMENTS */
/* ------------------------- */

const ACHIEVEMENTS = [
  {
    id: "first-blood",
    icon: "🩸",
    name: "First Blood",
    description: "Solve your first LeetCode problem",
  },
  {
    id: "medium-territory",
    icon: "⚔️",
    name: "Medium Territory",
    description: "Solve your first Medium",
  },
  {
    id: "problem-grinder",
    icon: "⚙️",
    name: "Problem Grinder",
    description: "Solve 25 DSA problems",
  },
  {
    id: "medium-slayer",
    icon: "🔥",
    name: "Medium Slayer",
    description: "Solve 50 Medium problems",
  },
  {
    id: "contestant",
    icon: "🏁",
    name: "Contestant",
    description: "Complete your first contest",
  },
  {
    id: "pattern-hunter",
    icon: "🧠",
    name: "Pattern Hunter",
    description: "Master 5 DSA patterns",
  },
  {
    id: "wall",
    icon: "🧱",
    name: "The Wall",
    description: "Solve a Medium without looking at the solution",
  },
  {
    id: "unstoppable",
    icon: "🚀",
    name: "Unstoppable",
    description: "Maintain a 4-week streak",
  },
];

/* ------------------------- */
/* ACTIONS */
/* ------------------------- */

const XP_ACTIONS = [
  {
    id: "easy",
    type: "dsa",
    label: "Easy",
    xp: 10,
    description: "Solved Easy",
  },
  {
    id: "medium",
    type: "dsa",
    label: "Medium",
    xp: 25,
    description: "Solved Medium",
  },
  {
    id: "medium-clean",
    type: "dsa",
    label: "Medium unaided",
    xp: 35,
    description: "Solved Medium unaided",
  },
  {
    id: "contest",
    type: "dsa",
    label: "Contest",
    xp: 40,
    description: "Completed contest",
  },
  {
    id: "guitar30",
    type: "guitar",
    label: "Guitar 30m",
    xp: 15,
    description: "Guitar practice · 30m",
  },
  {
    id: "guitar60",
    type: "guitar",
    label: "Guitar 60m",
    xp: 30,
    description: "Guitar practice · 60m",
  },
  {
    id: "song",
    type: "guitar",
    label: "Learn song",
    xp: 25,
    description: "Learned a song/riff",
  },
  {
    id: "workout",
    type: "gym",
    label: "Workout",
    xp: 30,
    description: "Completed workout",
  },
  {
    id: "pr",
    type: "gym",
    label: "New PR",
    xp: 40,
    description: "Set a new PR",
  },
];

/* ------------------------- */
/* APP */
/* ------------------------- */

function App() {
  const [state, setState] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      return {
        ...INITIAL_STATE,
        weekKey: getWeekKey(),
        today: getTodayState(),
      };
    }

    const parsed = JSON.parse(saved);

    const currentWeek = getWeekKey();

    if (parsed.weekKey !== currentWeek) {
      return {
        ...parsed,
        week: INITIAL_STATE.week,
        today: getTodayState(),
        weekKey: currentWeek,
      };
    }

    return {
      ...INITIAL_STATE,
      ...parsed,
      today: getTodayState(parsed.today),
    };
  });

  const [activeTab, setActiveTab] = useState("dashboard");

  /* SAVE */

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  /* TOTAL XP */

  const totalXp = useMemo(() => {
    return Object.values(state.xp).reduce((sum, value) => sum + value, 0);
  }, [state.xp]);

  const overallLevel = Math.floor(totalXp / 100) + 1;
  const overallProgress = totalXp % 100;

  /* DSA STATS */

  const dsaActivities = state.activities.filter(
    (activity) => activity.type === "dsa"
  );

  const easyCount = dsaActivities.filter(
    (activity) => activity.action === "Solved Easy"
  ).length;

  const mediumCount = dsaActivities.filter(
    (activity) =>
      activity.action === "Solved Medium" ||
      activity.action === "Solved Medium unaided"
  ).length;

  const contestCount = dsaActivities.filter(
    (activity) => activity.action === "Completed contest"
  ).length;

  const masteredPatterns = Object.values(state.dsaPatterns).filter(
    Boolean
  ).length;

  /* ------------------------- */
  /* ADD ACTIVITY */
  /* ------------------------- */

  function addActivity(action) {
    const activity = {
      id: crypto.randomUUID(),
      type: action.type,
      action: action.description,
      xp: action.xp,
      timestamp: new Date().toISOString(),
    };

    setState((current) => {
      const next = {
        ...current,

        xp: {
          ...current.xp,
          [action.type]: current.xp[action.type] + action.xp,
        },

        activities: [activity, ...current.activities],
      };

      if (action.id === "contest") {
        next.week = {
          ...next.week,
          contests: next.week.contests + 1,
        };
      }

      if (
        action.id === "guitar30" ||
        action.id === "guitar60"
      ) {
        const minutes = action.id === "guitar30" ? 30 : 60;

        next.week = {
          ...next.week,
          guitarSessions: next.week.guitarSessions + 1,
        };

        next.today = {
          ...next.today,
          guitarMinutes: next.today.guitarMinutes + minutes,
        };
      }

      if (action.id === "workout") {
        next.week = {
          ...next.week,
          gymSessions: next.week.gymSessions + 1,
        };

        next.today = {
          ...next.today,
          workout: true,
        };
      }

      return next;
    });
  }

  /* ------------------------- */
  /* DSA TIME */
  /* ------------------------- */

  function logDsaTime(minutes) {
    setState((current) => ({
      ...current,

      week: {
        ...current.week,
        dsaMinutes: current.week.dsaMinutes + minutes,
      },

      today: {
        ...current.today,
        dsaMinutes: current.today.dsaMinutes + minutes,
      },

      activities: [
        {
          id: crypto.randomUUID(),
          type: "dsa",
          action: `DSA study · ${minutes}m`,
          xp: 0,
          timestamp: new Date().toISOString(),
        },
        ...current.activities,
      ],
    }));
  }

  /* ------------------------- */
  /* PATTERN */
  /* ------------------------- */

  function togglePattern(id) {
    setState((current) => {
      const wasMastered = current.dsaPatterns[id];

      return {
        ...current,

        dsaPatterns: {
          ...current.dsaPatterns,
          [id]: !wasMastered,
        },

        xp: {
          ...current.xp,
          dsa: wasMastered
            ? current.xp.dsa
            : current.xp.dsa + 20,
        },

        activities: wasMastered
          ? current.activities
          : [
              {
                id: crypto.randomUUID(),
                type: "dsa",
                action: `Mastered ${
                  DSA_PATTERNS.find((p) => p.id === id)?.name
                }`,
                xp: 20,
                timestamp: new Date().toISOString(),
              },
              ...current.activities,
            ],
      };
    });
  }

  /* ------------------------- */
  /* RESET */
  /* ------------------------- */

  function resetEverything() {
    if (!confirm("Reset all Life RPG progress?")) return;

    setState({
      ...INITIAL_STATE,
      weekKey: getWeekKey(),
      today: getTodayState(),
    });
  }

  /* ------------------------- */
  /* ACHIEVEMENT CHECKING */
  /* ------------------------- */

  const achievementUnlocked = (id) => {
    switch (id) {
      case "first-blood":
        return easyCount + mediumCount > 0;

      case "medium-territory":
        return mediumCount > 0;

      case "problem-grinder":
        return easyCount + mediumCount >= 25;

      case "medium-slayer":
        return mediumCount >= 50;

      case "contestant":
        return contestCount >= 1;

      case "pattern-hunter":
        return masteredPatterns >= 5;

      case "wall":
        return state.activities.some(
          (activity) =>
            activity.action === "Solved Medium unaided"
        );

      case "unstoppable":
        return state.streak.weeks >= 4;

      default:
        return false;
    }
  };

  useEffect(() => {
    const newlyUnlocked = ACHIEVEMENTS.filter(
      (achievement) =>
        achievementUnlocked(achievement.id) &&
        !state.achievements.includes(achievement.id)
    );

    if (newlyUnlocked.length === 0) return;

    setState((current) => ({
      ...current,

      achievements: [
        ...current.achievements,
        ...newlyUnlocked.map((a) => a.id),
      ],

      xp: {
        ...current.xp,
        dsa:
          current.xp.dsa +
          newlyUnlocked.length * 25,
      },
    }));
  }, [
    easyCount,
    mediumCount,
    contestCount,
    masteredPatterns,
    state.activities,
    state.achievements,
    state.streak.weeks,
  ]);

  /* ------------------------- */
  /* RENDER */
  /* ------------------------- */

  return (
    <div className="app">
      <header>
        <div>
          <h1>Life RPG</h1>
          <p>Season 1 · Build your character</p>
        </div>

        <div className="player-level">
          <span>LEVEL</span>
          <strong>{overallLevel}</strong>
        </div>
      </header>

      {/* NAV */}

      <nav className="tabs">
        <button
          className={activeTab === "dashboard" ? "active" : ""}
          onClick={() => setActiveTab("dashboard")}
        >
          Dashboard
        </button>

        <button
          className={activeTab === "dsa" ? "active" : ""}
          onClick={() => setActiveTab("dsa")}
        >
          💻 DSA
        </button>

        <button
          className={activeTab === "history" ? "active" : ""}
          onClick={() => setActiveTab("history")}
        >
          📜 History
        </button>

        <button
          className={activeTab === "achievements" ? "active" : ""}
          onClick={() => setActiveTab("achievements")}
        >
          🏆 Achievements
        </button>
      </nav>

      {/* DASHBOARD */}

      {activeTab === "dashboard" && (
        <>
          <section className="overview">
            <div>
              <span>Total XP</span>

              <strong>{totalXp}</strong>

              <div className="overall-progress">
                <div style={{ width: `${overallProgress}%` }} />
              </div>

              <small>
                {overallProgress}/100 XP to next level
              </small>
            </div>

            <div>
              <span>Weekly Streak</span>

              <strong>
                🔥 {state.streak.weeks} weeks
              </strong>

              <small>
                Keep completing your weekly goals.
              </small>
            </div>
          </section>

          {/* TODAY */}

          <section className="panel">
            <h2>🎯 Today's Quests</h2>

            <div className="today-quest">
              <div>
                <strong>DSA · 60 focused minutes</strong>
                <span>
                  {state.today.dsaMinutes}/60 min
                </span>
              </div>

              <div className="quest-actions">
                <button onClick={() => logDsaTime(30)}>
                  +30m
                </button>

                <button onClick={() => logDsaTime(60)}>
                  +60m
                </button>
              </div>
            </div>

            <div className="today-quest">
              <div>
                <strong>Guitar · 30 minutes</strong>

                <span>
                  {state.today.guitarMinutes}/30 min
                </span>
              </div>

              <button
                onClick={() =>
                  addActivity(XP_ACTIONS[4])
                }
              >
                +30m
              </button>
            </div>

            <div className="today-quest">
              <div>
                <strong>Gym · Complete workout</strong>

                <span>
                  {state.today.workout
                    ? "Completed ✓"
                    : "Not completed"}
                </span>
              </div>

              <button
                disabled={state.today.workout}
                onClick={() =>
                  addActivity(XP_ACTIONS[7])
                }
              >
                {state.today.workout
                  ? "Done ✓"
                  : "+30 XP"}
              </button>
            </div>
          </section>

          {/* SKILLS */}

          <section>
            <h2>Skill Tree</h2>

            <div className="skills">
              {[
                {
                  id: "dsa",
                  icon: "💻",
                  name: "DSA",
                },
                {
                  id: "guitar",
                  icon: "🎸",
                  name: "Guitar",
                },
                {
                  id: "gym",
                  icon: "🏋️",
                  name: "Strength",
                },
              ].map((skill) => {
                const currentXp = state.xp[skill.id];
                const level =
                  Math.floor(currentXp / 100) + 1;

                const progress = currentXp % 100;

                return (
                  <div
                    className="skill-card"
                    key={skill.id}
                  >
                    <div className="skill-title">
                      <span className="skill-icon">
                        {skill.icon}
                      </span>

                      <div>
                        <h3>{skill.name}</h3>

                        <p>
                          Level {level}
                        </p>
                      </div>
                    </div>

                    <div className="progress-bar">
                      <div
                        style={{
                          width: `${progress}%`,
                        }}
                      />
                    </div>

                    <div className="skill-xp">
                      {currentXp} XP

                      <span>
                        {progress}/100
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* WEEK */}

          <section className="panel">
            <h2>📅 This Week</h2>

            <div className="quest">
              <span>
                DSA · 5 focused hours
              </span>

              <strong>
                {state.week.dsaMinutes}/300m
              </strong>
            </div>

            <div className="quest">
              <span>
                DSA · Complete one contest
              </span>

              <strong>
                {state.week.contests
                  ? "✓"
                  : "○"}
              </strong>
            </div>

            <div className="quest">
              <span>
                Guitar · 2 sessions
              </span>

              <strong>
                {state.week.guitarSessions}/2
              </strong>
            </div>

            <div className="quest">
              <span>
                Gym · 3 workouts
              </span>

              <strong>
                {state.week.gymSessions}/3
              </strong>
            </div>
          </section>

          {/* LOG */}

          <section className="panel">
            <h2>⚔️ Log XP</h2>

            <div className="actions">
              {XP_ACTIONS.map((action) => (
                <button
                  key={action.id}
                  onClick={() =>
                    addActivity(action)
                  }
                >
                  {action.label}

                  <span>
                    +{action.xp}
                  </span>
                </button>
              ))}
            </div>
          </section>
        </>
      )}

      {/* DSA */}

      {activeTab === "dsa" && (
        <section>
          <div className="section-heading">
            <div>
              <h2>💻 DSA Skill Tree</h2>

              <p>
                Master patterns to unlock your
                progression.
              </p>
            </div>

            <div className="dsa-stats">
              <strong>
                {easyCount + mediumCount}
              </strong>

              <span>Problems</span>
            </div>
          </div>

          <div className="dsa-summary">
            <div>
              <strong>{easyCount}</strong>
              <span>Easy</span>
            </div>

            <div>
              <strong>{mediumCount}</strong>
              <span>Medium</span>
            </div>

            <div>
              <strong>{contestCount}</strong>
              <span>Contests</span>
            </div>

            <div>
              <strong>
                {masteredPatterns}
              </strong>
              <span>Patterns</span>
            </div>
          </div>

          <div className="dsa-tree">
            {DSA_PATTERNS.map(
              (pattern, index) => {
                const mastered =
                  state.dsaPatterns[
                    pattern.id
                  ];

                return (
                  <div
                    className="pattern-wrapper"
                    key={pattern.id}
                  >
                    <button
                      className={`pattern ${
                        mastered
                          ? "mastered"
                          : ""
                      }`}
                      onClick={() =>
                        togglePattern(
                          pattern.id
                        )
                      }
                    >
                      <div className="pattern-number">
                        {mastered
                          ? "✓"
                          : index + 1}
                      </div>

                      <div>
                        <strong>
                          {pattern.name}
                        </strong>

                        <span>
                          {pattern.description}
                        </span>
                      </div>

                      <div className="pattern-status">
                        {mastered
                          ? "MASTERED"
                          : "+20 XP"}
                      </div>
                    </button>

                    {index <
                      DSA_PATTERNS.length -
                        1 && (
                      <div className="tree-line" />
                    )}
                  </div>
                );
              }
            )}
          </div>

          <section className="panel">
            <h2>⚔️ Log DSA</h2>

            <div className="actions">
              {XP_ACTIONS.filter(
                (a) => a.type === "dsa"
              ).map((action) => (
                <button
                  key={action.id}
                  onClick={() =>
                    addActivity(action)
                  }
                >
                  {action.label}

                  <span>
                    +{action.xp}
                  </span>
                </button>
              ))}
            </div>
          </section>
        </section>
      )}

      {/* HISTORY */}

      {activeTab === "history" && (
        <section>
          <div className="section-heading">
            <div>
              <h2>📜 Activity History</h2>

              <p>
                Everything you've done.
              </p>
            </div>
          </div>

          {state.activities.length === 0 ? (
            <div className="empty">
              <div>📭</div>

              <strong>
                No activity yet.
              </strong>

              <span>
                Complete something and
                log it above.
              </span>
            </div>
          ) : (
            <div className="history">
              {state.activities
                .slice(0, 50)
                .map((activity) => (
                  <div
                    className="history-item"
                    key={activity.id}
                  >
                    <div className="history-icon">
                      {activity.type ===
                        "dsa" && "💻"}

                      {activity.type ===
                        "guitar" && "🎸"}

                      {activity.type ===
                        "gym" && "🏋️"}
                    </div>

                    <div className="history-info">
                      <strong>
                        {activity.action}
                      </strong>

                      <span>
                        {new Date(
                          activity.timestamp
                        ).toLocaleString()}
                      </span>
                    </div>

                    <strong className="history-xp">
                      {activity.xp > 0
                        ? `+${activity.xp} XP`
                        : "Logged"}
                    </strong>
                  </div>
                ))}
            </div>
          )}
        </section>
      )}

      {/* ACHIEVEMENTS */}

      {activeTab === "achievements" && (
        <section>
          <div className="section-heading">
            <div>
              <h2>🏆 Achievements</h2>

              <p>
                Milestones earned along the
                way.
              </p>
            </div>

            <div className="achievement-count">
              {
                state.achievements.length
              }
              /{ACHIEVEMENTS.length}
            </div>
          </div>

          <div className="achievements">
            {ACHIEVEMENTS.map(
              (achievement) => {
                const unlocked =
                  state.achievements.includes(
                    achievement.id
                  );

                return (
                  <div
                    className={`achievement ${
                      unlocked
                        ? "unlocked"
                        : ""
                    }`}
                    key={achievement.id}
                  >
                    <div className="achievement-icon">
                      {unlocked
                        ? achievement.icon
                        : "🔒"}
                    </div>

                    <div>
                      <strong>
                        {achievement.name}
                      </strong>

                      <span>
                        {achievement.description}
                      </span>
                    </div>

                    {unlocked && (
                      <div className="achievement-xp">
                        +25 XP
                      </div>
                    )}
                  </div>
                );
              }
            )}
          </div>
        </section>
      )}

      {/* RESET */}

      <button
        className="reset-button"
        onClick={resetEverything}
      >
        Reset all progress
      </button>
    </div>
  );
}

export default App;