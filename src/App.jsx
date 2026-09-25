import { useEffect, useState } from "react";
import "./App.css";

const INITIAL_STATE = {
  xp: {
    dsa: 0,
    guitar: 0,
    gym: 0,
  },
  week: {
    dsaMinutes: 0,
    contest: 0,
    guitarSessions: 0,
    gymSessions: 0,
  },
  today: {
    dsaMinutes: 0,
    guitarMinutes: 0,
    workout: false,
  },
};

const ACTIONS = [
  { id: "dsaEasy", skill: "dsa", label: "Easy", xp: 10 },
  { id: "dsaMedium", skill: "dsa", label: "Medium", xp: 25 },
  { id: "dsaContest", skill: "dsa", label: "Contest", xp: 40 },
  { id: "guitar30", skill: "guitar", label: "Guitar 30m", xp: 15 },
  { id: "guitar60", skill: "guitar", label: "Guitar 60m", xp: 30 },
  { id: "workout", skill: "gym", label: "Workout", xp: 30 },
];

function getWeekKey() {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), 0, 1);
  const days = Math.floor((now - firstDay) / 86400000);
  const week = Math.ceil((days + firstDay.getDay() + 1) / 7);

  return `${now.getFullYear()}-${week}`;
}

function App() {
  const [state, setState] = useState(() => {
    const saved = localStorage.getItem("life-rpg");

    if (!saved) {
      return INITIAL_STATE;
    }

    const parsed = JSON.parse(saved);

    // Automatically start a fresh week.
    if (parsed.weekKey !== getWeekKey()) {
      return {
        ...parsed,
        week: INITIAL_STATE.week,
        today: INITIAL_STATE.today,
        weekKey: getWeekKey(),
      };
    }

    return parsed;
  });

  useEffect(() => {
    localStorage.setItem("life-rpg", JSON.stringify(state));
  }, [state]);

  const totalXp = Object.values(state.xp).reduce(
    (sum, value) => sum + value,
    0
  );

  const overallLevel = Math.floor(totalXp / 100) + 1;
  const overallProgress = totalXp % 100;

  function addXp(skill, amount) {
    setState((current) => ({
      ...current,
      xp: {
        ...current.xp,
        [skill]: current.xp[skill] + amount,
      },
    }));
  }

  function logAction(action) {
  setState((current) => {
    const next = {
      ...current,
      xp: {
        ...current.xp,
        [action.skill]: current.xp[action.skill] + action.xp,
      },
    };

    if (action.id === "dsaContest") {
      next.week = {
        ...next.week,
        contest: 1,
      };
    }

    if (action.id === "guitar30" || action.id === "guitar60") {
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

  function logDsaTime(minutes) {
    addXp("dsa", 0);

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
    }));
  }

  function resetEverything() {
    if (confirm("Reset all your Life RPG progress?")) {
      const fresh = {
        ...INITIAL_STATE,
        weekKey: getWeekKey(),
      };

      setState(fresh);
    }
  }

  const skills = [
    {
      id: "dsa",
      icon: "💻",
      name: "DSA",
      xp: state.xp.dsa,
    },
    {
      id: "guitar",
      icon: "🎸",
      name: "Guitar",
      xp: state.xp.guitar,
    },
    {
      id: "gym",
      icon: "🏋️",
      name: "Strength",
      xp: state.xp.gym,
    },
  ];

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

      {/* OVERALL PROGRESS */}

      <section className="overview">
        <div>
          <span>Total XP</span>
          <strong>{totalXp}</strong>

          <div className="overall-progress">
            <div style={{ width: `${overallProgress}%` }} />
          </div>

          <small>{overallProgress}/100 XP to next level</small>
        </div>

        <div>
          <span>Weekly Progress</span>

          <strong>
            {state.week.dsaMinutes >= 300 &&
            state.week.contest >= 1 &&
            state.week.guitarSessions >= 2 &&
            state.week.gymSessions >= 3
              ? "🔥 Complete"
              : "In Progress"}
          </strong>

          <small>
            {state.week.dsaMinutes}m DSA ·{" "}
            {state.week.guitarSessions} guitar ·{" "}
            {state.week.gymSessions} gym
          </small>
        </div>
      </section>

      {/* TODAY */}

      <section className="panel today-panel">
        <h2>🎯 Today's Quests</h2>

        <div className="today-quest">
          <div>
            <strong>DSA · 60 focused minutes</strong>
            <span>{state.today.dsaMinutes}/60 min</span>
          </div>

          <div className="quest-actions">
            <button onClick={() => logDsaTime(30)}>+30m</button>
            <button onClick={() => logDsaTime(60)}>+60m</button>
          </div>
        </div>

        <div className="today-quest">
          <div>
            <strong>Guitar · 30 minutes</strong>
            <span>{state.today.guitarMinutes}/30 min</span>
          </div>

          <button onClick={() => logAction(ACTIONS[3])}>
            +30m
          </button>
        </div>

        <div className="today-quest">
          <div>
            <strong>Gym · Complete workout</strong>
            <span>{state.today.workout ? "Completed ✓" : "Not completed"}</span>
          </div>

          <button
            disabled={state.today.workout}
            onClick={() => logAction(ACTIONS[5])}
          >
            {state.today.workout ? "Done ✓" : "+30 XP"}
          </button>
        </div>
      </section>

      {/* SKILLS */}

      <section>
        <h2>Skill Tree</h2>

        <div className="skills">
          {skills.map((skill) => {
            const level = Math.floor(skill.xp / 100) + 1;
            const progress = skill.xp % 100;

            return (
              <div className="skill-card" key={skill.id}>
                <div className="skill-title">
                  <span className="skill-icon">{skill.icon}</span>

                  <div>
                    <h3>{skill.name}</h3>
                    <p>Level {level}</p>
                  </div>
                </div>

                <div className="progress-bar">
                  <div style={{ width: `${progress}%` }} />
                </div>

                <div className="skill-xp">
                  {skill.xp} XP
                  <span>{progress}/100 to next level</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* WEEKLY QUESTS */}

      <section className="panel">
        <h2>📅 This Week</h2>

        <div className="quest">
          <span>DSA · 5 focused hours</span>
          <strong>{state.week.dsaMinutes}/300m</strong>
        </div>

        <div className="quest">
          <span>DSA · Complete one contest</span>
          <strong>{state.week.contest ? "✓" : "○"}</strong>
        </div>

        <div className="quest">
          <span>Guitar · 2 practice sessions</span>
          <strong>{state.week.guitarSessions}/2</strong>
        </div>

        <div className="quest">
          <span>Gym · 3 workouts</span>
          <strong>{state.week.gymSessions}/3</strong>
        </div>
      </section>

      {/* XP */}

      <section className="panel">
        <h2>⚔️ Log XP</h2>

        <div className="actions">
          {ACTIONS.map((action) => (
            <button
              key={action.id}
              onClick={() => logAction(action)}
            >
              {action.label}
              <span>+{action.xp}</span>
            </button>
          ))}
        </div>
      </section>

      <button className="reset-button" onClick={resetEverything}>
        Reset all progress
      </button>
    </div>
  );
}

export default App;