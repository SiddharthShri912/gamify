import { useEffect, useMemo, useState } from "react";
import "./App.css";

const STORAGE_KEY = "life-rpg-v3";

const EMPTY_WEEK = {
  dsaMinutes: 0,
  contests: 0,
  guitarSessions: 0,
  gymSessions: 0,
};

const EMPTY_TODAY = {
  date: "",
  dsaMinutes: 0,
  guitarMinutes: 0,
  workout: false,
};

const INITIAL_STATE = {
  xp: {
    dsa: 0,
    guitar: 0,
    gym: 0,
  },

  activities: [],

  week: EMPTY_WEEK,

  weekCompleted: false,

  today: EMPTY_TODAY,

  streak: 0,

  achievements: [],

  weekKey: "",
};

const ACTIONS = [
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

const ACHIEVEMENTS = [
  {
    id: "first-blood",
    icon: "🩸",
    name: "First Blood",
    description: "Solve your first LeetCode problem",
  },
  {
    id: "medium",
    icon: "⚔️",
    name: "Medium Territory",
    description: "Solve your first Medium",
  },
  {
    id: "25-problems",
    icon: "⚙️",
    name: "Problem Grinder",
    description: "Solve 25 DSA problems",
  },
  {
    id: "50-mediums",
    icon: "🔥",
    name: "Medium Slayer",
    description: "Solve 50 Medium problems",
  },
  {
    id: "contest",
    icon: "🏁",
    name: "Contestant",
    description: "Complete your first contest",
  },
  {
    id: "4-week-streak",
    icon: "🚀",
    name: "Unstoppable",
    description: "Maintain a 4-week streak",
  },
];

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

function getToday(savedToday) {
  const today = getDateKey();

  if (!savedToday || savedToday.date !== today) {
    return {
      ...EMPTY_TODAY,
      date: today,
    };
  }

  return savedToday;
}

function isWeekComplete(week) {
  return (
    week.dsaMinutes >= 300 &&
    week.contests >= 1 &&
    week.guitarSessions >= 2 &&
    week.gymSessions >= 3
  );
}

function App() {
  const [state, setState] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      return {
        ...INITIAL_STATE,
        weekKey: getWeekKey(),
        today: getToday(),
      };
    }

    const parsed = JSON.parse(saved);
    const currentWeek = getWeekKey();

    // New week.
    if (parsed.weekKey !== currentWeek) {
      return {
        ...parsed,

        week: { ...EMPTY_WEEK },

        weekCompleted: false,

        today: getToday(),

        // If last week wasn't completed,
        // the streak is broken.
        streak: parsed.weekCompleted
          ? parsed.streak
          : 0,

        weekKey: currentWeek,
      };
    }

    return {
      ...INITIAL_STATE,
      ...parsed,
      today: getToday(parsed.today),
    };
  });

  const [activeTab, setActiveTab] = useState("dashboard");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const totalXp = useMemo(
    () =>
      Object.values(state.xp).reduce(
        (sum, value) => sum + value,
        0
      ),
    [state.xp]
  );

  const overallLevel = Math.floor(totalXp / 100) + 1;
  const overallProgress = totalXp % 100;

  const dsaActivities = state.activities.filter(
    (activity) => activity.type === "dsa"
  );

  const problemCount = dsaActivities.filter(
    (activity) =>
      activity.action === "Solved Easy" ||
      activity.action === "Solved Medium" ||
      activity.action === "Solved Medium unaided"
  ).length;

  const mediumCount = dsaActivities.filter(
    (activity) =>
      activity.action === "Solved Medium" ||
      activity.action === "Solved Medium unaided"
  ).length;

  const contestCount = dsaActivities.filter(
    (activity) =>
      activity.action === "Completed contest"
  ).length;

  function updateWeek(week) {
    const completed = isWeekComplete(week);

    return {
      week,
      completed,
    };
  }

  function addActivity(action) {
    setState((current) => {
      const activity = {
        id: crypto.randomUUID(),
        type: action.type,
        action: action.description,
        xp: action.xp,
        timestamp: new Date().toISOString(),
      };

      let nextWeek = {
        ...current.week,
      };

      let nextToday = {
        ...current.today,
      };

      if (action.id === "contest") {
        nextWeek.contests += 1;
      }

      if (
        action.id === "guitar30" ||
        action.id === "guitar60"
      ) {
        nextWeek.guitarSessions += 1;

        nextToday.guitarMinutes +=
          action.id === "guitar30" ? 30 : 60;
      }

      if (action.id === "workout") {
        nextWeek.gymSessions += 1;
        nextToday.workout = true;
      }

      const { week, completed } =
        updateWeek(nextWeek);

      let nextStreak = current.streak;

      // Only award the streak once.
      if (
        completed &&
        !current.weekCompleted
      ) {
        nextStreak += 1;
      }

      return {
        ...current,

        xp: {
          ...current.xp,
          [action.type]:
            current.xp[action.type] + action.xp,
        },

        activities: [
          activity,
          ...current.activities,
        ],

        week,

        weekCompleted:
          current.weekCompleted || completed,

        streak: nextStreak,

        today: nextToday,
      };
    });
  }

  function logDsaTime(minutes) {
    setState((current) => {
      const nextWeek = {
        ...current.week,
        dsaMinutes:
          current.week.dsaMinutes + minutes,
      };

      const { week, completed } =
        updateWeek(nextWeek);

      let nextStreak = current.streak;

      if (
        completed &&
        !current.weekCompleted
      ) {
        nextStreak += 1;
      }

      return {
        ...current,

        week,

        weekCompleted:
          current.weekCompleted || completed,

        streak: nextStreak,

        today: {
          ...current.today,
          dsaMinutes:
            current.today.dsaMinutes + minutes,
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
      };
    });
  }

  function resetEverything() {
    if (!confirm("Reset all Life RPG progress?")) {
      return;
    }

    setState({
      ...INITIAL_STATE,
      weekKey: getWeekKey(),
      today: getToday(),
    });
  }

  function achievementUnlocked(id) {
    switch (id) {
      case "first-blood":
        return problemCount >= 1;

      case "medium":
        return mediumCount >= 1;

      case "25-problems":
        return problemCount >= 25;

      case "50-mediums":
        return mediumCount >= 50;

      case "contest":
        return contestCount >= 1;

      case "4-week-streak":
        return state.streak >= 4;

      default:
        return false;
    }
  }

  useEffect(() => {
    const newAchievements =
      ACHIEVEMENTS.filter(
        (achievement) =>
          achievementUnlocked(
            achievement.id
          ) &&
          !state.achievements.includes(
            achievement.id
          )
      );

    if (!newAchievements.length) return;

    setState((current) => ({
      ...current,

      achievements: [
        ...current.achievements,
        ...newAchievements.map(
          (achievement) =>
            achievement.id
        ),
      ],

      xp: {
        ...current.xp,
        dsa:
          current.xp.dsa +
          newAchievements.length * 25,
      },
    }));
  }, [
    problemCount,
    mediumCount,
    contestCount,
    state.streak,
    state.achievements,
  ]);

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

      <nav className="tabs">
        <button
          className={
            activeTab === "dashboard"
              ? "active"
              : ""
          }
          onClick={() =>
            setActiveTab("dashboard")
          }
        >
          Dashboard
        </button>

        <button
          className={
            activeTab === "history"
              ? "active"
              : ""
          }
          onClick={() =>
            setActiveTab("history")
          }
        >
          📜 History
        </button>

        <button
          className={
            activeTab === "achievements"
              ? "active"
              : ""
          }
          onClick={() =>
            setActiveTab("achievements")
          }
        >
          🏆 Achievements
        </button>
      </nav>

      {activeTab === "dashboard" && (
        <>
          <section className="overview">
            <div>
              <span>Total XP</span>
              <strong>{totalXp}</strong>

              <div className="overall-progress">
                <div
                  style={{
                    width: `${overallProgress}%`,
                  }}
                />
              </div>

              <small>
                {overallProgress}/100 XP to
                next level
              </small>
            </div>

            <div>
              <span>Weekly Streak</span>

              <strong>
                🔥 {state.streak}{" "}
                {state.streak === 1
                  ? "week"
                  : "weeks"}
              </strong>

              <small>
                {state.weekCompleted
                  ? "Week complete ✓"
                  : "Complete all weekly goals"}
              </small>
            </div>
          </section>

          <section className="panel">
            <h2>🎯 Today's Quests</h2>

            <div className="today-quest">
              <div>
                <strong>
                  DSA · 60 focused minutes
                </strong>

                <span>
                  {state.today.dsaMinutes}/60
                  min
                </span>
              </div>

              <div className="quest-actions">
                <button
                  onClick={() =>
                    logDsaTime(30)
                  }
                >
                  +30m
                </button>

                <button
                  onClick={() =>
                    logDsaTime(60)
                  }
                >
                  +60m
                </button>
              </div>
            </div>

            <div className="today-quest">
              <div>
                <strong>
                  Guitar · 30 minutes
                </strong>

                <span>
                  {state.today.guitarMinutes}
                  /30 min
                </span>
              </div>

              <button
                onClick={() =>
                  addActivity(
                    ACTIONS.find(
                      (a) =>
                        a.id === "guitar30"
                    )
                  )
                }
              >
                +30m
              </button>
            </div>

            <div className="today-quest">
              <div>
                <strong>
                  Gym · Complete workout
                </strong>

                <span>
                  {state.today.workout
                    ? "Completed ✓"
                    : "Not completed"}
                </span>
              </div>

              <button
                disabled={state.today.workout}
                onClick={() =>
                  addActivity(
                    ACTIONS.find(
                      (a) =>
                        a.id === "workout"
                    )
                  )
                }
              >
                {state.today.workout
                  ? "Done ✓"
                  : "+30 XP"}
              </button>
            </div>
          </section>

          <section>
            <h2>Skills</h2>

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
                const skillXp =
                  state.xp[skill.id];

                const level =
                  Math.floor(
                    skillXp / 100
                  ) + 1;

                const progress =
                  skillXp % 100;

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
                      {skillXp} XP
                      <span>
                        {progress}/100
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

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
                {state.week.contests >= 1
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

          <section className="panel">
            <h2>⚔️ Log XP</h2>

            <div className="actions">
              {ACTIONS.map((action) => (
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

      {activeTab === "history" && (
        <section>
          <div className="section-heading">
            <div>
              <h2>📜 Activity History</h2>
              <p>
                Everything you've logged.
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
                Complete something and log
                it.
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
              {state.achievements.length}/
              {ACHIEVEMENTS.length}
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