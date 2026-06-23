import { GRADE_LABELS, MAX_GROUP_SIZE, NEW_INTAKE_GRADES } from '../data/initialData';
import { gradeTotal } from '../utils/projection';

export default function GradeRow({ gradeEntry, onChange, readOnly }) {
  const total = gradeTotal(gradeEntry);
  const isNewIntake = NEW_INTAKE_GRADES.includes(gradeEntry.grade);

  function handleGroupChange(groupIdx, value) {
    const updated = gradeEntry.groups.map((g, i) =>
      i === groupIdx ? { ...g, students: Number(value) || 0 } : g
    );
    onChange({ ...gradeEntry, groups: updated });
  }

  function addGroup() {
    onChange({
      ...gradeEntry,
      groups: [...gradeEntry.groups, { id: crypto.randomUUID(), students: 0 }],
    });
  }

  function removeGroup(groupIdx) {
    if (gradeEntry.groups.length <= 1) return;
    onChange({
      ...gradeEntry,
      groups: gradeEntry.groups.filter((_, i) => i !== groupIdx),
    });
  }

  const girls = Number(gradeEntry.girls) || 0;
  const boys = total - girls;

  function handleGirlsChange(value) {
    const v = Math.max(0, Math.min(total, Number(value) || 0));
    onChange({ ...gradeEntry, girls: v });
  }

  return (
    <tr className="grade-row">
      <td className="grade-label">{GRADE_LABELS[gradeEntry.grade]}</td>
      <td className="groups-cell">
        <div className="groups-wrapper">
          {gradeEntry.groups.map((group, idx) => (
            <div key={group.id} className="group-input-wrap">
              <span className="group-tag">G{idx + 1}</span>
              {readOnly ? (
                <span className="group-value">{group.students}</span>
              ) : (
                <input
                  type="number"
                  min="0"
                  max={isNewIntake ? MAX_GROUP_SIZE : 999}
                  value={group.students}
                  onChange={(e) => handleGroupChange(idx, e.target.value)}
                  className="group-input"
                />
              )}
              {!readOnly && gradeEntry.groups.length > 1 && (
                <button className="btn-remove-group" onClick={() => removeGroup(idx)} title="Eliminar grupo">×</button>
              )}
            </div>
          ))}
          {!readOnly && (
            <button className="btn-add-group" onClick={addGroup} title="Agregar grupo">+ Grupo</button>
          )}
        </div>
      </td>
      <td className="total-cell">{total}</td>
      <td className="groups-count-cell">{gradeEntry.groups.length} {gradeEntry.groups.length === 1 ? 'grupo' : 'grupos'}</td>
      <td className="gender-cell">
        {readOnly ? (
          <span className="gender-readonly">
            <span className="gender-girls">{girls}♀</span>
            <span className="gender-boys">{boys}♂</span>
          </span>
        ) : (
          <div className="gender-input-wrap">
            <label className="gender-label girls">♀
              <input
                type="number"
                min="0"
                max={total}
                value={girls}
                onChange={(e) => handleGirlsChange(e.target.value)}
                className="gender-input"
                title="Niñas"
              />
            </label>
            <span className="gender-boys-auto" title="Niños (calculado)">♂ {boys}</span>
          </div>
        )}
      </td>
    </tr>
  );
}
