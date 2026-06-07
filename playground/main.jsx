import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  ColorSchemeProvider, useColorScheme, AstralThemeProvider, useThemePreview,
  AstralModal, ConfirmModal, AstralSelect, AstralMenu, AstralPinInput, AstralToaster,
  notifications, DateInput, Spinner, SearchInput, StatusBadge, Avatar, Collapsible,
  Donut, FunnelBars, StackedBars, Sparkline, Delta,
} from '../dist/index.js';

const SWATCHES = ['#6741d9', '#2563eb', '#0d9488', '#e8590c', '#db2777'];
const COUNTRIES = ['United States', 'United Kingdom', 'Germany', 'France', 'Japan', 'Brazil'].map(c => ({ value: c, label: c }));
const ITEMS = ['AstralModal', 'AstralSelect', 'Donut', 'FunnelBars', 'StackedBars', 'SearchInput', 'StatusBadge', 'Avatar'];

function Card({ title, wide, children }) {
  return <div className={'pg-card' + (wide ? ' wide' : '')}><h3>{title}</h3>{children}</div>;
}

function Toolbar() {
  const { colorScheme, toggle } = useColorScheme();
  const { setPreview } = useThemePreview();
  const [brand, setBrand] = useState('#6741d9');
  return (
    <div className="pg-card wide">
      <div className="pg-row" style={{ justifyContent: 'space-between' }}>
        <div className="pg-row">
          <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--astral-color-dimmed)' }}>Brand</span>
          {SWATCHES.map(hex => (
            <button key={hex} className="pg-swatch" aria-pressed={brand === hex} style={{ background: hex }}
              onClick={() => { setBrand(hex); setPreview({ primary_color: hex }); }} />
          ))}
        </div>
        <button className="au-btn" onClick={toggle}>{colorScheme === 'dark' ? '🌙 Dark' : '☀️ Light'} - toggle</button>
      </div>
    </div>
  );
}

function SelectCard() {
  const [v, setV] = useState('United States');
  return <Card title="Select (searchable)"><AstralSelect value={v} onChange={setV} options={COUNTRIES} searchable clearable searchPlaceholder="Filter..." /></Card>;
}

function MenuCard() {
  return (
    <Card title="Menu">
      <AstralMenu trigger={<button className="au-btn">Actions ▾</button>} items={[
        { label: 'Edit', onClick: () => notifications.show({ message: 'Edit clicked', color: 'blue' }) },
        { label: 'Duplicate', onClick: () => notifications.show({ message: 'Duplicated', color: 'green' }) },
        { divider: true },
        { label: 'Delete', danger: true, onClick: () => notifications.show({ message: 'Deleted', color: 'red' }) },
      ]} />
    </Card>
  );
}

function ModalCard() {
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState(false);
  return (
    <Card title="Modal & ConfirmModal">
      <div className="pg-row">
        <button className="au-btn primary" onClick={() => setOpen(true)}>Open modal</button>
        <button className="au-btn danger" onClick={() => setConfirm(true)}>Delete…</button>
      </div>
      <AstralModal opened={open} onClose={() => setOpen(false)} title="Edit profile" width={440}>
        <div className="clay-form">
          <div><div className="au-field-label">Name</div><div className="au-input"><input defaultValue="Ada Byron" /></div></div>
          <div className="clay-actions">
            <button className="au-btn" onClick={() => setOpen(false)}>Cancel</button>
            <button className="au-btn primary" onClick={() => { setOpen(false); notifications.show({ title: 'Saved', message: 'Profile updated.', color: 'green' }); }}>Save</button>
          </div>
        </div>
      </AstralModal>
      <ConfirmModal opened={confirm} onClose={() => setConfirm(false)} danger title="Delete campaign?"
        message="This permanently removes the campaign and its schedule." confirmLabel="Delete"
        onConfirm={() => { setConfirm(false); notifications.show({ title: 'Deleted', message: 'Campaign removed.', color: 'red' }); }} />
    </Card>
  );
}

function ToastCard() {
  return (
    <Card title="Notifications">
      <div className="pg-row">
        <button className="au-btn" onClick={() => notifications.show({ title: 'Saved', message: 'Your changes are live.', color: 'green' })}>Success</button>
        <button className="au-btn" onClick={() => {
          const id = notifications.show({ message: 'Importing 2,400 contacts…', loading: true, autoClose: false });
          setTimeout(() => notifications.update({ id, title: 'Import complete', message: '2,400 added.', color: 'green', loading: false, autoClose: 2500 }), 1800);
        }}>Loading → done</button>
      </div>
    </Card>
  );
}

function PinCard() {
  const [code, setCode] = useState('');
  return <Card title="PinInput"><AstralPinInput length={6} value={code} onChange={setCode} /><div style={{ marginTop: 10, fontSize: 12, color: 'var(--astral-color-dimmed)' }}>value: {code || '-'}</div></Card>;
}

function DateCard() {
  const [d, setD] = useState(new Date(2026, 5, 6));
  return <Card title="DateInput"><DateInput type="date" value={d} onChange={setD} style={{ width: '100%', padding: '10px 13px', background: 'var(--au-surface-2)', border: '1px solid var(--au-line)', borderRadius: 10, color: 'var(--au-text)', font: 'inherit', fontSize: 13, outline: 'none' }} /></Card>;
}

function SearchCard() {
  const [q, setQ] = useState('');
  const shown = ITEMS.filter(i => i.toLowerCase().includes(q.trim().toLowerCase()));
  return (
    <Card title="SearchInput">
      <SearchInput value={q} onChange={setQ} placeholder="Search components…" />
      <ul style={{ listStyle: 'none', margin: '12px 0 0', padding: 0, display: 'flex', flexDirection: 'column', gap: 5 }}>
        {shown.map(i => <li key={i} className="au-menu-item" style={{ borderRadius: 8 }}>{i}</li>)}
        {shown.length === 0 && <li style={{ color: 'var(--au-faint)', fontSize: 13 }}>No matches.</li>}
      </ul>
    </Card>
  );
}

function CollapsibleCard() {
  return (
    <Card title="Collapsible - animates open & closed">
      <Collapsible title="Connection funnel">
        <FunnelBars data={[
          { stage: 'Connections sent', value: 1284, color: 'violet.6' },
          { stage: 'Accepted', value: 612, color: 'orange.6' },
          { stage: 'Replied', value: 233, color: 'green.6' },
        ]} />
      </Collapsible>
      <div style={{ height: 10 }} />
      <Collapsible title="Open by default" defaultOpen>
        <div style={{ fontSize: 13, color: 'var(--au-dim)' }}>The region folds away with a measured-height transition, so both expand and collapse ease smoothly.</div>
      </Collapsible>
    </Card>
  );
}

function ChartsCard() {
  return (
    <Card title="Charts - native linked hover" wide>
      <div className="pg-row" style={{ gap: 30, alignItems: 'flex-start' }}>
        <Donut centerValue="1,284" centerLabel="sent" data={[
          { name: 'Accepted', value: 412, color: 'green.6' },
          { name: 'Pending', value: 872, color: 'violet.6' },
        ]} />
        <div style={{ minWidth: 260, flex: 1 }}>
          <FunnelBars data={[
            { stage: 'Sent', value: 1284, color: 'violet.6' },
            { stage: 'Accepted', value: 792, color: 'green.6' },
            { stage: 'Replied', value: 412, color: 'blue.6' },
          ]} />
        </div>
      </div>
      <div style={{ marginTop: 18 }}>
        <StackedBars series={[{ label: 'Connects', color: 'violet.6' }, { label: 'Replies', color: 'green.6' }]}
          rows={[{ label: 'Mon', values: [120, 54] }, { label: 'Tue', values: [98, 40] }, { label: 'Wed', values: [140, 72] }]} />
      </div>
    </Card>
  );
}

function MiscCard() {
  return (
    <Card title="Badges, avatar, spinner, sparkline">
      <div className="pg-row" style={{ marginBottom: 12 }}>
        <StatusBadge status="running" label="Running" />
        <StatusBadge status="paused" label="Paused" />
        <StatusBadge status="failed" label="Failed" />
      </div>
      <div className="pg-row" style={{ marginBottom: 12, alignItems: 'center' }}>
        <Avatar name="Ada Byron" size={40} />
        <Avatar name="Jane Doe" radius={12} size={40} />
        <Spinner size={24} />
        <Delta current={420} previous={377} />
      </div>
      <Sparkline points={[3, 5, 4, 8, 7, 11]} color="violet.6" />
    </Card>
  );
}

function Playground() {
  return (
    <div className="pg-grid">
      <Toolbar />
      <SelectCard /><MenuCard /><ModalCard /><ToastCard />
      <PinCard /><DateCard /><SearchCard /><MiscCard />
      <CollapsibleCard />
      <ChartsCard />
    </div>
  );
}

const root = document.getElementById('pg-root');
const loading = document.getElementById('pg-loading');
if (loading) loading.remove();
createRoot(root).render(
  <ColorSchemeProvider defaultScheme="dark">
    <AstralThemeProvider>
      <AstralToaster />
      <Playground />
    </AstralThemeProvider>
  </ColorSchemeProvider>
);
