export function gradeTable(includeE) {
  const rows = [
    { grade: "A", min: 70, points: 5 },
    { grade: "B", min: 60, points: 4 },
    { grade: "C", min: 50, points: 3 },
    { grade: "D", min: 45, points: 2 },
  ];
  if (includeE) rows.push({ grade: "E", min: 40, points: 1 });
  rows.push({ grade: "F", min: 0, points: 0 });
  return rows;
}

// What must I score in the exam to reach each grade?
export function examTargets(ca, examMax, includeE) {
  return gradeTable(includeE)
    .filter((g) => g.grade !== "F")
    .map((g) => {
      const raw = g.min - ca;
      const need = Math.max(0, Math.ceil(Number((raw * 10).toFixed(6))) / 10);
      return { grade: g.grade, min: g.min, need, secured: need === 0, possible: need <= examMax };
    });
}

// Semester GPA, new CGPA, and the semester GPA needed to hit a target
export function plan({ cgpa, tcu, courses, target }) {
  const units = courses.reduce((sum, c) => sum + c.unit, 0);
  const newPoints = courses.reduce((sum, c) => sum + c.unit * c.points, 0);
  const hasPast = Number.isFinite(cgpa) && cgpa >= 0 && cgpa <= 5 && tcu >= 0;
  const out = { units, semesterGpa: null, newCgpa: null, needed: null };
  if (units <= 0) return out;

  out.semesterGpa = newPoints / units;
  if (hasPast) {
    const pastPoints = cgpa * tcu;
    out.newCgpa = (pastPoints + newPoints) / (tcu + units);
    if (Number.isFinite(target) && target > 0 && target <= 5) {
      out.needed = (target * (tcu + units) - pastPoints) / units;
    }
  }
  return out;
}