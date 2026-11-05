import type { Project, ProjectStatus } from "../../types/models"

const filterOptions: ("All" | ProjectStatus)[] = [
  "All",
  "In progress",
  "In review",
  "Completed",
]

type ProjectFiltersProps = {
  projects: Project[]
  selectedStatus: "All" | ProjectStatus
  onStatusChange: (status: "All" | ProjectStatus) => void
  search: string
  onSearchChange: (value: string) => void
  sortBy: "deadline" | "progress" | "title"
  onSortChange: (sort: "deadline" | "progress" | "title") => void
}

function ProjectFilters({
  projects,
  selectedStatus,
  onStatusChange,
  search,
  onSearchChange,
  sortBy,
  onSortChange,
}: ProjectFiltersProps) {
  return (
    <div className="projects-toolbar">
      <div className="project-filters">
        {filterOptions.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onStatusChange(option)}
            className={selectedStatus === option ? "active" : ""}
          >
            {option}
            <span>
              {option === "All"
                ? projects.length
                : projects.filter((project) => project.status === option)
                    .length}
            </span>
          </button>
        ))}
      </div>
      <div className="project-filter-tools">
        <label className="client-search project-search">
          <span>⌕</span>
          <input
            type="search"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search projects..."
          />
        </label>
        <label className="project-sort">
          Sort
          <select
            value={sortBy}
            onChange={(event) => {
              const value = event.target.value

              if (
                value === "deadline" ||
                value === "progress" ||
                value === "title"
              ) {
                onSortChange(value)
              }
            }}
          >
            <option value="deadline">Deadline</option>
            <option value="progress">Progress</option>
            <option value="title">Name</option>
          </select>
        </label>
      </div>
    </div>
  )
}
export default ProjectFilters
