import { NavLink } from "react-router-dom"

const navItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    path: "/",
    icon: "⌂",
    group: "workspace",
  },
  {
    id: "clients",
    label: "Clients",
    path: "/clients",
    icon: "♙",
    group: "workspace",
  },
  {
    id: "projects",
    label: "Projects",
    path: "/projects",
    icon: "◇",
    group: "workspace",
  },
  {
    id: "reports",
    label: "Reports",
    path: "/reports",
    icon: "⌁",
    group: "manage",
  },
  {
    id: "settings",
    label: "Settings",
    path: "/settings",
    icon: "⚙",
    group: "manage",
  },
]

type NavItemProps = {
  item: (typeof navItems)[number]
  count?: number
}

type SidebarProps = {
  clientCount: number
  projectCount: number
}

function NavItem({ item, count }: NavItemProps) {
  return (
    <li>
      <NavLink
        end={item.path === "/"}
        to={item.path}
        className={({ isActive }) =>
          isActive ? "nav-item active" : "nav-item"
        }
      >
        <span className="nav-icon">{item.icon}</span>
        <span>{item.label}</span>
        {count !== undefined && <span className="nav-count">{count}</span>}
      </NavLink>
    </li>
  )
}

function Sidebar({ clientCount, projectCount }: SidebarProps) {
  const counts: Record<string, number | undefined> = {
    clients: clientCount,
    projects: projectCount,
  }
  const renderGroup = (group: "workspace" | "manage") =>
    navItems
      .filter((item) => item.group === group)
      .map((item) => (
        <NavItem key={item.id} item={item} count={counts[item.id]} />
      ))

  return (
    <aside className="sidebar">
      <NavLink className="brand" to="/">
        Orbit CRM
      </NavLink>
      <nav className="main-nav" aria-label="Main navigation">
        <p className="nav-label">Workspace</p>
        <ul className="nav-list">{renderGroup("workspace")}</ul>
        <p className="nav-label nav-label-spaced">Manage</p>
        <ul className="nav-list">{renderGroup("manage")}</ul>
      </nav>
      <div className="capacity">
        <div className="capacity-head">
          <span>Monthly capacity</span>
          <strong>67%</strong>
        </div>
        <div className="capacity-bar">
          <span />
        </div>
        <p>268 of 400 hours planned</p>
      </div>
      <div className="profile">
        <span className="avatar">AK</span>
        <span className="profile-copy">
          <strong>Alex Kim</strong>
          <small>Workspace owner</small>
        </span>
      </div>
    </aside>
  )
}

export default Sidebar
