import { useState } from "react";
import AppShell from "./AppShell";
import CalcPad from "./CalcPad";
import { ExamTarget, CgpaPlanner, GradeSetting } from "./CalcTools";
import { loadData, saveData } from "./Offline.js";

const TABS = [
  { key: "calc", label: "Calculator" },
  { key: "exam", label: "Exam target" },
  { key: "cgpa", label: "CGPA what-if" },
];

export default function Calculator({ user, go }) {
  const [tab, setTab] = useState("calc");
  const [includeE, setIncludeE] = useState(() => loadData("calc_e") === true);

  function changeE(value) {
    setIncludeE(value);
    saveData("calc_e", value);
  }

  return (
    <AppShell active="home" user={user} go={go} narrow>
      <h2 className="page-title">Calculator</h2>
      <div className="seg" role="tablist">
        {TABS.map((t) => (
          <button key={t.key} type="button" role="tab" aria-selected={tab === t.key}
            className={tab === t.key ? "on" : ""} onClick={() => setTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "calc" && (
        <section className="card">
          <CalcPad />
        </section>
      )}
      {tab !== "calc" && (
        <>
          <GradeSetting includeE={includeE} onChange={changeE} />
          {tab === "exam" ? <ExamTarget includeE={includeE} /> : <CgpaPlanner includeE={includeE} />}
        </>
      )}
    </AppShell>
  );
}