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
      className="bg-white border border-gray-200 text-gray-700 text-sm rounded-lg px-3 py-2 cursor-pointer"
    >
      {groups.map((g) => (
        <option key={g} value={g}>
          {g}
        </option>
      ))}
    </select>
  )
}
