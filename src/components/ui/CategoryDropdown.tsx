import { getFeatureGroups } from "../../lib/dataUtils"

interface CategoryDropdownProps {
  value: string
  onChange: (group: string) => void
}

export function CategoryDropdown({ value, onChange }: CategoryDropdownProps) {
  const groups = getFeatureGroups()

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-optum cursor-pointer"
    >
      {groups.map((g) => (
        <option key={g} value={g}>
          {g}
        </option>
      ))}
    </select>
  )
}
