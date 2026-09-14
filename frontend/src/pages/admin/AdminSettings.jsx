import { useState } from "react";
import Card, { CardHeader } from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Button from "../../components/ui/Button";
import Toggle from "../../components/ui/Toggle";
import { useToast } from "../../context/ToastContext";
import { useTheme } from "../../context/ThemeContext";
import { isValidHex } from "../../lib/color";

const TABS = [
  { key: "general", label: "General" },
  { key: "games", label: "Games" },
  { key: "payments", label: "Payments" },
  { key: "notifications", label: "Notifications" },
  { key: "appearance", label: "Appearance" },
  { key: "language", label: "Language" },
  { key: "security", label: "Security" },
];

const ACCENTS = [
  { value: "red", label: "Red", swatch: "#dc2626" },
  { value: "orange", label: "Orange", swatch: "#d97706" },
  { value: "amber", label: "Amber", swatch: "#ca8a04" },
  { value: "green", label: "Green", swatch: "#0f7a4d" },
  { value: "teal", label: "Teal", swatch: "#0d9488" },
  { value: "cyan", label: "Cyan", swatch: "#0891b2" },
  { value: "blue", label: "Blue", swatch: "#2563eb" },
  { value: "indigo", label: "Indigo", swatch: "#4f46e5" },
  { value: "purple", label: "Purple", swatch: "#7c3aed" },
  { value: "pink", label: "Pink", swatch: "#db2777" },
];

function SaveButton({ onSave }) {
  return (
    <div className="flex justify-end mt-2">
      <Button onClick={onSave}>Save changes</Button>
    </div>
  );
}

function GeneralSettings({ onSave }) {
  return (
    <Card>
      <CardHeader title="General" subtitle="Basic information about the ON Point platform" />
      <div className="grid sm:grid-cols-2 gap-4 mt-4">
        <Input label="Platform name" defaultValue="ON Point" />
        <Input label="Contact email" defaultValue="support@onpoint.app" />
        <Input label="Platform description" defaultValue="The home of Guess it and future ON Point games." containerClassName="sm:col-span-2" />
        <Input label="Support information" defaultValue="+237 6XX XXX XXX" />
        <Select label="Timezone" defaultValue="WAT" options={[{ value: "WAT", label: "West Africa Time (WAT)" }, { value: "UTC", label: "UTC" }]} />
        <Select label="Currency" defaultValue="FCFA" options={[{ value: "FCFA", label: "FCFA" }, { value: "USD", label: "USD" }, { value: "EUR", label: "EUR" }]} />
      </div>
      <SaveButton onSave={onSave} />
    </Card>
  );
}

function GameSettings({ onSave }) {
  return (
    <Card>
      <CardHeader title="Games" subtitle="Defaults applied to newly created games" />
      <div className="grid sm:grid-cols-2 gap-4 mt-4">
        <Input label="Default game duration (minutes)" type="number" defaultValue="5" />
        <Input label="Default entry fee (FCFA)" type="number" defaultValue="100" />
        <Input label="Default participant limit" type="number" placeholder="Leave blank for unlimited" />
        <Select
          label="Default game visibility"
          defaultValue="DRAFT"
          options={[
            { value: "DRAFT", label: "Draft" },
            { value: "UPCOMING", label: "Upcoming" },
          ]}
        />
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-[var(--color-ink)] mb-1.5">Default game rules</label>
          <textarea
            rows={3}
            defaultValue={"One entry per player per game.\nEntry fee is non-refundable once the game starts."}
            className="w-full rounded-lg border border-[var(--color-border-strong)] bg-[var(--color-surface)] text-sm px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30 focus:border-[var(--color-accent)]"
          />
        </div>
      </div>
      <SaveButton onSave={onSave} />
    </Card>
  );
}

function PaymentSettings({ onSave }) {
  return (
    <Card>
      <CardHeader title="Payments" subtitle="Visual configuration only — the backend developer connects the real provider" />
      <div className="grid sm:grid-cols-2 gap-4 mt-4">
        <Select label="Payment provider" defaultValue="mobile_money" options={[{ value: "mobile_money", label: "Mobile Money" }, { value: "stripe", label: "Stripe" }, { value: "flutterwave", label: "Flutterwave" }]} />
        <Select label="Currency" defaultValue="FCFA" options={[{ value: "FCFA", label: "FCFA" }, { value: "USD", label: "USD" }]} />
        <div className="sm:col-span-2">
          <p className="text-sm font-medium text-[var(--color-ink)] mb-2">Enabled payment methods</p>
          <div className="flex flex-wrap gap-2">
            {["Mobile Money", "Card", "Bank Transfer"].map((m) => (
              <span key={m} className="px-3 py-1.5 rounded-full text-sm bg-[var(--color-accent-soft)] text-[var(--color-accent)] font-medium">
                {m}
              </span>
            ))}
          </div>
        </div>
        <Input label="Minimum transaction amount" type="number" defaultValue="50" />
        <Input label="Maximum transaction amount" type="number" defaultValue="500000" />
      </div>
      <SaveButton onSave={onSave} />
    </Card>
  );
}

function NotificationSettings({ onSave }) {
  const [values, setValues] = useState({
    email: true,
    game: true,
    payment: true,
    winner: true,
    system: false,
  });
  const set = (key) => (v) => setValues((s) => ({ ...s, [key]: v }));

  return (
    <Card>
      <CardHeader title="Notifications" subtitle="Choose what admins get notified about" />
      <div className="mt-2 divide-y divide-[var(--color-border)]">
        <Toggle label="Email notifications" description="Receive a copy of important alerts by email" checked={values.email} onChange={set("email")} />
        <Toggle label="Game notifications" description="New submissions, games starting/ending" checked={values.game} onChange={set("game")} />
        <Toggle label="Payment notifications" description="Payment confirmations and failures" checked={values.payment} onChange={set("payment")} />
        <Toggle label="Winner notifications" description="When a new winner is determined" checked={values.winner} onChange={set("winner")} />
        <Toggle label="System notifications" description="Platform-level system events" checked={values.system} onChange={set("system")} />
      </div>
      <SaveButton onSave={onSave} />
    </Card>
  );
}

function AppearanceSettings() {
  const { theme, setTheme, accent, setAccent, customColor, setCustomColor } = useTheme();
  const { notify } = useToast();
  const [hexInput, setHexInput] = useState(customColor);

  const applyCustomColor = (hex) => {
    if (!isValidHex(hex)) return;
    setCustomColor(hex);
    notify("Custom accent color applied.", { type: "success" });
  };

  return (
    <Card>
      <CardHeader title="Appearance" subtitle="Theme and accent color for the whole platform" />
      <div className="mt-4">
        <p className="text-sm font-medium text-[var(--color-ink)] mb-2">Theme</p>
        <div className="flex flex-wrap gap-2">
          {[
            { value: "light", label: "Light" },
            { value: "dark", label: "Dark" },
            { value: "system", label: "System" },
          ].map((t) => (
            <button
              key={t.value}
              onClick={() => {
                setTheme(t.value);
                notify(`Theme set to ${t.label}.`, { type: "success" });
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                theme === t.value
                  ? "bg-[var(--color-ink)] text-[var(--color-bg)] border-[var(--color-ink)]"
                  : "border-[var(--color-border-strong)] text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-muted)]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <p className="text-sm font-medium text-[var(--color-ink)] mb-2">Accent color</p>
        <div className="flex flex-wrap gap-3">
          {ACCENTS.map((a) => (
            <button
              key={a.value}
              onClick={() => {
                setAccent(a.value);
                notify(`Accent color set to ${a.label}.`, { type: "success" });
              }}
              aria-label={a.label}
              title={a.label}
              className={`h-10 w-10 rounded-full flex items-center justify-center border-2 transition-transform hover:scale-105 ${
                accent === a.value ? "border-[var(--color-ink)]" : "border-transparent"
              }`}
            >
              <span className="h-7 w-7 rounded-full" style={{ backgroundColor: a.swatch }} />
            </button>
          ))}

          {/* Custom color swatch — opens the native color picker */}
          <label
            title="Custom color"
            className={`relative h-10 w-10 rounded-full flex items-center justify-center border-2 cursor-pointer transition-transform hover:scale-105 ${
              accent === "custom" ? "border-[var(--color-ink)]" : "border-transparent"
            }`}
          >
            <span
              className="h-7 w-7 rounded-full flex items-center justify-center"
              style={{
                background:
                  accent === "custom"
                    ? customColor
                    : "conic-gradient(from 180deg, #dc2626, #d97706, #ca8a04, #0f7a4d, #0891b2, #4f46e5, #db2777, #dc2626)",
              }}
            >
              {accent === "custom" && (
                <svg className="h-3.5 w-3.5 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M16.7 5.3a1 1 0 010 1.4l-7 7a1 1 0 01-1.4 0l-3-3a1 1 0 111.4-1.4l2.3 2.29 6.3-6.29a1 1 0 011.4 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </span>
            <input
              type="color"
              value={customColor}
              onChange={(e) => {
                setHexInput(e.target.value);
                applyCustomColor(e.target.value);
              }}
              className="absolute inset-0 opacity-0 cursor-pointer"
              aria-label="Pick a custom accent color"
            />
          </label>
        </div>

        {/* Hex input for precise custom colors */}
        <div className="flex items-center gap-2 mt-4 max-w-[220px]">
          <Input
            value={hexInput}
            onChange={(e) => setHexInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && applyCustomColor(hexInput)}
            placeholder="#0F7A4D"
            prefix={<span className="h-3.5 w-3.5 rounded-full border border-[var(--color-border-strong)]" style={{ backgroundColor: isValidHex(hexInput) ? hexInput : "transparent" }} />}
          />
          <Button size="sm" variant="outline" onClick={() => applyCustomColor(hexInput)}>
            Apply
          </Button>
        </div>

        <p className="text-xs text-[var(--color-ink-faint)] mt-3">
          Changes apply immediately across the whole platform via CSS variables — no hardcoded colors to update.
        </p>
      </div>

      {/* Live preview so the effect of a color choice is obvious immediately */}
      <div className="mt-6 pt-6 border-t border-[var(--color-border)]">
        <p className="text-sm font-medium text-[var(--color-ink)] mb-3">Live preview</p>
        <div className="flex flex-wrap items-center gap-3">
          <Button size="sm">Primary button</Button>
          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
            Badge
          </span>
          <span className="text-sm font-medium text-[var(--color-accent)] hover:underline cursor-pointer">
            Link text
          </span>
          <span className="h-2 w-16 rounded-full bg-[var(--color-accent)]" />
        </div>
      </div>
    </Card>
  );
}

function LanguageSettings() {
  const [language, setLanguage] = useState("en");
  const { notify } = useToast();
  const languages = [
    { value: "en", label: "English" },
    { value: "fr", label: "Français" },
  ];
  return (
    <Card>
      <CardHeader title="Language" subtitle="Default language for the admin dashboard" />
      <div className="flex flex-wrap gap-2 mt-4">
        {languages.map((l) => (
          <button
            key={l.value}
            onClick={() => {
              setLanguage(l.value);
              notify(`Language set to ${l.label}.`, { type: "success" });
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
              language === l.value
                ? "bg-[var(--color-ink)] text-[var(--color-bg)] border-[var(--color-ink)]"
                : "border-[var(--color-border-strong)] text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-muted)]"
            }`}
          >
            {l.label}
          </button>
        ))}
      </div>
      <p className="text-xs text-[var(--color-ink-faint)] mt-3">
        Built to add more languages later without restructuring the settings page.
      </p>
    </Card>
  );
}

function SecuritySettings() {
  const [values, setValues] = useState({ twoFactor: false, loginAlerts: true });
  const set = (key) => (v) => setValues((s) => ({ ...s, [key]: v }));
  const sessions = [
    { device: "Chrome on Windows", location: "Douala, CM", current: true },
    { device: "Safari on iPhone", location: "Douala, CM", current: false },
  ];

  return (
    <Card>
      <CardHeader title="Security" subtitle="Visual only — real authentication/security is handled by the backend" />
      <div className="mt-2 divide-y divide-[var(--color-border)]">
        <Toggle label="Two-factor authentication" description="Require a second step when signing in" checked={values.twoFactor} onChange={set("twoFactor")} />
        <Toggle label="Login notifications" description="Get notified of new sign-ins to this account" checked={values.loginAlerts} onChange={set("loginAlerts")} />
      </div>

      <div className="mt-6">
        <p className="text-sm font-medium text-[var(--color-ink)] mb-2">Active sessions</p>
        <div className="flex flex-col gap-2">
          {sessions.map((s, i) => (
            <div key={i} className="flex items-center justify-between px-4 py-3 rounded-xl border border-[var(--color-border)]">
              <div>
                <p className="text-sm text-[var(--color-ink)]">{s.device}</p>
                <p className="text-xs text-[var(--color-ink-muted)]">{s.location}</p>
              </div>
              {s.current ? (
                <span className="text-xs font-medium text-[var(--color-success)]">This device</span>
              ) : (
                <button className="text-xs font-medium text-[var(--color-danger)]">Sign out</button>
              )}
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

export default function AdminSettings() {
  const [tab, setTab] = useState("general");
  const { notify } = useToast();
  const handleSave = () => notify("Settings saved successfully.", { type: "success" });

  const content = {
    general: <GeneralSettings onSave={handleSave} />,
    games: <GameSettings onSave={handleSave} />,
    payments: <PaymentSettings onSave={handleSave} />,
    notifications: <NotificationSettings onSave={handleSave} />,
    appearance: <AppearanceSettings />,
    language: <LanguageSettings />,
    security: <SecuritySettings />,
  }[tab];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-lg font-semibold text-[var(--color-ink)]">Settings</h2>
        <p className="text-sm text-[var(--color-ink-muted)]">Platform-wide configuration for ON Point</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Tabs — vertical list on desktop, horizontal scroll on mobile */}
        <nav className="lg:w-48 shrink-0 flex lg:flex-col gap-1 overflow-x-auto scroll-thin">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`shrink-0 text-left px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                tab === t.key
                  ? "bg-[var(--color-accent-soft)] text-[var(--color-accent)]"
                  : "text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-ink)]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>

        <div className="flex-1 max-w-2xl">{content}</div>
      </div>
    </div>
  );
}
