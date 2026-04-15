/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  User, Phone, Mail, FileText, Calendar, Clipboard, 
  ChevronRight, Plus, Save, Activity, AlertCircle, 
  ArrowLeft, Upload, UserCheck, History, Info,
  Search, MoreVertical, Download, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- TYPES & CONSTANTS ---

type ZoneStatus = 'No pain' | 'Mild pain' | 'Moderate pain' | 'Severe pain' | 'Injury' | 'Recovery';

interface Session {
  id: string;
  date: string;
  practitioner: string;
  zones: Record<string, ZoneStatus>;
  metrics: {
    pain: number;
    mobility: 'low' | 'medium' | 'high';
    strength: 'low' | 'medium' | 'high';
  };
  notes: string;
  changes: Array<{
    zone: string;
    from: ZoneStatus | 'None';
    to: ZoneStatus;
  }>;
  files: Array<{ name: string; type: string }>;
}

interface Patient {
  id: string;
  name: string;
  age: number;
  phone: string;
  email: string;
  insurance: string;
  conditions: string;
  notes: string;
  responsible?: {
    name: string;
    relationship: string;
    phone: string;
  };
  files: Array<{ name: string; date: string; type: string }>;
  sessions: Session[];
}

const ZONES = ['Neck', 'Shoulders', 'Back', 'Hips', 'Knees', 'Ankles'];

const STATUS_CONFIG: Record<ZoneStatus, { color: string; bg: string; border: string; dot: string }> = {
  'No pain': { color: 'text-green-700', bg: 'bg-green-100', border: 'border-green-200', dot: 'bg-accent-green' },
  'Mild pain': { color: 'text-yellow-700', bg: 'bg-yellow-100', border: 'border-yellow-200', dot: 'bg-accent-orange' },
  'Moderate pain': { color: 'text-orange-700', bg: 'bg-orange-100', border: 'border-orange-200', dot: 'bg-accent-orange' },
  'Severe pain': { color: 'text-red-700', bg: 'bg-red-100', border: 'border-red-200', dot: 'bg-accent-red' },
  'Injury': { color: 'text-white', bg: 'bg-red-600', border: 'border-red-700', dot: 'bg-accent-red' },
  'Recovery': { color: 'text-blue-700', bg: 'bg-blue-100', border: 'border-blue-200', dot: 'bg-accent-green' },
};

const INITIAL_PATIENT: Patient = {
  id: '20.456.789-K',
  name: 'Alejandro Vargas Soto',
  age: 42,
  phone: '+56 9 8877 6655',
  email: 'a.vargas@email.cl',
  insurance: 'Isapre Banmédica',
  conditions: 'Lumbalgia crónica, Tendinopatía rotuliana izquierda.',
  notes: 'Paciente deportista (running). Prefiere sesiones matutinas.',
  responsible: {
    name: 'Carolina Paz',
    relationship: 'Cónyuge',
    phone: '+56 9 1122 3344'
  },
  files: [
    { name: 'Resonancia_Lumbar_2023.pdf', date: '2023-11-12', type: 'pdf' },
    { name: 'Eco_Rodilla_Izquierda.jpg', date: '2024-01-05', type: 'image' }
  ],
  sessions: [
    {
      id: 'sess_1',
      date: '2024-03-15',
      practitioner: 'Klg. Roberto Méndez',
      zones: { 'Back': 'Moderate pain', 'Knees': 'Mild pain' },
      metrics: { pain: 6, mobility: 'medium', strength: 'medium' },
      notes: 'Primera evaluación. Dolor localizado en L4-L5.',
      changes: [
        { zone: 'Back', from: 'None', to: 'Moderate pain' },
        { zone: 'Knees', from: 'None', to: 'Mild pain' }
      ],
      files: []
    }
  ]
};

// --- STYLED COMPONENTS ---

const SectionTitle = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <h2 className={`text-[11px] uppercase tracking-[0.05em] text-text-muted font-bold mb-3 ${className}`}>
    {children}
  </h2>
);

const BodyMap = ({ 
  selectedZone, 
  onZoneClick, 
  zoneStatuses,
}: { 
  selectedZone: string | null; 
  onZoneClick: (zone: string) => void; 
  zoneStatuses: Record<string, ZoneStatus>;
}) => {
  return (
    <div className="relative w-full h-[420px] bg-white rounded-xl border border-border-theme flex flex-col items-center justify-center p-5">
      <SectionTitle className="absolute top-5 left-5">Visual Assessment Map</SectionTitle>
      
      <svg viewBox="0 0 100 200" className="h-[380px] w-[180px]">
        <path 
          d="M50,10 c-5,0-10,4-10,10 c0,6,5,10,10,10 s10-4,10-10 C60,14,55,10,50,10 M40,30 l-10,5 c-5,2-5,10-5,10 v40 l5,80 l10,30 h20 l10,-30 l5,-80 v-40 c0,0,0,-8,-5,-10 l-10,-5 Z" 
          fill="#e2e8f0" 
        />
        
        {ZONES.map((zone) => {
          const positions: Record<string, { x: number; y: number }> = {
            'Neck': { x: 50, y: 35 },
            'Shoulders': { x: 35, y: 55 },
            'Back': { x: 50, y: 85 },
            'Hips': { x: 50, y: 120 },
            'Knees': { x: 50, y: 165 },
            'Ankles': { x: 50, y: 190 },
          };
          
          const pos = positions[zone];
          const isActive = selectedZone === zone;
          const status = zoneStatuses[zone];
          const dotColor = status ? (STATUS_CONFIG[status].dot === 'bg-accent-red' ? '#ef4444' : STATUS_CONFIG[status].dot === 'bg-accent-orange' ? '#f59e0b' : '#22c55e') : '#2563eb';

          return (
            <g key={zone} onClick={() => onZoneClick(zone)} className="cursor-pointer">
              <circle 
                cx={pos.x} cy={pos.y} r="4" 
                fill={status ? dotColor : '#2563eb'} 
                stroke="white" 
                strokeWidth="1.5"
                className={`transition-all duration-300 ${isActive ? 'r-6 stroke-[2px]' : ''}`}
                style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
              />
              {isActive && (
                <g>
                  <rect x={pos.x + 8} y={pos.y - 8} width="40" height="16" rx="4" fill="rgba(255,255,255,0.8)" />
                  <text x={pos.x + 12} y={pos.y + 4} fontSize="6" fontWeight="700" fill="#2563eb">{zone}</text>
                </g>
              )}
            </g>
          );
        })}
      </svg>
      
      <div className="mt-5 flex gap-4 text-[10px] text-text-muted">
        <span className="flex items-center gap-1"><span className="text-accent-green">●</span> Recovery</span>
        <span className="flex items-center gap-1"><span className="text-accent-orange">●</span> Mild</span>
        <span className="flex items-center gap-1"><span className="text-accent-red">●</span> Severe</span>
      </div>
    </div>
  );
};

export default function App() {
  const [view, setView] = useState<'profile' | 'session'>('session'); // Default to session to match theme preview
  const [patient, setPatient] = useState<Patient>(INITIAL_PATIENT);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

  // New Session State
  const [currentSession, setCurrentSession] = useState<Omit<Session, 'id'>>({
    date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    practitioner: 'Dr. Lucas Vance',
    zones: {},
    metrics: { pain: 5, mobility: 'medium', strength: 'medium' },
    notes: 'Patient reporting focal pain in the lumbar region when performing flexo-extension. Significant improvement in left knee stability compared to last session.',
    changes: [
      { zone: 'Lower Back', from: 'Mild pain' as any, to: 'Severe pain' as any },
      { zone: 'Left Knee', from: 'Injury' as any, to: 'Recovery' as any },
      { zone: 'Neck', from: 'Mild pain' as any, to: 'Mild pain' as any }
    ],
    files: []
  });
  const [selectedZone, setSelectedZone] = useState<string | null>(null);

  const lastSession = useMemo(() => patient.sessions[0], [patient.sessions]);

  const handleZoneStatusChange = (status: ZoneStatus) => {
    if (!selectedZone) return;
    const prevStatus = currentSession.zones[selectedZone] || lastSession?.zones[selectedZone] || 'None';
    
    setCurrentSession(prev => {
      const newZones = { ...prev.zones, [selectedZone]: status };
      const existingChangeIdx = prev.changes.findIndex(c => c.zone === selectedZone);
      const newChanges = [...prev.changes];
      
      if (status !== prevStatus) {
        if (existingChangeIdx > -1) {
          newChanges[existingChangeIdx] = { zone: selectedZone, from: prevStatus as any, to: status };
        } else {
          newChanges.push({ zone: selectedZone, from: prevStatus as any, to: status });
        }
      } else if (existingChangeIdx > -1) {
        newChanges.splice(existingChangeIdx, 1);
      }

      return { ...prev, zones: newZones, changes: newChanges };
    });
    setSelectedZone(null);
  };

  const handleSaveSession = () => {
    const newSession: Session = {
      ...currentSession,
      id: `sess_${Date.now()}`,
      date: new Date().toISOString().split('T')[0]
    };
    setPatient(prev => ({ ...prev, sessions: [newSession, ...prev.sessions] }));
    // Reset or navigate
  };

  return (
    <div className="h-screen w-full flex overflow-hidden bg-[#f1f5f9] font-sans text-text-main">
      
      {/* Sidebar */}
      <aside className="w-[320px] border-r border-border-theme bg-white h-full flex flex-col overflow-y-auto">
        <div className="p-6 border-b border-border-theme">
          <SectionTitle>Patient Profile</SectionTitle>
          <div className="grid grid-cols-2 gap-3 text-[13px]">
            <div className="flex flex-col">
              <label className="text-[10px] text-text-muted mb-0.5">Full Name</label>
              <span className="font-medium">{patient.name}</span>
            </div>
            <div className="flex flex-col">
              <label className="text-[10px] text-text-muted mb-0.5">Patient ID</label>
              <span className="font-medium">{patient.id}</span>
            </div>
            <div className="flex flex-col">
              <label className="text-[10px] text-text-muted mb-0.5">Age</label>
              <span className="font-medium">{patient.age} years</span>
            </div>
            <div className="flex flex-col">
              <label className="text-[10px] text-text-muted mb-0.5">Insurance</label>
              <span className="font-medium">{patient.insurance}</span>
            </div>
            <div className="flex flex-col">
              <label className="text-[10px] text-text-muted mb-0.5">Phone</label>
              <span className="font-medium">{patient.phone}</span>
            </div>
            <div className="flex flex-col">
              <label className="text-[10px] text-text-muted mb-0.5">Email</label>
              <span className="font-medium truncate">{patient.email}</span>
            </div>
          </div>
        </div>

        <div className="p-6 border-b border-border-theme">
          <SectionTitle>Medical Conditions</SectionTitle>
          <p className="text-[12px] leading-relaxed text-text-main">{patient.conditions}</p>
        </div>

        <div className="p-6 border-b border-border-theme flex-1">
          <SectionTitle>Session History</SectionTitle>
          <div className="space-y-0 text-[12px]">
            {patient.sessions.map(s => (
              <div key={s.id} className="flex justify-between py-2 border-b border-dashed border-border-theme last:border-none">
                <span className="font-medium">{s.date}</span>
                <span className="text-text-muted">{s.practitioner}</span>
              </div>
            ))}
          </div>
          <button className="w-full mt-4 py-2.5 bg-[#f1f5f9] text-text-main rounded-lg text-[12px] font-semibold hover:bg-slate-200 transition-colors">
            View Full History
          </button>
        </div>

        <div className="p-6">
          <SectionTitle>Files ({patient.files.length})</SectionTitle>
          <div className="text-[12px] text-primary space-y-1">
            {patient.files.map((f, i) => (
              <div key={i} className="flex items-center gap-1.5 cursor-pointer hover:underline">
                <FileText size={12} /> {f.name}
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* Header */}
        <header className="p-6 border-b border-border-theme bg-white flex justify-between items-center">
          <div>
            <h1 className="text-[20px] font-bold text-text-main">Active Assessment Session</h1>
            <p className="text-[13px] text-text-muted">
              Practitioner: <strong className="text-text-main">{currentSession.practitioner}</strong> • {currentSession.date}
            </p>
          </div>
          <button className="bg-primary text-white px-6 py-2.5 rounded-lg text-[14px] font-semibold hover:bg-blue-700 transition-all shadow-sm">
            + Start New Entry
          </button>
        </header>

        {/* Assessment Area */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
            
            {/* Body Map Container */}
            <div className="relative">
              <BodyMap 
                selectedZone={selectedZone}
                onZoneClick={setSelectedZone}
                zoneStatuses={{ ...lastSession?.zones, ...currentSession.zones }}
              />
              
              <AnimatePresence>
                {selectedZone && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="absolute inset-x-10 bottom-10 bg-white/95 backdrop-blur-sm p-5 rounded-xl border border-border-theme shadow-xl z-10"
                  >
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-[12px] font-bold text-text-main uppercase tracking-wider">Status: {selectedZone}</h3>
                      <button onClick={() => setSelectedZone(null)} className="text-text-muted hover:text-text-main"><X size={16} /></button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {(Object.keys(STATUS_CONFIG) as ZoneStatus[]).map(status => (
                        <button
                          key={status}
                          onClick={() => handleZoneStatusChange(status)}
                          className={`text-[10px] font-bold py-2 px-2 rounded-lg border transition-all uppercase tracking-tight ${STATUS_CONFIG[status].bg} ${STATUS_CONFIG[status].color} ${STATUS_CONFIG[status].border} hover:opacity-80`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Metrics Panel */}
            <div className="flex flex-col gap-5">
              
              {/* Pain Scale Card */}
              <div className="bg-white p-5 rounded-xl border border-border-theme">
                <SectionTitle>Pain Scale (VAS)</SectionTitle>
                <div className="flex justify-between mt-2.5">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(val => (
                    <button
                      key={val}
                      onClick={() => setCurrentSession({...currentSession, metrics: {...currentSession.metrics, pain: val}})}
                      className={`w-8 h-8 rounded-md flex items-center justify-center text-[12px] font-bold border transition-all ${currentSession.metrics.pain === val ? 'bg-primary text-white border-primary' : 'bg-white text-text-main border-border-theme hover:border-primary'}`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>

              {/* Functional Metrics Card */}
              <div className="bg-white p-5 rounded-xl border border-border-theme">
                <SectionTitle>Functional Metrics</SectionTitle>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-semibold text-text-main">Mobility</label>
                    <div className="flex gap-2 mt-2">
                      {['Low', 'Med', 'High'].map(lvl => (
                        <button
                          key={lvl}
                          onClick={() => setCurrentSession({...currentSession, metrics: {...currentSession.metrics, mobility: lvl.toLowerCase() as any}})}
                          className={`flex-1 py-2 border rounded-md text-[12px] font-medium transition-all ${currentSession.metrics.mobility === lvl.toLowerCase() ? 'bg-primary text-white border-primary' : 'bg-white text-text-main border-border-theme hover:bg-slate-50'}`}
                        >
                          {lvl}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-text-main">Strength</label>
                    <div className="flex gap-2 mt-2">
                      {['Low', 'Med', 'High'].map(lvl => (
                        <button
                          key={lvl}
                          onClick={() => setCurrentSession({...currentSession, metrics: {...currentSession.metrics, strength: lvl.toLowerCase() as any}})}
                          className={`flex-1 py-2 border rounded-md text-[12px] font-medium transition-all ${currentSession.metrics.strength === lvl.toLowerCase() ? 'bg-primary text-white border-primary' : 'bg-white text-text-main border-border-theme hover:bg-slate-50'}`}
                        >
                          {lvl}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Session Notes Card */}
              <div className="bg-white p-5 rounded-xl border border-border-theme">
                <SectionTitle>Session Notes</SectionTitle>
                <textarea 
                  placeholder="Enter clinical observations..."
                  className="w-full h-20 border border-border-theme rounded-md p-3 text-[13px] outline-none focus:border-primary transition-all resize-none mt-2"
                  value={currentSession.notes}
                  onChange={(e) => setCurrentSession({...currentSession, notes: e.target.value})}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Changes Panel */}
        <div className="p-6 bg-[#fffbeb] border-t border-[#fde68a]">
          <SectionTitle className="text-[#92400e] mb-2">Log of Changes (This Session)</SectionTitle>
          <div className="text-[12px] text-[#92400e] space-y-1">
            {currentSession.changes.map((change, idx) => (
              <div key={idx} className="flex gap-2 items-center">
                <span className="font-bold">● {change.zone}:</span> 
                <span>{change.from}</span>
                <span>&rarr;</span>
                <span className={change.to.includes('Severe') ? 'bg-[#fee2e2] text-accent-red px-1.5 py-0.5 rounded' : change.to.includes('Recovery') ? 'text-accent-green font-bold' : 'font-bold'}>
                  {change.to}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <footer className="p-5 px-6 border-t border-border-theme bg-white flex justify-end gap-3">
          <button className="px-6 py-2.5 bg-[#f1f5f9] text-text-main rounded-lg text-[14px] font-semibold hover:bg-slate-200 transition-all">
            Discard
          </button>
          <button 
            onClick={handleSaveSession}
            className="px-6 py-2.5 bg-primary text-white rounded-lg text-[14px] font-semibold hover:bg-blue-700 transition-all shadow-sm"
          >
            Save Session Data
          </button>
        </footer>
      </main>
    </div>
  );
}
