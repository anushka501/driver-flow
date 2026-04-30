import React, { useState, useRef } from 'react';
import Modal from '../shared/Modal';

const WORKFLOW_STEPS = [
  { label: 'Validate Input',  sub: 'Validates the input data structure' },
  { label: 'Create User',     sub: 'Create a user based on the driver form.' },
  { label: 'Create Driver',   sub: 'Create a driver record using the user data.' },
  { label: 'Execute Webhook', sub: 'Sends driver data to configured webhook' },
];

export default function CreateDriverModal({ open, onClose, onSave }) {
  const [tab, setTab] = useState(0); // 0 = Standard, 1 = Workflow
  const [wfStep, setWfStep]     = useState(null); // null = form, 'running' = progress, 'done' = complete
  const [wfActive, setWfActive] = useState(1);
  const timerRef = useRef(null);

  // Standard form state
  const [form, setForm] = useState({
    firstName: '', lastName: '', phone: '', email: '',
    licenseNo: '', vendor: '', isActive: true,
  });

  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserSearch, setShowUserSearch] = useState(false);

  function handleClose() {
    clearTimeout(timerRef.current);
    setWfStep(null);
    setWfActive(1);
    onClose();
  }

  function handleSaveStd() {
    handleClose();
    onSave && onSave({ ...form, id: 'ZDR' + Math.floor(Math.random() * 99999).toString().padStart(5, '0') });
  }

  function startWorkflow() {
    setWfStep('running');
    setWfActive(1);
    timerRef.current = setTimeout(() => {
      setWfActive(2);
      timerRef.current = setTimeout(() => {
        setWfActive(3);
        timerRef.current = setTimeout(() => {
          setWfActive(4);
          timerRef.current = setTimeout(() => setWfStep('done'), 1500);
        }, 1500);
      }, 1500);
    }, 2000);
  }

  function finishWorkflow() {
    handleClose();
    onSave && onSave({ ...form, id: 'ZDR' + Math.floor(Math.random() * 99999).toString().padStart(5, '0') });
  }

  const title = wfStep === 'running' ? 'Create Driver Workflow' : 'Create Driver';

  return (
    <Modal open={open} onClose={handleClose} title={title}>
      {/* Modal sub-tabs */}
      {!wfStep && (
        <div className="create-tabs">
          {['Standard', 'Workflow'].map((t, i) => (
            <div key={i} className={`ctab${tab === i ? ' on' : ''}`} onClick={() => setTab(i)}>{t}</div>
          ))}
        </div>
      )}

      {/* STANDARD FORM */}
      {tab === 0 && !wfStep && (
        <div style={{ padding: 20 }}>
          {/* Link User */}
          <div style={{ marginBottom: 16 }}>
            <label className="lbl">Link User Account<span className="hint">optional</span></label>
            <div className="usel-row" style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 6 }}>
              <div className={`udisp${selectedUser ? ' on' : ''}`} style={{ flex: 1, padding: '8px 10px', border: '1px solid var(--g200)', borderRadius: 'var(--r)', fontSize: 12, color: selectedUser ? 'var(--g800)' : 'var(--g400)', background: selectedUser ? 'var(--w)' : 'var(--g50)' }}>
                {selectedUser ? `${selectedUser.id} — ${selectedUser.name}` : 'No user linked'}
              </div>
              <button className="btn btn-sm" onClick={() => setShowUserSearch(!showUserSearch)}>
                {showUserSearch ? 'Cancel' : 'Link User'}
              </button>
            </div>

            {showUserSearch && (
              <UserSearchPanel onSelect={u => { setSelectedUser(u); setShowUserSearch(false); }} />
            )}

            {selectedUser && (
              <div style={{ marginTop: 8, padding: '6px 10px', background: 'var(--gl)', border: '1px solid var(--gb)', borderRadius: 'var(--r)', fontSize: 11, color: 'var(--green)' }}>
                ✓ {selectedUser.name} · {selectedUser.id}
              </div>
            )}
          </div>

          <div className="fg fg-2">
            <div className="field">
              <label className="lbl">First Name<span className="lbl-req">*</span></label>
              <input className="inp" placeholder="John" value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})} />
            </div>
            <div className="field">
              <label className="lbl">Last Name<span className="lbl-req">*</span></label>
              <input className="inp" placeholder="Doe" value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})} />
            </div>
            <div className="field">
              <label className="lbl">Phone<span className="lbl-req">*</span></label>
              <input className="inp" placeholder="+91 99999 99999" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
            </div>
            <div className="field">
              <label className="lbl">Email</label>
              <input className="inp" type="email" placeholder="driver@example.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
            </div>
            <div className="field">
              <label className="lbl">License Number</label>
              <input className="inp" placeholder="DL-XXXXXXXXXXXX" value={form.licenseNo} onChange={e => setForm({...form, licenseNo: e.target.value})} />
            </div>
            <div className="field">
              <label className="lbl">Vendor</label>
              <input className="inp" placeholder="Vendor ID" value={form.vendor} onChange={e => setForm({...form, vendor: e.target.value})} />
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label className="lbl" style={{ display: 'block', marginBottom: 8 }}>Driver Active</label>
            <div className="toggle-wrap">
              <button className={`toggle${form.isActive ? '' : ' off'}`} onClick={() => setForm({...form, isActive: !form.isActive})}>
                <div className="toggle-knob" />
              </button>
              <span style={{ fontSize: 12, fontWeight: 500, color: form.isActive ? 'var(--blue)' : 'var(--g400)' }}>
                {form.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, paddingTop: 12, borderTop: '1px solid var(--g100)' }}>
            <button className="btn" onClick={handleClose}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSaveStd}>Create Driver</button>
          </div>
        </div>
      )}

      {/* WORKFLOW TAB - Form */}
      {tab === 1 && !wfStep && (
        <div style={{ padding: 20 }}>
          <div style={{ background: 'var(--bl)', border: '1px solid var(--bb)', borderRadius: 'var(--r)', padding: '10px 14px', fontSize: 12, color: 'var(--blue)', marginBottom: 16 }}>
            The workflow will automatically: validate input → create user account → create driver record → execute webhook.
          </div>

          <div className="fg fg-2">
            <div className="field">
              <label className="lbl">First Name<span className="lbl-req">*</span></label>
              <input className="inp" placeholder="John" value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})} />
            </div>
            <div className="field">
              <label className="lbl">Last Name<span className="lbl-req">*</span></label>
              <input className="inp" placeholder="Doe" value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})} />
            </div>
            <div className="field">
              <label className="lbl">Phone<span className="lbl-req">*</span></label>
              <input className="inp" placeholder="+91 99999 99999" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
            </div>
            <div className="field">
              <label className="lbl">Email</label>
              <input className="inp" type="email" placeholder="driver@example.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, paddingTop: 12, borderTop: '1px solid var(--g100)' }}>
            <button className="btn" onClick={handleClose}>Cancel</button>
            <button className="btn btn-primary" onClick={startWorkflow}>Start Workflow</button>
          </div>
        </div>
      )}

      {/* WORKFLOW PROGRESS */}
      {wfStep && (
        <div style={{ padding: 20 }}>
          {/* Steps bar */}
          <div className="wf-steps-bar">
            {WORKFLOW_STEPS.map((s, i) => {
              const stepNum = i + 1;
              const isDone   = wfStep === 'done' || stepNum < wfActive;
              const isActive = wfStep !== 'done' && stepNum === wfActive;
              return (
                <div key={i} className={`wf-step${isDone ? ' done' : isActive ? ' active' : ''}`}>
                  <div className="wf-step-circle">{isDone ? '✓' : stepNum}</div>
                  <div className="wf-step-label">{s.label}</div>
                </div>
              );
            })}
          </div>

          {/* Step blocks */}
          {WORKFLOW_STEPS.slice(1).map((s, i) => {
            const blockNum  = i + 2;
            const isDone    = wfStep === 'done' || blockNum < wfActive;
            const isRunning = wfStep !== 'done' && blockNum === wfActive;
            const isPending = blockNum > wfActive;

            return (
              <div key={i} className={`wf-block${isRunning ? ' running' : isDone ? ' done' : ''}`}>
                <div className="wf-block-head">
                  <div className="wf-block-title">{s.label}</div>
                  <span className={`badge ${isDone ? 'badge-green' : isRunning ? 'badge-blue' : 'badge-gray'}`}>
                    {isDone ? 'Success' : isRunning ? 'Running' : 'Pending'}
                  </span>
                </div>
              </div>
            );
          })}

          {wfStep === 'done' && (
            <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-success" onClick={finishWorkflow}>✓ Complete — View Driver</button>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}

function UserSearchPanel({ onSelect }) {
  const [searchTab, setSearchTab] = useState(0);
  const [query, setQuery] = useState('');

  return (
    <div style={{ marginTop: 8, background: 'var(--g50)', border: '1px solid var(--g200)', borderRadius: 'var(--r)', overflow: 'hidden' }}>
      <div style={{ display: 'flex', borderBottom: '1px solid var(--g200)', background: 'var(--w)' }}>
        {['Search Existing', 'Create New'].map((t, i) => (
          <div key={i} className={`ctab${searchTab === i ? ' on' : ''}`} onClick={() => setSearchTab(i)}
            style={{ padding: '8px 14px', fontSize: 12, fontWeight: 500, cursor: 'pointer', color: searchTab === i ? 'var(--blue)' : 'var(--g400)', borderBottom: `2px solid ${searchTab === i ? 'var(--blue)' : 'transparent'}`, transition: 'all .15s' }}>
            {t}
          </div>
        ))}
      </div>

      {searchTab === 0 && (
        <div style={{ padding: 12 }}>
          <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
            <input className="inp" placeholder="Search by name or ID..." value={query} onChange={e => setQuery(e.target.value)} style={{ flex: 1 }} />
            <button className="btn btn-sm">Search</button>
          </div>
          <div style={{ fontSize: 11, color: 'var(--g400)', textAlign: 'center', padding: '12px 0' }}>
            Enter a name or user ID to search existing users
          </div>
        </div>
      )}

      {searchTab === 1 && (
        <div style={{ padding: 12 }}>
          <div className="fg fg-2" style={{ marginBottom: 8 }}>
            <input className="inp" placeholder="First name" />
            <input className="inp" placeholder="Last name" />
          </div>
          <input className="inp" placeholder="Phone" style={{ marginBottom: 8 }} />
          <button className="btn btn-primary btn-sm" onClick={() => onSelect({ id: 'USR' + Math.floor(Math.random()*99999), name: 'New User' })}>
            Create & Link
          </button>
        </div>
      )}
    </div>
  );
}
