import { useEffect, useState } from "react"
import { useSettings } from "../context/SettingsContext"
import type { FormEvent } from "react"
import type { ChangeEvent } from "react"

function Settings() {
  const { settings, updateSettings } = useSettings()
  const [draft, setDraft] = useState(settings)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!saved) return
    const timer = setTimeout(() => setSaved(false), 2000)
    return () => clearTimeout(timer)
  }, [saved])

  function updateField(
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const target = event.currentTarget
    const { name, value } = target
    const nextValue =
      target instanceof HTMLInputElement && target.type === "checkbox"
        ? target.checked
        : value
    setDraft((current) => ({
      ...current,
      [name]: nextValue,
    }))
    if (
      name === "currency" &&
      (value === "EUR" || value === "USD" || value === "GBP")
    ) {
      updateSettings({ currency: value })
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    updateSettings(draft)
    localStorage.setItem("orbitSettings", JSON.stringify(draft))
    setSaved(true)
  }

  return (
    <main className="settings-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Workspace</p>
          <h1>Settings</h1>
          <p>Manage your workspace and notification preferences.</p>
        </div>
        <span className={`saved-indicator ${saved ? "show" : ""}`}>
          ✓ Changes saved
        </span>
      </div>
      <form className="settings-form" onSubmit={handleSubmit}>
        <section className="settings-card">
          <div className="settings-head">
            <h2>General settings</h2>
            <p>Your main workspace details.</p>
          </div>
          <label>
            Workspace name
            <input
              name="workspaceName"
              value={draft.workspaceName}
              onChange={updateField}
              required
            />
          </label>
          <label>
            Contact email
            <input
              name="email"
              type="email"
              value={draft.email}
              onChange={updateField}
              required
            />
          </label>
          <label>
            Default currency
            <select
              name="currency"
              value={draft.currency}
              onChange={updateField}
            >
              <option value="EUR">EUR — Euro</option>
              <option value="USD">USD — US Dollar</option>
              <option value="GBP">GBP — Pound Sterling</option>
            </select>
          </label>
        </section>
        <section className="settings-card">
          <div className="settings-head">
            <h2>Notifications</h2>
            <p>Choose which updates you want to receive.</p>
          </div>
          <label className="toggle-row">
            <span>
              <strong>Project updates</strong>
              <small>Status and deadline changes</small>
            </span>
            <input
              name="projectUpdates"
              type="checkbox"
              checked={draft.projectUpdates}
              onChange={updateField}
            />
          </label>
          <label className="toggle-row">
            <span>
              <strong>New clients</strong>
              <small>When a client is added</small>
            </span>
            <input
              name="newClients"
              type="checkbox"
              checked={draft.newClients}
              onChange={updateField}
            />
          </label>
          <label className="toggle-row">
            <span>
              <strong>Weekly report</strong>
              <small>Monday performance summary</small>
            </span>
            <input
              name="weeklyReport"
              type="checkbox"
              checked={draft.weeklyReport}
              onChange={updateField}
            />
          </label>
        </section>
        <div className="settings-actions">
          <button type="submit" className="save-settings">
            Save changes
          </button>
        </div>
      </form>
    </main>
  )
}

export default Settings
