import { useState, useEffect } from "react";
import { loadData, saveData } from "./Offline.js";
import { gradeTable, examTargets, plan } from "./grades";
import { PlusIcon } from "./Icons";

// a state variable that saves itself on the device whenever it changes
function usePersisted(key, initial) {
  const [value, setValue] = useState(() => {
    const saved = loadData(key);
    return saved === null ? initial : saved;
  });
  useEffect(() => {
    saveData(key, value);
  }, [key, value]);
  return [value, setValue];
}

export function GradeSetting({ includeE, onChange }) {
  return (
    <section className="card grade-setting">
      <label className="check">
        <input type="checkbox" checked={includeE} onChange={(e) => onChange(e.target.checked)} />
        E (40 to 44) counts as a pass in my department
      </label>
      <p className="tool-note">Standard 5-point scale. Check your department handbook for your own rules.</p>
    </section>
  );
}

export function ExamTarget({ includeE }) {
  const [ca, setCa] = usePersisted("calc_ca", "");
  const [caMax, setCaMax] = usePersisted("calc_camax", "30");
  const [examMax, setExamMax] = usePersisted("calc_exammax", "70");

  const caNum = parseFloat(ca);
  const caMaxNum = parseFloat(caMax);
  const examMaxNum = parseFloat(examMax);
  const splitOk = caMaxNum + examMaxNum === 100;
  const caOk = Number.isFinite(caNum) && caNum >= 0 && caNum <= caMaxNum;
  const rows = splitOk && caOk ? examTargets(caNum, examMaxNum, includeE) : null;

  return (
    <section className="card">
      <h3 className="section-title">What do I need in the exam?</h3>
      <p className="tool-note">Enter your CA score and see the exam score each grade needs.</p>
      <div className="two">
        <div className="num-field">
          <label>My CA score</label>
          <input type="number" inputMode="decimal" step="any" value={ca} onChange={(e) => setCa(e.target.value)} />
        </div>
        <div className="num-field">
          <label>CA is out of</label>
          <input type="number" inputMode="decimal" step="any" value={caMax} onChange={(e) => setCaMax(e.target.value)} />
        </div>
      </div>
      <div className="num-field">
        <label>Exam is out of</label>
        <input type="number" inputMode="decimal" step="any" value={examMax} onChange={(e) => setExamMax(e.target.value)} />
      </div>

      {!splitOk && <div className="info">CA and exam marks should add up to 100.</div>}
      {splitOk && ca !== "" && !caOk && <div className="error">Your CA score must be between 0 and {caMax}.</div>}

      {rows && (
        <ul className="grade-list">
          {rows.map((r) => (
            <li key={r.grade}>
              <span className="grade-badge">{r.grade}</span>
              <span className={r.possible ? "grade-need" : "grade-need pill-no"}>
                {r.secured ? "Already secured" : r.possible ? `Score ${r.need} or more` : "Not reachable"}
                <small>Total of {r.min} or more</small>
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function CgpaPlanner({ includeE }) {
  const [cgpa, setCgpa] = usePersisted("calc_cgpa", "");
  const [tcu, setTcu] = usePersisted("calc_tcu", "");
  const [target, setTarget] = usePersisted("calc_target", "");
  const [courses, setCourses] = usePersisted("calc_courses", []);

  const table = gradeTable(includeE);
  const points = Object.fromEntries(table.map((g) => [g.grade, g.points]));

  function addCourse() {
    setCourses([...courses, { id: Date.now() + Math.random(), unit: "3", grade: "A" }]);
  }
  function updateCourse(id, patch) {
    setCourses(courses.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }
  function removeCourse(id) {
    setCourses(courses.filter((c) => c.id !== id));
  }

  const result = plan({
    cgpa: parseFloat(cgpa),
    tcu: parseFloat(tcu) || 0,
    courses: courses.map((c) => ({ unit: parseFloat(c.unit) || 0, points: points[c.grade] ?? 0 })),
    target: parseFloat(target),
  });

  return (
    <section className="card">
      <h3 className="section-title">What if...?</h3>
      <p className="tool-note">Take your CGPA and units from the portal, then add this semester's courses with the grades you expect.</p>
      <div className="two">
        <div className="num-field">
          <label>Current CGPA</label>
          <input type="number" inputMode="decimal" step="0.01" min="0" max="5" value={cgpa} onChange={(e) => setCgpa(e.target.value)} />
        </div>
        <div className="num-field">
          <label>Units so far</label>
          <input type="number" inputMode="numeric" min="0" value={tcu} onChange={(e) => setTcu(e.target.value)} />
        </div>
      </div>

      <h3 className="section-title course-title">This semester</h3>
      {courses.map((c) => (
        <div className="course-row" key={c.id}>
          <div className="num-field">
            <label>Units</label>
            <input type="number" inputMode="numeric" min="1" value={c.unit} onChange={(e) => updateCourse(c.id, { unit: e.target.value })} />
          </div>
          <div className="num-field">
            <label>Grade</label>
            <select value={c.grade in points ? c.grade : "F"} onChange={(e) => updateCourse(c.id, { grade: e.target.value })}>
              {table.map((g) => (
                <option key={g.grade} value={g.grade}>{g.grade}</option>
              ))}
            </select>
          </div>
          <button type="button" className="delete" onClick={() => removeCourse(c.id)} aria-label="Remove course">Remove</button>
        </div>
      ))}
      <button type="button" className="btn-ghost" onClick={addCourse}>
        <PlusIcon /> Add course
      </button>

      <div className="num-field">
        <label>Target CGPA (optional)</label>
        <input type="number" inputMode="decimal" step="0.01" min="0" max="5" value={target} onChange={(e) => setTarget(e.target.value)} />
      </div>

      {result.semesterGpa !== null && (
        <div className="result-card">
          <p className="muted small-line">Semester GPA</p>
          <strong>{result.semesterGpa.toFixed(2)}</strong>
          {result.newCgpa !== null && (
            <>
              <p className="muted small-line">New CGPA</p>
              <strong>{result.newCgpa.toFixed(2)}</strong>
            </>
          )}
          {result.needed !== null && (
            <p className="need-line">
              {result.needed > 5
                ? `Not reachable this semester with ${result.units} units.`
                : result.needed <= 0
                  ? "You are already past that target."
                  : `To reach ${target}, you need a semester GPA of ${result.needed.toFixed(2)}.`}
            </p>
          )}
        </div>
      )}
      <p className="tool-note">Estimates only. Your portal is the official record.</p>
    </section>
  );
}