import { useState } from "react";
import "./App.css";

const skills = [
  { id: "dsa", icon: "💻", name: "DSA", xp: 340, level: 4 },
  { id: "guitar", icon: "🎸", name: "Guitar", xp: 120, level: 2 },
  { id: "gym", icon: "🏋️", name: "Strength", xp: 220, level: 3 },
];

const actions = [
  { skill: "dsa", label: "Easy", xp: 10 },
  { skill: "dsa", label: "Medium", xp: 25 },
  { skill: "dsa", label: "Contest", xp: 40 },
  { skill: "guitar", label: "Guitar 30m", xp: 15 },
  { skill: "guitar", label: "Guitar 60m", xp: 30 },
  { skill: "gym", label: "Workout", xp: 30 },
];

function App() {
  const [xp, setXp] = useState({
    dsa: 340,
    guitar: 120,
    gym: 220,
  });

  const totalXp = Object.values(xp).reduce((sum, value) => sum + value, 0);
  const overallLevel = Math.floor(totalXp / 100) + 1;

  function addXp(skill, amount) {
    setXp((current) => ({
      ...current,
      [skill]: current[skill] + amount,
    }));
  }

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

      <section className="overview">
        <div>
          <span>Total XP</span>
          <strong>{totalXp}</strong>
        </div>

        <div>
          <span>Weekly Streak</span>
          <strong>🔥 0</strong>
        </div>
      </section>

      <section>
        <h2>Skill Tree</h2>

        <div className="skills">
          {skills.map((skill) => {
            const currentXp = xp[skill.id];
            const level = Math.floor(currentXp / 100) + 1;
            const progress = currentXp % 100;

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
                  {currentXp} XP
                  <span>{progress}/100 to next level</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="panel">
        <h2>🎯 This Week</h2>

        <div className="quest">
          <span>DSA · 5 focused hours</span>
          <strong>0 / 5h</strong>
        </div>

        <div className="quest">
          <span>DSA · Complete one contest</span>
          <strong>○</strong>
        </div>

        <div className="quest">
          <span>Guitar · 2 practice sessions</span>
          <strong>0 / 2</strong>
        </div>

        <div className="quest">
          <span>Gym · Complete planned sessions</span>
          <strong>0 / 3</strong>
        </div>
      </section>

      <section className="panel">
        <h2>⚔️ Log XP</h2>

        <div className="actions">
          {actions.map((action) => (
            <button
              key={action.label}
              onClick={() => addXp(action.skill, action.xp)}
            >
              {action.label}
              <span>+{action.xp}</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

export default App;