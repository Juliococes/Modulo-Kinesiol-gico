/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { 
  User, Phone, Mail, FileText, Calendar, Clipboard, 
  ChevronRight, Plus, Save, Activity, AlertCircle, 
  ArrowLeft, Upload, UserCheck, History, Info,
  Search, MoreVertical, Download, X, Baby, UserRound, 
  Accessibility, LogIn, ShieldCheck, Database, Link as LinkIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Dialog } from '@base-ui/react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { cn } from '../lib/utils';

// --- TYPES & CONSTANTS ---

type ZoneStatus = 'No pain' | 'Mild pain' | 'Moderate pain' | 'Severe pain' | 'Injury' | 'Recovery';
type Gender = 'Masculino' | 'Femenino';
type AgeGroup = 'Niño' | 'Adulto' | 'Adulto Mayor';

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
  gender: Gender;
  ageGroup: AgeGroup;
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

const ZONES = [
  'Cabeza', 'Cuello', 
  'Hombro D', 'Hombro I', 
  'Pecho D', 'Pecho I', 
  'Abdomen D', 'Abdomen I', 
  'Pelvis', 
  'Brazo D', 'Brazo I', 
  'Antebrazo D', 'Antebrazo I', 
  'Mano D', 'Mano I',
  'Muslo D', 'Muslo I', 
  'Rodilla D', 'Rodilla I', 
  'Pantorrilla D', 'Pantorrilla I', 
  'Pie D', 'Pie I'
];

const STATUS_CONFIG: Record<ZoneStatus, { color: string; bg: string; border: string; dot: string }> = {
  'No pain': { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', dot: '#10B981' },
  'Mild pain': { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', dot: '#F59E0B' },
  'Moderate pain': { color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20', dot: '#F97316' },
  'Severe pain': { color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20', dot: '#EF4444' },
  'Injury': { color: 'text-white', bg: 'bg-rose-600', border: 'border-rose-700', dot: '#EF4444' },
  'Recovery': { color: 'text-teal-400', bg: 'bg-teal-500/10', border: 'border-teal-500/20', dot: '#14B8A6' },
};

const INITIAL_PATIENT: Patient = {
  id: '20.456.789-K',
  name: 'Alejandro Vargas Soto',
  age: 42,
  gender: 'Masculino',
  ageGroup: 'Adulto',
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
      zones: { 'Abdomen D': 'Moderate pain', 'Rodilla I': 'Mild pain' },
      metrics: { pain: 6, mobility: 'medium', strength: 'medium' },
      notes: 'Primera evaluación. Dolor localizado en zona lumbar baja/abdomen posterior.',
      changes: [
        { zone: 'Abdomen D', from: 'None', to: 'Moderate pain' },
        { zone: 'Rodilla I', from: 'None', to: 'Mild pain' }
      ],
      files: []
    }
  ]
};

// --- COMPONENTS ---

const ConnectProviderModal = ({ isOpen, onOpenChange }: { isOpen: boolean; onOpenChange: (open: boolean) => void }) => {
  const [step, setStep] = useState<'initial' | 'connecting' | 'success'>('initial');

  const handleConnect = () => {
    setStep('connecting');
    setTimeout(() => {
      setStep('success');
      setTimeout(() => {
        onOpenChange(false);
        setStep('initial');
      }, 1500);
    }, 2000);
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 animate-in fade-in duration-300" />
        <Dialog.Popup className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-[#121212] border border-white/10 rounded-xl p-6 shadow-2xl z-50 animate-in zoom-in-95 duration-300">
          <div className="flex flex-col items-center text-center">
            {step === 'initial' && (
              <>
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <ShieldCheck className="text-primary w-8 h-8" />
                </div>
                <Dialog.Title className="text-xl font-bold text-white mb-2">Conectar Proveedor de Salud</Dialog.Title>
                <Dialog.Description className="text-white/70 mb-6">
                  Sincroniza los datos clínicos del paciente con sistemas externos de forma segura.
                </Dialog.Description>
                <div className="w-full space-y-3">
                  <Button onClick={handleConnect} className="w-full bg-primary hover:bg-secondary text-white py-6 rounded-lg font-bold">
                    <LogIn className="mr-2 w-4 h-4" /> Iniciar Sincronización
                  </Button>
                  <Dialog.Close asChild>
                    <Button variant="ghost" className="w-full text-white/50 hover:text-white">Cancelar</Button>
                  </Dialog.Close>
                </div>
              </>
            )}

            {step === 'connecting' && (
              <div className="py-12 flex flex-col items-center">
                <div className="relative w-20 h-20 mb-6">
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="absolute inset-0 border-4 border-primary/20 border-t-primary rounded-full"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Database className="text-primary w-8 h-8" />
                  </div>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Estableciendo Conexión...</h3>
                <p className="text-white/50 text-sm">Verificando credenciales y permisos de acceso.</p>
              </div>
            )}

            {step === 'success' && (
              <div className="py-12 flex flex-col items-center">
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6"
                >
                  <UserCheck className="text-emerald-500 w-10 h-10" />
                </motion.div>
                <h3 className="text-lg font-bold text-white mb-2">Conexión Exitosa</h3>
                <p className="text-white/50 text-sm">Los datos han sido sincronizados correctamente.</p>
              </div>
            )}
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

const BodyMap = ({ 
  selectedZone, 
  onZoneClick, 
  zoneStatuses,
  gender,
  ageGroup
}: { 
  selectedZone: string | null; 
  onZoneClick: (zone: string) => void; 
  zoneStatuses: Record<string, ZoneStatus>;
  gender: Gender;
  ageGroup: AgeGroup;
}) => {
  const [viewSide, setViewSide] = useState<'Frente' | 'Espalda'>('Frente');

  // Siluetas mejoradas con proporciones humanas reales
  const getSilhouette = () => {
    const isBack = viewSide === 'Espalda';
    
    // Path base para un cuerpo humano estilizado pero anatómico
    // Cabeza (Círculo/Ovalo)
    const head = "M50,10 c-4,0-7,3-7,7 c0,4,3,7,7,7 s7-3,7-7 C57,13,54,10,50,10";
    
    // Cuerpo (Tronco y extremidades)
    let body = "";
    if (gender === 'Masculino') {
      body = "M43,26 c-2,0-4,1-5,3 c-6,6-18,8-25,12 c-4,2-6,5-6,9 v35 c0,4,3,8,7,9 l15,4 c2,1,5,0,6-3 l1-15 c1,18,12,35,22,45 l2,100 c0,8,4,12,10,12 h12 c6,0,10-4,10-12 l2-100 c10-10,21-27,22-45 l1,20 l2,20 c1,4,5,5,8,4 l20-5 c5-1,9-6,9-11 v-40 c0-5-3-9-8-12 c-8-5-22-7-30-15 c-2-3-6-5-10-5 Z";
    } else {
      // Femenino: Cintura más estrecha, caderas más anchas
      body = "M44,25 c-3,0-6,1-8,4 c-5,6-15,8-22,12 c-4,2-6,5-6,9 v35 c0,4,3,8,7,9 l15,4 c2,1,5,0,6-3 l1-15 c1,15,10,25,18,32 l2,90 c0,6,3,10,8,10 h10 c5,0,8-4,8-10 l2-90 c8-7,17-17,18-32 l1,15 l2,15 c1,3,4,4,6,3 l15-4 c4-1,7-5,7-9 v-35 c0-4-2-7-6-9 c-7-4-17-6-22-12 c-2-3-5-4-8-4 Z";
    }

    if (ageGroup === 'Niño') {
      // Niño: Proporciones más cortas, cabeza más grande
      return "M50,15 c-6,0-10,4-10,10 c0,6,4,10,10,10 s10-4,10-10 C60,19,56,15,50,15 M42,38 c-3,0-6,2-8,5 c-4,6-10,8-15,10 c-3,1-5,4-5,8 v25 c0,4,2,7,5,8 l10,3 c2,1,4,0,5-2 l1-10 l2,45 c0,8,3,15,8,18 l1,65 c0,5,2,8,6,8 h8 c4,0,6-3,6-8 l1-65 c5-3,8-10,8-18 l2-45 l1,10 c1,2,3,3,5,2 l10-3 c3-1,5-4,5-8 v-25 c0-4-2-7-5-8 c-5-2-11-4-15-10 c-2-3-5-5-8-5 Z";
    }

    return `${head} ${body}`;
  };

  const positions: Record<string, { x: number; y: number }> = {
    'Cabeza': { x: 50, y: 17 },
    'Cuello': { x: 50, y: 30 },
    'Hombro D': { x: 32, y: 40 },
    'Hombro I': { x: 68, y: 40 },
    'Pecho D': { x: 40, y: 55 },
    'Pecho I': { x: 60, y: 55 },
    'Abdomen D': { x: 42, y: 85 },
    'Abdomen I': { x: 58, y: 85 },
    'Pelvis': { x: 50, y: 115 },
    'Brazo D': { x: 22, y: 75 },
    'Brazo I': { x: 78, y: 75 },
    'Antebrazo D': { x: 18, y: 110 },
    'Antebrazo I': { x: 82, y: 110 },
    'Mano D': { x: 15, y: 145 },
    'Mano I': { x: 85, y: 145 },
    'Muslo D': { x: 40, y: 150 },
    'Muslo I': { x: 60, y: 150 },
    'Rodilla D': { x: 40, y: 185 },
    'Rodilla I': { x: 60, y: 185 },
    'Pantorrilla D': { x: 40, y: 215 },
    'Pantorrilla I': { x: 60, y: 215 },
    'Pie D': { x: 38, y: 245 },
    'Pie I': { x: 62, y: 245 },
  };

  const adjustedPositions = ageGroup === 'Niño' ? Object.fromEntries(
    Object.entries(positions).map(([k, v]) => [k, { x: v.x, y: v.y * 0.85 + 10 }])
  ) : positions;

  return (
    <Card className="bg-[#121212] border-white/5 shadow-2xl overflow-hidden relative group">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xs uppercase tracking-widest text-white/50">Mapa de Evaluación Visual</CardTitle>
          <div className="flex gap-1 bg-white/5 p-1 rounded-lg">
            {(['Frente', 'Espalda'] as const).map(side => (
              <button
                key={side}
                onClick={() => setViewSide(side)}
                className={cn(
                  "px-3 py-1 text-[10px] font-bold rounded-md transition-all",
                  viewSide === side ? "bg-primary text-white shadow-lg" : "text-white/30 hover:text-white/60"
                )}
              >
                {side}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex flex-col items-center justify-center p-8">
        <div className="relative">
          <svg viewBox="0 0 100 260" className="h-[480px] w-[240px] drop-shadow-[0_0_30px_rgba(22,114,114,0.1)]">
            <path 
              d={getSilhouette()} 
              fill="#1a1a1a" 
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="1"
              className="transition-all duration-500"
            />
            
            {ZONES.map((zone) => {
              const pos = adjustedPositions[zone];
              if (!pos) return null;
              
              let displayX = pos.x;
              if (viewSide === 'Espalda') {
                if (zone.endsWith(' D')) displayX = 100 - pos.x;
                if (zone.endsWith(' I')) displayX = 100 - pos.x;
              }

              const isActive = selectedZone === zone;
              const status = zoneStatuses[zone];
              const dotColor = status ? STATUS_CONFIG[status].dot : '#167272';

              return (
                <g key={zone} onClick={() => onZoneClick(zone)} className="cursor-pointer">
                  <motion.circle 
                    cx={displayX} cy={pos.y} 
                    initial={false}
                    animate={{ 
                      r: isActive ? 5 : 3.5,
                      fill: status ? dotColor : (isActive ? '#167272' : 'rgba(255,255,255,0.2)'),
                      stroke: isActive ? '#FFFFFF' : 'transparent',
                      strokeWidth: isActive ? 1.5 : 0
                    }}
                    whileHover={{ r: 5, fill: '#167272' }}
                    className="transition-colors duration-200"
                  />
                  {isActive && (
                    <g className="pointer-events-none">
                      <rect 
                        x={displayX > 50 ? displayX - 60 : displayX + 10} 
                        y={pos.y - 10} 
                        width="50" height="20" rx="6" 
                        fill="#167272" 
                        className="shadow-xl" 
                      />
                      <text 
                        x={displayX > 50 ? displayX - 35 : displayX + 35} 
                        y={pos.y + 3} 
                        fontSize="6" 
                        fontWeight="bold" 
                        fill="white" 
                        textAnchor="middle"
                        className="uppercase tracking-wider"
                      >
                        {zone}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-3 text-[10px] text-white/40 font-bold uppercase tracking-widest">
          <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-teal-500 shadow-[0_0_8px_rgba(20,184,166,0.5)]"></span> Recuperación</span>
          <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]"></span> Leve</span>
          <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"></span> Severo</span>
          <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-white/20"></span> Sin Hallazgos</span>
        </div>
      </CardContent>
    </Card>
  );
};

// --- MAIN APP ---

export default function App() {
  const [view, setView] = useState<'profile' | 'session'>('session');
  const [patient, setPatient] = useState<Patient>(INITIAL_PATIENT);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  
  // New Session State
  const [currentSession, setCurrentSession] = useState<Omit<Session, 'id'>>({
    date: new Date().toLocaleDateString('es-CL', { month: 'long', day: 'numeric', year: 'numeric' }),
    practitioner: 'Dr. Lucas Vance',
    zones: {},
    metrics: { pain: 5, mobility: 'medium', strength: 'medium' },
    notes: 'Paciente refiere dolor focal en zona lumbar al realizar flexo-extensión. Mejora significativa en estabilidad de rodilla izquierda respecto a sesión anterior.',
    changes: [
      { zone: 'Abdomen D', from: 'Mild pain' as any, to: 'Severe pain' as any },
      { zone: 'Rodilla I', from: 'Injury' as any, to: 'Recovery' as any }
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
    setView('profile');
  };

  return (
    <div className="h-screen w-full flex overflow-hidden bg-background">
      
      {/* Sidebar */}
      <aside className="w-[340px] border-r border-white/5 bg-[#0A0A0A] h-full flex flex-col overflow-y-auto">
        <div className="p-8 border-b border-white/5">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shadow-[0_0_20px_rgba(22,114,114,0.3)]">
              <Activity className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white leading-tight">SurGira</h1>
              <p className="text-xs text-white/50 font-medium uppercase tracking-widest">Kinesis Pro</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label>Paciente</label>
              <h2 className="text-xl font-bold text-white mt-1">{patient.name}</h2>
              <p className="text-xs text-white/40 mt-1 font-mono">{patient.id}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label>Edad</label>
                <p className="text-sm font-semibold text-white">{patient.age} años</p>
              </div>
              <div>
                <label>Previsión</label>
                <p className="text-sm font-semibold text-white">{patient.insurance}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-white/5">
              <Button 
                onClick={() => setIsConnectModalOpen(true)}
                className="w-full bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-lg py-6"
              >
                <LinkIcon className="mr-2 w-4 h-4 text-primary" /> Conectar Proveedor
              </Button>
            </div>
          </div>
        </div>

        <div className="p-8 border-b border-white/5">
          <label className="mb-3 block">Condiciones Médicas</label>
          <div className="bg-white/5 rounded-xl p-4 border border-white/5">
            <p className="text-sm leading-relaxed text-white/80">{patient.conditions}</p>
          </div>
        </div>

        <div className="p-8 flex-1">
          <div className="flex justify-between items-center mb-4">
            <label>Historial</label>
            <History className="w-4 h-4 text-white/30" />
          </div>
          <div className="space-y-3">
            {patient.sessions.map(s => (
              <div key={s.id} className="group flex justify-between items-center p-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer border border-transparent hover:border-white/5">
                <div>
                  <p className="text-sm font-bold text-white">{s.date}</p>
                  <p className="text-[10px] text-white/40 uppercase tracking-wider">{s.practitioner}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-primary transition-colors" />
              </div>
            ))}
          </div>
        </div>

        <div className="p-8 bg-primary/5 border-t border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
              <UserCheck className="text-primary w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Dr. Lucas Vance</p>
              <p className="text-[10px] text-white/40 uppercase tracking-widest">Kinesiólogo Senior</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* Header */}
        <header className="p-8 border-b border-white/5 bg-[#0A0A0A]/50 backdrop-blur-md flex justify-between items-center z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              <h2 className="text-xs font-bold text-primary uppercase tracking-[0.2em]">Sesión en Curso</h2>
            </div>
            <h1 className="text-2xl font-bold text-white">Evaluación de Condición Física</h1>
          </div>
          <div className="flex gap-4">
            <Button 
              variant="ghost"
              onClick={() => setView(view === 'profile' ? 'session' : 'profile')}
              className="text-white/60 hover:text-white hover:bg-white/5"
            >
              {view === 'profile' ? 'Volver a Sesión' : 'Ver Perfil Completo'}
            </Button>
            <Button className="bg-primary hover:bg-secondary text-white px-8 py-6 rounded-lg font-bold shadow-[0_0_20px_rgba(22,114,114,0.2)]">
              Finalizar Sesión
            </Button>
          </div>
        </header>

        {/* Assessment Area */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 max-w-[1600px] mx-auto">
            
            {/* Body Map Container */}
            <div className="xl:col-span-5 relative">
              <BodyMap 
                selectedZone={selectedZone}
                onZoneClick={setSelectedZone}
                zoneStatuses={{ ...lastSession?.zones, ...currentSession.zones }}
                gender={patient.gender}
                ageGroup={patient.ageGroup}
              />
              
              <AnimatePresence>
                {selectedZone && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="absolute inset-x-8 bottom-8 bg-[#121212]/95 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-3xl z-20"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <p className="text-[10px] text-primary font-bold uppercase tracking-widest mb-1">Definir Estado</p>
                        <h3 className="text-lg font-bold text-white">{selectedZone}</h3>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => setSelectedZone(null)} className="text-white/30 hover:text-white">
                        <X size={20} />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {(Object.keys(STATUS_CONFIG) as ZoneStatus[]).map(status => (
                        <button
                          key={status}
                          onClick={() => handleZoneStatusChange(status)}
                          className={cn(
                            "text-[11px] font-bold py-3 px-4 rounded-xl border transition-all uppercase tracking-wider text-center",
                            STATUS_CONFIG[status].bg,
                            STATUS_CONFIG[status].color,
                            STATUS_CONFIG[status].border,
                            "hover:brightness-125"
                          )}
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
            <div className="xl:col-span-7 flex flex-col gap-8">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Pain Scale Card */}
                <Card className="bg-[#121212] border-white/5">
                  <CardHeader>
                    <CardTitle className="text-xs uppercase tracking-widest text-white/50">Escala de Dolor (EVA)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between gap-1">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(val => (
                        <button
                          key={val}
                          onClick={() => setCurrentSession({...currentSession, metrics: {...currentSession.metrics, pain: val}})}
                          className={cn(
                            "flex-1 aspect-square rounded-lg flex items-center justify-center text-xs font-bold border transition-all",
                            currentSession.metrics.pain === val 
                              ? "bg-primary text-white border-primary shadow-[0_0_15px_rgba(22,114,114,0.4)]" 
                              : "bg-white/5 text-white/40 border-white/5 hover:border-white/20 hover:text-white"
                          )}
                        >
                          {val}
                        </button>
                      ))}
                    </div>
                    <div className="flex justify-between mt-4 text-[10px] font-bold text-white/30 uppercase tracking-tighter">
                      <span>Sin Dolor</span>
                      <span>Dolor Extremo</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Functional Metrics Card */}
                <Card className="bg-[#121212] border-white/5">
                  <CardHeader>
                    <CardTitle className="text-xs uppercase tracking-widest text-white/50">Métricas Funcionales</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <label className="mb-3 block">Movilidad</label>
                      <div className="flex gap-2">
                        {['Baja', 'Media', 'Alta'].map(lvl => (
                          <button
                            key={lvl}
                            onClick={() => setCurrentSession({...currentSession, metrics: {...currentSession.metrics, mobility: lvl.toLowerCase() as any}})}
                            className={cn(
                              "flex-1 py-3 rounded-xl text-xs font-bold border transition-all",
                              currentSession.metrics.mobility === lvl.toLowerCase() 
                                ? "bg-primary text-white border-primary" 
                                : "bg-white/5 text-white/40 border-white/5 hover:bg-white/10"
                            )}
                          >
                            {lvl}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="mb-3 block">Fuerza</label>
                      <div className="flex gap-2">
                        {['Baja', 'Media', 'Alta'].map(lvl => (
                          <button
                            key={lvl}
                            onClick={() => setCurrentSession({...currentSession, metrics: {...currentSession.metrics, strength: lvl.toLowerCase() as any}})}
                            className={cn(
                              "flex-1 py-3 rounded-xl text-xs font-bold border transition-all",
                              currentSession.metrics.strength === lvl.toLowerCase() 
                                ? "bg-primary text-white border-primary" 
                                : "bg-white/5 text-white/40 border-white/5 hover:bg-white/10"
                            )}
                          >
                            {lvl}
                          </button>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Session Notes Card */}
              <Card className="bg-[#121212] border-white/5 flex-1">
                <CardHeader>
                  <CardTitle className="text-xs uppercase tracking-widest text-white/50">Observaciones Clínicas</CardTitle>
                </CardHeader>
                <CardContent>
                  <textarea 
                    placeholder="Ingrese hallazgos clínicos detallados..."
                    className="w-full h-40 bg-white/5 border border-white/5 rounded-xl p-6 text-sm outline-none focus:border-primary/50 transition-all resize-none text-white/90 font-medium leading-relaxed placeholder:text-white/20"
                    value={currentSession.notes}
                    onChange={(e) => setCurrentSession({...currentSession, notes: e.target.value})}
                  />
                </CardContent>
              </Card>

              {/* Changes Panel */}
              <Card className="bg-primary/5 border-primary/10">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs uppercase tracking-widest text-primary">Registro de Cambios</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentSession.changes.map((change, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/5">
                        <div className="w-2 h-2 rounded-full bg-primary"></div>
                        <div className="flex-1">
                          <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider">{change.zone}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-white/60">{change.from}</span>
                            <ChevronRight className="w-3 h-3 text-white/20" />
                            <span className={cn(
                              "text-xs font-bold",
                              change.to.includes('Severe') ? "text-rose-400" : "text-teal-400"
                            )}>
                              {change.to}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <footer className="p-8 border-t border-white/5 bg-[#0A0A0A] flex justify-end gap-4">
          <Button variant="ghost" className="px-8 py-6 text-white/40 hover:text-white hover:bg-white/5">
            Descartar Cambios
          </Button>
          <Button 
            onClick={handleSaveSession}
            className="px-12 py-6 bg-primary hover:bg-secondary text-white rounded-lg font-bold shadow-xl"
          >
            Guardar y Finalizar
          </Button>
        </footer>
      </main>

      <ConnectProviderModal isOpen={isConnectModalOpen} onOpenChange={setIsConnectModalOpen} />
    </div>
  );
}
