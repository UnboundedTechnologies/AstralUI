// Manual harness for the AstralSelect combobox work. Renders the three shapes
// that behave differently - plain, searchable, and clearable+creatable - so the
// keyboard path can be driven for real rather than reasoned about.
import { createRoot } from 'react-dom/client';
import { useState } from 'react';
import { AstralSelect } from '../src/components/overlay';
import '../src/styles/utilities.css';
import '../src/styles/tokens.css';

const OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'paused', label: 'Paused' },
  { value: 'draft', label: 'Draft' },
  { value: 'done', label: 'Completed' },
];

function Demo() {
  const [a, setA] = useState('paused');
  const [b, setB] = useState(null);
  const [c, setC] = useState('draft');
  return (
    <div style={{ padding: 32, display: 'grid', gap: 24, maxWidth: 360 }}>
      <div>
        <label className="au-field-label" htmlFor="plain">Campaign status</label>
        <AstralSelect id="plain" value={a} onChange={setA} options={OPTIONS} placeholder="Pick one" />
        <output id="out-a">{String(a)}</output>
      </div>
      <div>
        <label className="au-field-label" htmlFor="searchable">Searchable</label>
        <AstralSelect id="searchable" value={b} onChange={setB} options={OPTIONS}
          searchable searchPlaceholder="Filter..." noResults="Nothing matches" placeholder="Pick one" />
        <output id="out-b">{String(b)}</output>
      </div>
      <div>
        <label className="au-field-label" htmlFor="clearable">Clearable + creatable</label>
        <AstralSelect id="clearable" value={c} onChange={setC} options={OPTIONS}
          searchable clearable creatable placeholder="Pick one" />
        <output id="out-c">{String(c)}</output>
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<Demo />);
