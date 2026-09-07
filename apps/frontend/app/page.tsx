'use client';

import { useState, useEffect } from 'react';

import { MOCK_ENTRIES, MOCK_PARTNERS } from './mock-data';
import type {
  Decision,
  Partner,
  PartnerStatus,
  Role,
  View,
  WalletEntry,
} from './types';

import { Wordmark } from '@/components/composites/wordmark';
import { Card } from '@/components/composites/card';
import { SITE_CONTENT } from '@/content/site';
import { BandeauSimulation } from '@/components/composites/simulation-banner';

/** Le partenaire connecté sur le compte de démonstration. */
const DEMO_PARTNER = MOCK_PARTNERS[1];

/* ─── Helpers ─── */
function formatAmount(cents: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(cents / 100);
}

function Montant({
  cents,
  className = '',
}: {
  cents: number;
  className?: string;
}) {
  return (
    <span className={`font-mono-data ${className}`}>{formatAmount(cents)}</span>
  );
}

/**
 * Mention de simulation exigée par le cabinet juridique, courrier du 1er
 * septembre 2026. Elle est présentée en bandeau permanent plutôt qu'accolée à
 * chaque montant, afin de rester lisible sans alourdir les chiffres.
 */
function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Aujourd'hui";
  if (days === 1) return 'Hier';
  return `Il y a ${days} jours`;
}

function statusLabel(s: PartnerStatus): string {
  return {
    pending: 'En attente',
    active: 'Actif',
    rejected: 'Refusé',
    suspended: 'Suspendu',
    closed: 'Clôturé',
  }[s];
}

function statusBadge(s: PartnerStatus) {
  return (
    <span
      className={`badge-${s} inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium font-display`}
    >
      {statusLabel(s)}
    </span>
  );
}

/* ─── Badge Partenaire officiel ─── */
function BadgeOfficiel() {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium font-display bg-[color:var(--secondary)] text-[color:var(--primary)] border border-[color:var(--primary)]">
      <svg
        viewBox="0 0 24 24"
        className="w-3.5 h-3.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
      >
        <path d="m5 12.5 4.5 4.5L19 7.5" />
      </svg>
      Partenaire officiel
    </span>
  );
}

/* ─── Sidebar ─── */
function Sidebar({
  role,
  currentView,
  onNavigate,
  onLogout,
}: {
  role: Role;
  currentView: View;
  onNavigate: (v: View) => void;
  onLogout: () => void;
}) {
  const employeeNav = [
    {
      view: 'employee-dashboard' as View,
      label: 'Mon compte',
      icon: <IconWallet />,
    },
    { view: 'employee-pay' as View, label: 'Payer', icon: <IconQr /> },
    {
      view: 'employee-history' as View,
      label: 'Historique',
      icon: <IconHistory />,
    },
    {
      view: 'employee-catalog' as View,
      label: 'Partenaires',
      icon: <IconMap />,
    },
  ];
  const partnerNav = [
    {
      view: 'partner-dashboard' as View,
      label: 'Tableau de bord',
      icon: <IconHome />,
    },
    {
      view: 'partner-profile' as View,
      label: 'Mon dossier',
      icon: <IconFile />,
    },
  ];
  const adminNav = [
    {
      view: 'admin-dashboard' as View,
      label: 'Dossiers partenaires',
      icon: <IconUsers />,
    },
  ];

  const nav =
    role === 'employee'
      ? employeeNav
      : role === 'partner'
        ? partnerNav
        : adminNav;
  const userName =
    role === 'employee'
      ? 'Marie Dupont'
      : role === 'partner'
        ? DEMO_PARTNER.name
        : 'Jean Leclerc';
  const roleLabel =
    role === 'employee'
      ? 'Salarié·e'
      : role === 'partner'
        ? 'Partenaire'
        : 'Administration';

  return (
    <aside className="hidden md:flex fixed left-0 top-0 h-full w-[240px] bg-[color:var(--card)] border-r border-[color:var(--border)] flex-col z-30">
      <div className="px-5 py-5 border-b border-[color:var(--border)]">
        <Wordmark />
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {nav.map(({ view, label, icon }) => (
          <button
            key={view}
            onClick={() => onNavigate(view)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-sm font-display font-medium transition-colors text-left
              ${
                currentView === view
                  ? 'bg-[color:var(--secondary)] text-[color:var(--primary)]'
                  : 'text-[color:var(--foreground)] hover:bg-[color:var(--muted)] hover:text-[color:var(--primary)]'
              }`}
          >
            <span
              className={
                currentView === view
                  ? 'text-[color:var(--primary)]'
                  : 'text-[color:var(--muted-foreground)]'
              }
            >
              {icon}
            </span>
            {label}
          </button>
        ))}
      </nav>

      {/* User + logout */}
      <div className="px-5 py-4 border-t border-[color:var(--border)]">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-[color:var(--secondary)] flex items-center justify-center font-display font-semibold text-xs text-[color:var(--primary)]">
            {userName.charAt(0)}
          </div>
          <div className="min-w-0">
            <div className="font-display font-semibold text-xs text-[color:var(--foreground)] truncate">
              {userName}
            </div>
            <div className="text-[10px] text-[color:var(--muted-foreground)] font-display">
              {roleLabel}
            </div>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="w-full text-left text-xs font-display text-[color:var(--muted-foreground)] hover:text-[color:var(--destructive)] transition-colors flex items-center gap-2 py-1"
        >
          <IconLogout />
          Se déconnecter
        </button>
      </div>
    </aside>
  );
}

/* ─── Mobile Nav ─── */
function MobileNav({
  role,
  currentView,
  onNavigate,
}: {
  role: Role;
  currentView: View;
  onNavigate: (v: View) => void;
}) {
  const employeeNav = [
    {
      view: 'employee-dashboard' as View,
      label: 'Compte',
      icon: <IconWallet />,
    },
    { view: 'employee-pay' as View, label: 'Payer', icon: <IconQr /> },
    {
      view: 'employee-history' as View,
      label: 'Historique',
      icon: <IconHistory />,
    },
    {
      view: 'employee-catalog' as View,
      label: 'Partenaires',
      icon: <IconMap />,
    },
  ];
  const partnerNav = [
    { view: 'partner-dashboard' as View, label: 'Tableau', icon: <IconHome /> },
    { view: 'partner-profile' as View, label: 'Dossier', icon: <IconFile /> },
  ];
  const adminNav = [
    { view: 'admin-dashboard' as View, label: 'Dossiers', icon: <IconUsers /> },
  ];

  const nav =
    role === 'employee'
      ? employeeNav
      : role === 'partner'
        ? partnerNav
        : adminNav;

  return (
    <nav className="flex md:hidden fixed bottom-0 left-0 right-0 bg-[color:var(--card)] border-t border-[color:var(--border)] px-2 py-2 z-30">
      <div className="flex justify-around w-full">
        {nav.map(({ view, label, icon }) => (
          <button
            key={view}
            onClick={() => onNavigate(view)}
            className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded min-w-[56px] transition-colors
              ${currentView === view ? 'text-[color:var(--primary)]' : 'text-[color:var(--muted-foreground)]'}`}
          >
            {icon}
            <span className="text-[10px] font-display font-medium">
              {label}
            </span>
          </button>
        ))}
      </div>
    </nav>
  );
}

/* ─── Page Header ─── */
function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 mb-6 md:mb-8">
      <div>
        <h1 className="font-display font-semibold text-xl md:text-2xl text-[color:var(--foreground)] leading-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm text-[color:var(--muted-foreground)] mt-1">
            {subtitle}
          </p>
        )}
      </div>
      {actions && <div className="shrink-0">{actions}</div>}
    </div>
  );
}

/* ─── Card ─── */
/* ─── Button ─── */
function Button({
  children,
  onClick,
  variant = 'outline',
  size = 'md',
  disabled = false,
  className = '',
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'outline' | 'ghost' | 'destructive' | 'primary-outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
}) {
  const base =
    'inline-flex items-center justify-center gap-2 font-display font-medium rounded transition-all focus-visible:ring-2 focus-visible:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed';
  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-sm',
  };
  const variants = {
    outline:
      'border border-[color:var(--border)] text-[color:var(--foreground)] hover:border-[color:var(--primary)] hover:text-[color:var(--primary)] bg-transparent',
    ghost:
      'text-[color:var(--muted-foreground)] hover:bg-[color:var(--muted)] hover:text-[color:var(--foreground)] bg-transparent',
    destructive:
      'border border-[color:var(--destructive)] text-[color:var(--destructive)] hover:bg-[#FEF2F2] bg-transparent',
    'primary-outline':
      'border-2 border-[color:var(--primary)] text-[color:var(--primary)] hover:bg-[color:var(--secondary)] bg-transparent',
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

/* ─── LOGIN PAGE ─── */
function LoginPage({ onLogin }: { onLogin: (role: Role) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('employee');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(role);
  };

  const demoRoles: { role: Role; label: string; email: string }[] = [
    {
      role: 'employee',
      label: 'Salarié·e',
      email: 'marie.dupont@entreprise.fr',
    },
    { role: 'partner', label: 'Partenaire', email: 'contact@kostumparty.fr' },
    {
      role: 'admin',
      label: 'Administration',
      email: 'jean.leclerc@cartepro.demo',
    },
  ];

  return (
    <div className="min-h-screen bg-[color:var(--background)] flex flex-col">
      {/* Header */}
      <header className="px-6 py-5 border-b border-[color:var(--border)] bg-[color:var(--card)]">
        <Wordmark />
      </header>
      <BandeauSimulation />

      {/* Main */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-[400px]">
          <div className="mb-8">
            <h1 className="font-display font-semibold text-2xl text-[color:var(--foreground)] mb-2">
              Connexion à CartePro
            </h1>
            <p className="text-sm text-[color:var(--muted-foreground)]">
              Accédez à votre espace personnel selon votre profil.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <Card className="p-6 mb-4">
              <div className="space-y-4">
                <div>
                  <label className="font-display text-xs font-medium text-[color:var(--muted-foreground)] uppercase tracking-wider block mb-1.5">
                    Adresse e-mail
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="vous@exemple.fr"
                    className="w-full border border-[color:var(--border)] rounded px-3 py-2.5 text-sm bg-transparent focus:outline-none focus:border-[color:var(--primary)] transition-colors"
                  />
                </div>
                <div>
                  <label className="font-display text-xs font-medium text-[color:var(--muted-foreground)] uppercase tracking-wider block mb-1.5">
                    Mot de passe
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full border border-[color:var(--border)] rounded px-3 py-2.5 text-sm bg-transparent focus:outline-none focus:border-[color:var(--primary)] transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full font-display font-semibold text-sm py-3 rounded border-2 border-[color:var(--primary)] text-[color:var(--primary)] hover:bg-[color:var(--secondary)] transition-colors"
                >
                  Se connecter
                </button>
              </div>
            </Card>
          </form>

          {/* Demo shortcuts */}
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="h-px flex-1 bg-[color:var(--border)]" />
              <span className="font-display text-xs text-[color:var(--muted-foreground)] uppercase tracking-wider">
                Démonstration
              </span>
              <div className="h-px flex-1 bg-[color:var(--border)]" />
            </div>
            <div className="flex flex-col gap-2">
              {demoRoles.map((d) => (
                <button
                  key={d.role}
                  onClick={() => onLogin(d.role)}
                  className={`w-full p-3 rounded border text-left transition-all font-display text-sm font-medium flex items-center gap-3
                    ${
                      role === d.role
                        ? 'border-[color:var(--primary)] bg-[color:var(--secondary)] text-[color:var(--primary)]'
                        : 'border-[color:var(--border)] text-[color:var(--muted-foreground)] hover:border-[color:var(--primary)] hover:text-[color:var(--primary)]'
                    }`}
                >
                  <span className="shrink-0">
                    {d.role === 'employee' ? (
                      <IconWallet />
                    ) : d.role === 'partner' ? (
                      <IconFile />
                    ) : (
                      <IconUsers />
                    )}
                  </span>
                  <span>{d.label}</span>
                  <span className="ml-auto text-xs opacity-60 font-mono-data truncate">
                    {d.email}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>

      <footer className="px-6 py-4 border-t border-[color:var(--border)]">
        <p className="font-display text-xs text-[color:var(--muted-foreground)] text-center">
          {SITE_CONTENT.disclaimer}
        </p>
      </footer>
    </div>
  );
}

/* ─── EMPLOYEE DASHBOARD ─── */
function EmployeeDashboard({ onNavigate }: { onNavigate: (v: View) => void }) {
  const balance = 12610; // in cents
  const lastEntry = MOCK_ENTRIES[0];

  return (
    <div className="page-enter">
      <PageHeader title="Mon portefeuille" subtitle="Vos avantages CartePro" />

      {/* Balance card */}
      <Card className="p-6 md:p-8 mb-4 relative overflow-hidden">
        {/* Decorative tricolore accent */}
        <div className="absolute top-0 left-0 bottom-0 w-1 flex flex-col">
          <div className="flex-1 bg-[#002395]" />
          <div className="flex-1 bg-white border-y border-[#E8E8E8]" />
          <div className="flex-1 bg-[#ED2939]" />
        </div>
        <div className="pl-4">
          <div className="font-display text-xs font-medium uppercase tracking-wider text-[color:var(--muted-foreground)] mb-2">
            À dépenser chez vos partenaires préférés 🎉
          </div>
          <div className="text-4xl md:text-5xl font-display font-bold text-[color:var(--primary)] mb-1">
            <Montant cents={balance} />
          </div>
          <div className="text-xs text-[color:var(--muted-foreground)]">
            Mis à jour le {formatDate(new Date().toISOString())} à{' '}
            {formatTime(new Date().toISOString())}
          </div>
        </div>
      </Card>

      {/* Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 mb-6">
        <button
          onClick={() => onNavigate('employee-pay')}
          className="p-4 rounded border-2 border-[color:var(--primary)] text-[color:var(--primary)] hover:bg-[color:var(--secondary)] transition-all font-display font-semibold text-sm flex flex-col items-center gap-2"
        >
          <IconQr className="w-6 h-6" />
          Générer un code
        </button>
        <button
          onClick={() => onNavigate('employee-catalog')}
          className="p-4 rounded border border-[color:var(--border)] text-[color:var(--foreground)] hover:border-[color:var(--primary)] hover:text-[color:var(--primary)] transition-all font-display font-medium text-sm flex flex-col items-center gap-2"
        >
          <IconMap className="w-6 h-6" />
          Partenaires
        </button>
      </div>

      {/* Recent transactions */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-display font-semibold text-sm text-[color:var(--foreground)]">
          Derniers mouvements
        </h2>
        <button
          onClick={() => onNavigate('employee-history')}
          className="font-display text-xs text-[color:var(--primary)] hover:underline"
        >
          Tout voir
        </button>
      </div>

      <Card>
        {MOCK_ENTRIES.slice(0, 4).map((entry, i) => (
          <div
            key={entry.id}
            className={`flex items-center justify-between px-4 py-3.5 ${i < 3 ? 'border-b border-[color:var(--border)]' : ''}`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs shrink-0
                ${entry.direction === 'credit' ? 'bg-[#D1FAE5] text-[#065F46]' : 'bg-[#EEF1F7] text-[color:var(--primary)]'}`}
              >
                {entry.direction === 'credit' ? '+' : '−'}
              </div>
              <div>
                <div className="font-display font-medium text-sm text-[color:var(--foreground)]">
                  {entry.direction === 'credit'
                    ? 'Abondement'
                    : entry.partner_name}
                </div>
                <div className="text-xs text-[color:var(--muted-foreground)]">
                  {timeAgo(entry.occurred_at)}
                </div>
              </div>
            </div>
            <div
              className={`font-mono-data font-medium text-sm ${entry.direction === 'credit' ? 'text-[#065F46]' : 'text-[color:var(--foreground)]'}`}
            >
              {entry.direction === 'credit' ? '+' : '−'}
              {formatAmount(entry.amount_cents)}
            </div>
          </div>
        ))}
      </Card>

      {/* Wallet info */}
      <div className="mt-4 p-4 bg-[color:var(--secondary)] rounded border-l-2 border-[color:var(--primary)]">
        <p className="text-xs text-[color:var(--muted-foreground)]">
          <span className="font-display font-semibold text-[color:var(--primary)]">
            Note :
          </span>{' '}
          Votre employeur crédite votre portefeuille CartePro au début de chaque
          période. Le solde non consommé reste disponible.
        </p>
      </div>
    </div>
  );
}

/* ─── QR CODE (SVG) ─── */
function QRCode({ size = 200 }: { size?: number }) {
  const pattern = [
    [1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1],
    [1, 0, 1, 1, 1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1, 1, 0, 1],
    [1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0],
    [1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 1],
    [0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0],
    [1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 0, 1, 0],
    [1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 1, 1, 0],
    [1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1],
    [1, 0, 1, 1, 1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0],
    [1, 0, 1, 1, 1, 0, 1, 0, 0, 1, 1, 0, 1, 0, 0, 0, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0],
    [1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1],
  ];
  const n = pattern.length;
  const cell = size / n;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="qr-container"
      aria-label="QR code de paiement"
    >
      <rect width={size} height={size} fill="white" />
      {pattern.map((row, y) =>
        row.map((cell_v, x) =>
          cell_v ? (
            <rect
              key={`${x}-${y}`}
              x={x * cell}
              y={y * cell}
              width={cell}
              height={cell}
              fill="#1A1A2E"
            />
          ) : null,
        ),
      )}
    </svg>
  );
}

/* ─── EMPLOYEE PAY ─── */
function EmployeePay() {
  const [secondsLeft, setSecondsLeft] = useState(1732);
  const shortCode = 'CPR4F7X2';
  const total = 1800;

  // The countdown owns the only state here: expiry is read from it rather than
  // stored, so the interval is created once instead of on every tick.
  useEffect(() => {
    const timer = setInterval(
      () => setSecondsLeft((s) => (s <= 1 ? 0 : s - 1)),
      1000,
    );
    return () => clearInterval(timer);
  }, []);

  const expired = secondsLeft <= 0;

  const regenerate = () => {
    setSecondsLeft(1800);
  };

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const progress = (secondsLeft / total) * 100;

  return (
    <div className="page-enter">
      <PageHeader
        title="Code de paiement"
        subtitle="Présentez ce code au partenaire pour encaisser"
      />

      <div className="max-w-sm mx-auto w-full">
        {/* QR Card */}
        <Card className="p-6 text-center relative overflow-hidden">
          {expired && (
            <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center z-10 rounded">
              <div className="text-[color:var(--muted-foreground)] mb-4">
                <IconExpired />
              </div>
              <p className="font-display font-semibold text-sm text-[color:var(--foreground)] mb-4">
                Code expiré
              </p>
              <button
                onClick={regenerate}
                className="font-display font-semibold text-sm px-5 py-2.5 rounded border-2 border-[color:var(--primary)] text-[color:var(--primary)] hover:bg-[color:var(--secondary)] transition-colors"
              >
                Générer un nouveau code
              </button>
            </div>
          )}

          {/* Timer bar */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-display text-xs text-[color:var(--muted-foreground)] uppercase tracking-wider">
                Valide encore
              </span>
              <span
                className={`font-mono-data font-medium text-sm ${secondsLeft < 60 ? 'text-[color:var(--destructive)]' : 'text-[color:var(--primary)]'}`}
              >
                {mins}:{secs.toString().padStart(2, '0')}
              </span>
            </div>
            <div className="h-1 bg-[color:var(--muted)] rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${secondsLeft < 60 ? 'bg-[color:var(--destructive)]' : 'bg-[color:var(--primary)]'}`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* QR */}
          <div className="flex justify-center mb-5">
            <div className="p-3 bg-white border-2 border-[color:var(--border)] rounded-lg">
              <QRCode size={188} />
            </div>
          </div>

          {/* Short code */}
          <div className="mb-2">
            <div className="font-display text-[10px] uppercase tracking-widest text-[color:var(--muted-foreground)] mb-1.5">
              Code de saisie manuelle
            </div>
            <div className="font-mono-data font-medium text-2xl text-[color:var(--primary)] tracking-[0.25em]">
              {shortCode}
            </div>
          </div>
        </Card>

        {/* Wallet info */}
        <div className="mt-4 flex items-center justify-between p-4 bg-[color:var(--secondary)] rounded">
          <div>
            <div className="font-display text-xs text-[color:var(--muted-foreground)] mb-0.5">
              Solde disponible
            </div>
            <div className="font-mono-data font-semibold text-[color:var(--primary)]">
              <Montant cents={12610} />
            </div>
          </div>
          <div className="font-display text-xs text-[color:var(--muted-foreground)] text-right">
            Le montant est
            <br />
            saisi par le partenaire
          </div>
        </div>

        <p className="text-xs text-[color:var(--muted-foreground)] text-center mt-4 px-4 leading-relaxed">
          Ce code est à usage unique. Il expire automatiquement après 30
          minutes. Gardez l’écran visible lors du scan.
        </p>
      </div>
    </div>
  );
}

/* ─── EMPLOYEE HISTORY ─── */
function EmployeeHistory() {
  const grouped: Record<string, WalletEntry[]> = {};
  for (const e of MOCK_ENTRIES) {
    const day = formatDate(e.occurred_at);
    if (!grouped[day]) grouped[day] = [];
    grouped[day].push(e);
  }

  return (
    <div className="page-enter">
      <PageHeader
        title="Historique"
        subtitle="Mouvements des 30 derniers jours"
      />

      <div className="space-y-5">
        {Object.entries(grouped).map(([day, entries]) => (
          <div key={day}>
            <div className="font-display text-xs font-medium uppercase tracking-wider text-[color:var(--muted-foreground)] mb-2 px-1">
              {day}
            </div>
            <Card>
              {entries.map((entry, i) => (
                <div
                  key={entry.id}
                  className={`flex items-center justify-between px-4 py-3.5 ${i < entries.length - 1 ? 'border-b border-[color:var(--border)]' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0
                      ${entry.direction === 'credit' ? 'bg-[#D1FAE5] text-[#065F46]' : 'bg-[#EEF1F7] text-[color:var(--primary)]'}`}
                    >
                      {entry.direction === 'credit' ? (
                        <IconArrowDown />
                      ) : (
                        <IconArrowUp />
                      )}
                    </div>
                    <div>
                      <div className="font-display font-medium text-sm text-[color:var(--foreground)]">
                        {entry.direction === 'credit'
                          ? 'Abondement employeur'
                          : entry.partner_name}
                      </div>
                      <div className="text-xs text-[color:var(--muted-foreground)]">
                        {formatTime(entry.occurred_at)} ·{' '}
                        {entry.direction === 'credit' ? 'Crédit' : 'Paiement'}
                      </div>
                    </div>
                  </div>
                  <div
                    className={`font-mono-data font-semibold text-sm ${entry.direction === 'credit' ? 'text-[#065F46]' : 'text-[color:var(--foreground)]'}`}
                  >
                    {entry.direction === 'credit' ? '+' : '−'}
                    {formatAmount(entry.amount_cents)}
                  </div>
                </div>
              ))}
            </Card>
          </div>
        ))}
      </div>

      <div className="mt-6 text-center">
        <Button variant="outline">Charger plus</Button>
      </div>
    </div>
  );
}

/* ─── EMPLOYEE CATALOG ─── */
function EmployeeCatalog({ partners }: { partners: Partner[] }) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const activePartners = partners.filter((p) => p.status === 'active');
  const categories = [
    'all',
    ...Array.from(new Set(activePartners.map((p) => p.category))),
  ];

  const filtered = activePartners.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.city.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === 'all' || p.category === category;
    return matchSearch && matchCat;
  });

  return (
    <div className="page-enter">
      <PageHeader
        title="Partenaires"
        subtitle="Établissements acceptant CartePro"
      />

      {/* Search */}
      <div className="relative mb-3">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[color:var(--muted-foreground)]">
          <IconSearch />
        </span>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher un commerce, une ville…"
          className="w-full border border-[color:var(--border)] rounded pl-9 pr-4 py-2.5 text-sm bg-[color:var(--card)] focus:outline-none focus:border-[color:var(--primary)] transition-colors"
        />
      </div>

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-5 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-display font-medium transition-colors border
              ${
                category === cat
                  ? 'bg-[color:var(--primary)] text-white border-[color:var(--primary)]'
                  : 'border-[color:var(--border)] text-[color:var(--muted-foreground)] hover:border-[color:var(--primary)] hover:text-[color:var(--primary)]'
              }`}
          >
            {cat === 'all' ? 'Tous' : cat}
          </button>
        ))}
      </div>

      {/* Partner list */}
      <div className="space-y-2">
        {filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-sm text-[color:var(--muted-foreground)]">
              Aucun partenaire trouvé
            </p>
          </div>
        )}
        {filtered.map((partner) => (
          <Card
            key={partner.id}
            className="p-4 hover:border-[color:var(--primary)] transition-colors cursor-pointer"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded bg-[color:var(--secondary)] flex items-center justify-center font-display font-bold text-sm text-[color:var(--primary)] shrink-0">
                  {partner.name.charAt(0)}
                </div>
                <div>
                  <div className="font-display font-semibold text-sm text-[color:var(--foreground)]">
                    {partner.name}
                  </div>
                  <div className="text-xs text-[color:var(--muted-foreground)] mt-0.5">
                    {partner.address}, {partner.city}
                  </div>
                </div>
              </div>
              <span className="shrink-0 text-xs font-display bg-[color:var(--muted)] text-[color:var(--muted-foreground)] px-2 py-0.5 rounded-full">
                {partner.category}
              </span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ─── PARTNER DASHBOARD ─── */
function PartnerDashboard({ onNavigate }: { onNavigate: (v: View) => void }) {
  const partner = DEMO_PARTNER;
  const recentPayments = [
    { id: 't1', amount_cents: 1250, at: '2026-08-31T14:20:00Z', mode: 'QR' },
    { id: 't2', amount_cents: 3400, at: '2026-08-31T11:05:00Z', mode: 'Code' },
    { id: 't3', amount_cents: 2100, at: '2026-08-30T16:45:00Z', mode: 'QR' },
  ];

  return (
    <div className="page-enter">
      <PageHeader
        title={partner.name}
        subtitle="Tableau de bord partenaire"
        actions={
          <div className="flex items-center gap-2">
            {partner.status === 'active' && <BadgeOfficiel />}
            {statusBadge(partner.status)}
          </div>
        }
      />

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        {[
          {
            label: "Encaissements aujourd'hui",
            value: '3',
            sub: 'Transactions',
          },
          {
            label: "Volume aujourd'hui",
            value: formatAmount(6750),
            sub: 'Encaissé',
          },
          {
            label: 'Volume du mois',
            value: formatAmount(142300),
            sub: 'Encaissé',
          },
        ].map((stat) => (
          <Card key={stat.label} className="p-4">
            <div className="font-display text-xs text-[color:var(--muted-foreground)] uppercase tracking-wider mb-2">
              {stat.label}
            </div>
            <div className="font-mono-data font-semibold text-xl text-[color:var(--primary)]">
              {stat.value}
            </div>
            <div className="text-xs text-[color:var(--muted-foreground)] mt-0.5">
              {stat.sub}
            </div>
          </Card>
        ))}
      </div>

      {/* Recent transactions */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-display font-semibold text-sm text-[color:var(--foreground)]">
          Encaissements récents
        </h2>
      </div>
      <Card className="mb-5">
        {recentPayments.map((p, i) => (
          <div
            key={p.id}
            className={`flex items-center justify-between px-4 py-3.5 ${i < recentPayments.length - 1 ? 'border-b border-[color:var(--border)]' : ''}`}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#D1FAE5] flex items-center justify-center text-[#065F46] text-xs font-display font-medium">
                {p.mode}
              </div>
              <div>
                <div className="font-display font-medium text-sm text-[color:var(--foreground)]">
                  Encaissement {p.mode === 'QR' ? 'par QR' : 'saisie manuelle'}
                </div>
                <div className="text-xs text-[color:var(--muted-foreground)]">
                  {formatDate(p.at)} · {formatTime(p.at)}
                </div>
              </div>
            </div>
            <div className="font-mono-data font-semibold text-sm text-[color:var(--foreground)]">
              {formatAmount(p.amount_cents)}
            </div>
          </div>
        ))}
      </Card>

      <button
        onClick={() => onNavigate('partner-profile')}
        className="w-full p-4 border border-[color:var(--border)] rounded hover:border-[color:var(--primary)] hover:bg-[color:var(--secondary)] transition-all font-display font-medium text-sm text-[color:var(--foreground)] flex items-center justify-between"
      >
        <span className="flex items-center gap-2">
          <IconFile />
          Consulter mon dossier
        </span>
        <span className="text-[color:var(--muted-foreground)]">→</span>
      </button>
    </div>
  );
}

/* ─── PARTNER PROFILE ─── */
function PartnerProfile() {
  const partner = DEMO_PARTNER;

  return (
    <div className="page-enter">
      <PageHeader
        title="Mon dossier"
        subtitle="Informations de votre établissement"
        actions={
          <div className="flex items-center gap-2">
            {partner.status === 'active' && <BadgeOfficiel />}
            {statusBadge(partner.status)}
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
        <Card className="p-5">
          <h2 className="font-display font-semibold text-sm text-[color:var(--foreground)] mb-4 pb-3 border-b border-[color:var(--border)]">
            Identité de l’entreprise
          </h2>
          <div className="space-y-3">
            {[
              { label: 'Raison sociale', value: partner.name },
              { label: 'SIREN', value: partner.siren, mono: true },
              { label: 'Objet social', value: partner.objet_social },
              { label: 'Catégorie', value: partner.category },
            ].map((f) => (
              <div key={f.label}>
                <div className="font-display text-[10px] uppercase tracking-wider text-[color:var(--muted-foreground)] mb-0.5">
                  {f.label}
                </div>
                <div
                  className={`text-sm text-[color:var(--foreground)] ${f.mono ? 'font-mono-data' : ''}`}
                >
                  {f.value}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="font-display font-semibold text-sm text-[color:var(--foreground)] mb-4 pb-3 border-b border-[color:var(--border)]">
            Coordonnées
          </h2>
          <div className="space-y-3">
            {[
              { label: 'Adresse', value: partner.address },
              { label: 'Ville', value: partner.city },
              {
                label: 'Date de dépôt',
                value: formatDate(partner.submitted_at),
              },
            ].map((f) => (
              <div key={f.label}>
                <div className="font-display text-[10px] uppercase tracking-wider text-[color:var(--muted-foreground)] mb-0.5">
                  {f.label}
                </div>
                <div className="text-sm text-[color:var(--foreground)]">
                  {f.value}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-[color:var(--border)]">
            <p className="text-xs text-[color:var(--muted-foreground)]">
              Le SIREN et le statut ne peuvent pas être modifiés. Contactez
              l’administration en cas d’erreur.
            </p>
          </div>
        </Card>
      </div>

      {/* Décisions */}
      {partner.decisions.length > 0 && (
        <div>
          <h2 className="font-display font-semibold text-sm text-[color:var(--foreground)] mb-3">
            Historique des décisions
          </h2>
          <Card>
            {partner.decisions.map((d, i) => (
              <div
                key={d.id}
                className={`p-4 ${i < partner.decisions.length - 1 ? 'border-b border-[color:var(--border)]' : ''}`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    {statusBadge(d.from_status)}
                    <span className="text-[color:var(--muted-foreground)] text-xs">
                      →
                    </span>
                    {statusBadge(d.to_status)}
                  </div>
                  <div className="text-xs text-[color:var(--muted-foreground)] shrink-0">
                    {formatDate(d.decided_at)}
                  </div>
                </div>
                <p className="text-sm text-[color:var(--foreground)] leading-relaxed">
                  {d.reason}
                </p>
                <p className="font-display text-xs text-[color:var(--muted-foreground)] mt-1.5">
                  Décidé par {d.decided_by}
                </p>
              </div>
            ))}
          </Card>
        </div>
      )}
    </div>
  );
}

/* ─── ADMIN DASHBOARD ─── */
function AdminDashboard({
  partners,
  onSelectPartner,
}: {
  partners: Partner[];
  onSelectPartner: (id: string) => void;
}) {
  const [filter, setFilter] = useState<PartnerStatus | 'all'>('pending');

  const filtered =
    filter === 'all' ? partners : partners.filter((p) => p.status === filter);

  const counts = {
    all: partners.length,
    pending: partners.filter((p) => p.status === 'pending').length,
    active: partners.filter((p) => p.status === 'active').length,
    rejected: partners.filter((p) => p.status === 'rejected').length,
    suspended: partners.filter((p) => p.status === 'suspended').length,
  };

  const filters: { key: PartnerStatus | 'all'; label: string }[] = [
    { key: 'pending', label: 'En attente' },
    { key: 'active', label: 'Actifs' },
    { key: 'rejected', label: 'Refusés' },
    { key: 'all', label: 'Tous' },
  ];

  return (
    <div className="page-enter">
      <PageHeader
        title="Dossiers partenaires"
        subtitle="Instruction et gestion des demandes d'adhésion"
      />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'En attente', count: counts.pending, urgent: true },
          { label: 'Actifs', count: counts.active, urgent: false },
          { label: 'Refusés', count: counts.rejected, urgent: false },
          { label: 'Total', count: counts.all, urgent: false },
        ].map((s) => (
          <Card key={s.label} className="p-4">
            <div className="font-mono-data font-bold text-2xl text-[color:var(--primary)]">
              {s.count}
            </div>
            <div className="font-display text-xs text-[color:var(--muted-foreground)] mt-1">
              {s.label}
            </div>
          </Card>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 mb-4 border-b border-[color:var(--border)]">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-2.5 font-display text-sm font-medium transition-colors border-b-2 -mb-px
              ${
                filter === f.key
                  ? 'text-[color:var(--primary)] border-[color:var(--primary)]'
                  : 'text-[color:var(--muted-foreground)] border-transparent hover:text-[color:var(--foreground)]'
              }`}
          >
            {f.label}
            <span className="ml-1.5 font-mono-data text-xs opacity-70">
              {counts[f.key as keyof typeof counts] ?? counts.all}
            </span>
          </button>
        ))}
      </div>

      {/* Partner list */}
      <div className="space-y-2">
        {filtered.map((partner) => (
          <Card
            key={partner.id}
            className="p-4 hover:border-[color:var(--primary)] transition-colors cursor-pointer"
            onClick={() => onSelectPartner(partner.id)}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded bg-[color:var(--secondary)] flex items-center justify-center font-display font-bold text-sm text-[color:var(--primary)] shrink-0">
                  {partner.name.charAt(0)}
                </div>
                <div>
                  <div className="font-display font-semibold text-sm text-[color:var(--foreground)]">
                    {partner.name}
                  </div>
                  <div className="font-mono-data text-xs text-[color:var(--muted-foreground)] mt-0.5">
                    SIREN {partner.siren}
                  </div>
                  <div className="text-xs text-[color:var(--muted-foreground)]">
                    {partner.city} · {partner.category}
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1.5 shrink-0">
                {statusBadge(partner.status)}
                <span className="text-xs text-[color:var(--muted-foreground)]">
                  {timeAgo(partner.submitted_at)}
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ─── ADMIN PARTNER DETAIL ─── */
function AdminPartnerDetail({
  partners,
  partnerId,
  onBack,
  onDecision,
}: {
  partners: Partner[];
  partnerId: string;
  onBack: () => void;
  onDecision: (
    id: string,
    decision: 'active' | 'rejected' | 'suspended',
    reason: string,
  ) => void;
}) {
  const partner = partners.find((p) => p.id === partnerId)!;
  const [reason, setReason] = useState('');
  const [action, setAction] = useState<'active' | 'rejected' | null>(null);

  const canDecide = partner.status === 'pending';

  const handleSubmit = () => {
    if (!action || reason.trim().length === 0) return;
    onDecision(partnerId, action, reason);
    setReason('');
    setAction(null);
  };

  return (
    <div className="page-enter">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onBack}
          className="font-display text-sm text-[color:var(--muted-foreground)] hover:text-[color:var(--primary)] flex items-center gap-1.5 transition-colors"
        >
          ← Retour
        </button>
        <span className="text-[color:var(--border)]">/</span>
        <span className="font-display text-sm text-[color:var(--foreground)] font-medium">
          {partner.name}
        </span>
        <div className="ml-auto">{statusBadge(partner.status)}</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
        {/* Dossier details */}
        <Card className="p-5">
          <h2 className="font-display font-semibold text-sm text-[color:var(--foreground)] mb-4 pb-3 border-b border-[color:var(--border)]">
            Dossier
          </h2>
          <div className="space-y-3">
            {[
              { label: 'Raison sociale', value: partner.name },
              { label: 'SIREN', value: partner.siren, mono: true },
              { label: 'Objet social', value: partner.objet_social },
              { label: 'Catégorie', value: partner.category },
              {
                label: 'Adresse',
                value: `${partner.address}, ${partner.city}`,
              },
              {
                label: 'Date de dépôt',
                value: formatDate(partner.submitted_at),
              },
            ].map((f) => (
              <div key={f.label}>
                <div className="font-display text-[10px] uppercase tracking-wider text-[color:var(--muted-foreground)] mb-0.5">
                  {f.label}
                </div>
                <div
                  className={`text-sm text-[color:var(--foreground)] ${f.mono ? 'font-mono-data' : ''}`}
                >
                  {f.value}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Decision panel */}
        <div className="space-y-4">
          {canDecide && (
            <Card className="p-5">
              <h2 className="font-display font-semibold text-sm text-[color:var(--foreground)] mb-4 pb-3 border-b border-[color:var(--border)]">
                Prendre une décision
              </h2>

              <div className="grid grid-cols-2 gap-2 mb-4">
                <button
                  onClick={() => setAction('active')}
                  className={`p-3 rounded border text-center font-display font-medium text-xs transition-all
                    ${
                      action === 'active'
                        ? 'border-[#065F46] bg-[#D1FAE5] text-[#065F46]'
                        : 'border-[color:var(--border)] text-[color:var(--muted-foreground)] hover:border-[#065F46] hover:text-[#065F46]'
                    }`}
                >
                  <div className="text-lg mb-1">✓</div>
                  Accepter
                </button>
                <button
                  onClick={() => setAction('rejected')}
                  className={`p-3 rounded border text-center font-display font-medium text-xs transition-all
                    ${
                      action === 'rejected'
                        ? 'border-[#991B1B] bg-[#FEE2E2] text-[#991B1B]'
                        : 'border-[color:var(--border)] text-[color:var(--muted-foreground)] hover:border-[#991B1B] hover:text-[#991B1B]'
                    }`}
                >
                  <div className="text-lg mb-1">✗</div>
                  Refuser
                </button>
              </div>

              <div className="mb-3">
                <label className="font-display text-xs font-medium uppercase tracking-wider text-[color:var(--muted-foreground)] block mb-1.5">
                  Motif (obligatoire)
                  <span className="ml-1 text-[color:var(--destructive)]">
                    *
                  </span>
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Saisissez le motif de votre décision. Ce texte sera transmis au partenaire."
                  rows={4}
                  className="w-full border border-[color:var(--border)] rounded px-3 py-2.5 text-sm bg-transparent focus:outline-none focus:border-[color:var(--primary)] transition-colors resize-none"
                />
                <div className="flex justify-between items-center mt-1">
                  <p className="text-xs text-[color:var(--muted-foreground)]">
                    Ce motif est conservé et opposable. Exigence juridique du
                    01/09/2026.
                  </p>
                  <span
                    className={`font-mono-data text-xs ${reason.trim().length === 0 ? 'text-[color:var(--destructive)]' : 'text-[color:var(--muted-foreground)]'}`}
                  >
                    {reason.trim().length}/∞
                  </span>
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={!action || reason.trim().length === 0}
                className="w-full font-display font-semibold text-sm py-2.5 rounded border-2 border-[color:var(--primary)] text-[color:var(--primary)] hover:bg-[color:var(--secondary)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Enregistrer la décision
              </button>
            </Card>
          )}

          {/* Decision history */}
          {partner.decisions.length > 0 && (
            <Card className="p-5">
              <h2 className="font-display font-semibold text-sm text-[color:var(--foreground)] mb-4 pb-3 border-b border-[color:var(--border)]">
                Historique des décisions
              </h2>
              <div className="space-y-3">
                {partner.decisions.map((d) => (
                  <div
                    key={d.id}
                    className="p-3 bg-[color:var(--muted)] rounded"
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      {statusBadge(d.from_status)}
                      <span className="text-xs text-[color:var(--muted-foreground)]">
                        →
                      </span>
                      {statusBadge(d.to_status)}
                    </div>
                    <p className="text-xs text-[color:var(--foreground)] leading-relaxed mb-1">
                      {d.reason}
                    </p>
                    <p className="font-display text-[10px] text-[color:var(--muted-foreground)]">
                      {d.decided_by} · {formatDate(d.decided_at)}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── APP SHELL ─── */
function AppShell({
  role,
  currentView,
  onNavigate,
  onLogout,
  children,
}: {
  role: Role;
  currentView: View;
  onNavigate: (v: View) => void;
  onLogout: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[color:var(--background)]">
      <Sidebar
        role={role}
        currentView={currentView}
        onNavigate={onNavigate}
        onLogout={onLogout}
      />
      <MobileNav
        role={role}
        currentView={currentView}
        onNavigate={onNavigate}
      />

      {/* Mobile top header */}
      <header className="flex md:hidden items-center justify-between fixed top-0 left-0 right-0 bg-[color:var(--card)] border-b border-[color:var(--border)] pl-6 pr-4 py-3 z-20">
        <Wordmark compact />
        <button
          onClick={onLogout}
          aria-label="Se déconnecter"
          className="flex items-center gap-1.5 text-xs font-display text-[color:var(--muted-foreground)] hover:text-[color:var(--destructive)] transition-colors py-1 px-2 rounded hover:bg-[color:var(--muted)]"
        >
          <IconLogout className="w-4 h-4" />
          <span className="hidden xs:inline">Déconnexion</span>
        </button>
      </header>

      {/* Main content — offset for sidebar on desktop, top+bottom bars on mobile */}
      <main className="md:pl-[240px] pt-[56px] md:pt-0 pb-[72px] md:pb-0 min-h-screen">
        <BandeauSimulation />
        <div className="max-w-3xl mx-auto px-4 py-6 md:px-8 md:py-8">
          {children}
        </div>
      </main>
    </div>
  );
}

/* ─── MAIN APP ─── */
export default function App() {
  const [role, setRole] = useState<Role | null>(null);
  const [view, setView] = useState<View>('login');
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(
    null,
  );
  const [partners, setPartners] = useState<Partner[]>(MOCK_PARTNERS);

  const handleLogin = (r: Role) => {
    setRole(r);
    const defaultView: Record<Role, View> = {
      employee: 'employee-dashboard',
      partner: 'partner-dashboard',
      admin: 'admin-dashboard',
    };
    setView(defaultView[r]);
  };

  const handleLogout = () => {
    setRole(null);
    setView('login');
    setSelectedPartnerId(null);
  };

  const handleSelectPartner = (id: string) => {
    setSelectedPartnerId(id);
    setView('admin-partner-detail');
  };

  const handleDecision = (
    id: string,
    decision: 'active' | 'rejected' | 'suspended',
    reason: string,
  ) => {
    setPartners((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        return {
          ...p,
          status: decision,
          decisions: [
            {
              id: `d-${Date.now()}`,
              from_status: p.status,
              to_status: decision,
              reason,
              decided_by: 'Jean Leclerc',
              decided_at: new Date().toISOString(),
            },
            ...p.decisions,
          ],
        };
      }),
    );
    setView('admin-dashboard');
  };

  if (!role || view === 'login') {
    return <LoginPage onLogin={handleLogin} />;
  }

  const renderView = () => {
    switch (view) {
      case 'employee-dashboard':
        return <EmployeeDashboard onNavigate={setView} />;
      case 'employee-pay':
        return <EmployeePay />;
      case 'employee-history':
        return <EmployeeHistory />;
      case 'employee-catalog':
        return <EmployeeCatalog partners={partners} />;
      case 'partner-dashboard':
        return <PartnerDashboard onNavigate={setView} />;
      case 'partner-profile':
        return <PartnerProfile />;
      case 'admin-dashboard':
        return (
          <AdminDashboard
            partners={partners}
            onSelectPartner={handleSelectPartner}
          />
        );
      case 'admin-partner-detail':
        return selectedPartnerId ? (
          <AdminPartnerDetail
            partners={partners}
            partnerId={selectedPartnerId}
            onBack={() => setView('admin-dashboard')}
            onDecision={handleDecision}
          />
        ) : null;
      default:
        return null;
    }
  };

  return (
    <>
      <AppShell
        role={role}
        currentView={view}
        onNavigate={setView}
        onLogout={handleLogout}
      >
        {renderView()}
      </AppShell>
    </>
  );
}

/* ─── Icons ─── */
function IconWallet({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M16 13a1 1 0 1 0 2 0 1 1 0 0 0-2 0" />
      <path d="M2 9h20" />
    </svg>
  );
}

function IconQr({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
      <rect
        x="5"
        y="5"
        width="3"
        height="3"
        fill="currentColor"
        stroke="none"
      />
      <rect
        x="16"
        y="5"
        width="3"
        height="3"
        fill="currentColor"
        stroke="none"
      />
      <rect
        x="5"
        y="16"
        width="3"
        height="3"
        fill="currentColor"
        stroke="none"
      />
      <path d="M14 14h3v3" />
      <path d="M14 19h7" />
      <path d="M21 14v5" />
    </svg>
  );
}

function IconHistory({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M12 7v5l4 2" />
    </svg>
  );
}

function IconMap({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 3 3 6v15l6-3 6 3 6-3V3l-6 3-6-3z" />
      <path d="M9 3v15" />
      <path d="M15 6v15" />
    </svg>
  );
}

function IconHome({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function IconFile({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="8" y1="13" x2="16" y2="13" />
      <line x1="8" y1="17" x2="16" y2="17" />
      <line x1="8" y1="9" x2="10" y2="9" />
    </svg>
  );
}

function IconUsers({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function IconLogout({ className = 'w-3.5 h-3.5' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

function IconSearch({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  );
}

function IconArrowDown({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 5v14" />
      <path d="m5 12 7 7 7-7" />
    </svg>
  );
}

function IconArrowUp({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 19V5" />
      <path d="m5 12 7-7 7 7" />
    </svg>
  );
}

function IconExpired({ className = 'w-12 h-12' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" />
      <path d="M3.05 13A9 9 0 1 1 12 21" />
    </svg>
  );
}
