import { useLocation } from "react-router-dom"

const pageTitles: Record<string, string> = {
  "/": "Dashboard",
  "/clients": "Clients",
  "/projects": "Projects",
  "/reports": "Reports",
  "/settings": "Settings",
}

function Topbar() {
  const { pathname } = useLocation()
  return (
    <header className="topbar">
      <div className="breadcrumb">
        <span>Orbit Studio</span>
        <span>/</span>
        <strong>{pageTitles[pathname] ?? "Page not found"}</strong>
      </div>
      <button
        className="notification-button"
        type="button"
        aria-label="Notifications"
      >
        ♢
      </button>
    </header>
  )
}

export default Topbar
