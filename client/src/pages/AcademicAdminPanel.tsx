import { useEffect, useRef, useState } from 'react';
import { BookOpen, Calendar, Check, Edit, GraduationCap, Plus, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import api from '@/lib/api';
import { toast } from 'sonner';

interface AcademicAdminPanelProps { initialTab?: string; }

export function AcademicAdminPanel({ initialTab }: AcademicAdminPanelProps) {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ startDate: '', endDate: '', status: 'inactive' });
  const sessionScrollerRef = useRef<HTMLDivElement>(null);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<'programs' | 'semesters' | 'modules'>('programs');
  const [programs, setPrograms] = useState<any[]>([]);
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(null);
  const [programLoading, setProgramLoading] = useState(false);
  const [programDialogOpen, setProgramDialogOpen] = useState(false);
  const [programForm, setProgramForm] = useState({ name: '', courseName: '', duration: '', status: 'active', description: '' });
  const [modules, setModules] = useState<any[]>([]);
  const [moduleLoading, setModuleLoading] = useState(false);
  const [moduleDialogOpen, setModuleDialogOpen] = useState(false);
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null);
  const [moduleForm, setModuleForm] = useState({ moduleCode: '', moduleName: '', moduleType: '' });
  const [semesters, setSemesters] = useState<any[]>([]);
  const [semesterLoading, setSemesterLoading] = useState(false);
  const [selectedSemesterId, setSelectedSemesterId] = useState<string | null>(null);
  const [semesterDialogOpen, setSemesterDialogOpen] = useState(false);
  const [editingSemesterId, setEditingSemesterId] = useState<string | null>(null);
  const [semesterForm, setSemesterForm] = useState({ semesterName: '', semesterNumber: '', startDate: '', endDate: '', status: 'active' });
  const [programSessionFilter, setProgramSessionFilter] = useState('all');
  const [semesterSessionFilter, setSemesterSessionFilter] = useState('all');
  const [semesterProgramFilter, setSemesterProgramFilter] = useState('all');
  const [moduleSessionFilter, setModuleSessionFilter] = useState('all');
  const [moduleProgramFilter, setModuleProgramFilter] = useState('all');
  const [moduleSemesterFilter, setModuleSemesterFilter] = useState('all');
  const [examinations, setExaminations] = useState<any[]>([]);
  const [examinationLoading, setExaminationLoading] = useState(false);
  const [examinationDialogOpen, setExaminationDialogOpen] = useState(false);
  const [examinationStep, setExaminationStep] = useState(1);
  const [selectedModuleIds, setSelectedModuleIds] = useState<string[]>([]);
  const [examinationModules, setExaminationModules] = useState<any[]>([]);
  const [examinationSchedule, setExaminationSchedule] = useState<any[]>([]);
  const [examinationFilters, setExaminationFilters] = useState({ sessionId: 'all', programId: 'all', semesterId: 'all', status: 'all' });
  const [examinationForm, setExaminationForm] = useState({ examinationName: '', examinationType: '', academicSessionId: '', programId: '', semesterId: '', startDate: '', endDate: '', description: '' });

  const fetchSessions = async () => {
    try {
      const response = await api.get('/operations/sessions');
      setSessions((response.data.data || []).sort((a: any, b: any) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()));
      const loadedSessions = response.data.data || [];
      const activeSession = loadedSessions.find((session: any) => session.status === 'active');
      setSelectedSessionId(current => current || activeSession?.id || loadedSessions[0]?.id || null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load academic sessions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSessions(); }, []);

  useEffect(() => {
    const scroller = sessionScrollerRef.current;
    const activeSession = scroller?.querySelector<HTMLElement>('[data-session-active="true"]');
    activeSession?.scrollIntoView({ behavior: 'auto', block: 'nearest', inline: 'nearest' });
  }, [sessions]);

  const fetchPrograms = async () => {
    if (!selectedSessionId) return;
    setProgramLoading(true);
    try {
      const response = await api.get('/operations/programs');
      setPrograms(response.data.data || []);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load programs');
    } finally {
      setProgramLoading(false);
    }
  };

  useEffect(() => { fetchPrograms(); }, [selectedSessionId]);

  useEffect(() => {
    const section = initialTab === 'academic-semesters' ? 'semesters' : initialTab === 'academic-modules' ? 'modules' : initialTab === 'academic-programs' ? 'programs' : 'programs';
    setActiveSection(section);
  }, [initialTab]);

  const displayedPrograms = programSessionFilter === 'all'
    ? programs
    : programs.filter(program => program.academicSessionId === programSessionFilter);

  const displaySession = (sessionId: string | null | undefined) => {
    const session = sessions.find(item => item.id === sessionId);
    return session ? `${new Date(session.startDate).getFullYear()} - ${new Date(session.endDate).getFullYear()}` : 'Unknown session';
  };

  const fetchExaminations = async () => {
    setExaminationLoading(true);
    try {
      const response = await api.get('/operations/examinations');
      setExaminations(response.data.data || []);
    } catch (error: any) { toast.error(error.response?.data?.message || 'Failed to load examinations'); }
    finally { setExaminationLoading(false); }
  };

  useEffect(() => { if (initialTab === 'academic-examination') fetchExaminations(); }, [initialTab]);

  const examinationPrograms = examinationForm.academicSessionId === '' ? programs : programs.filter(program => program.academicSessionId === examinationForm.academicSessionId);
  const examinationSemesters = semesters.filter(semester => (!examinationForm.programId || semester.programId === examinationForm.programId) && (!examinationForm.academicSessionId || semester.academicSessionId === examinationForm.academicSessionId));
  const filteredExaminations = examinations.filter(examination => (examinationFilters.sessionId === 'all' || examination.academicSessionId === examinationFilters.sessionId) && (examinationFilters.programId === 'all' || examination.programId === examinationFilters.programId) && (examinationFilters.semesterId === 'all' || examination.semesterId === examinationFilters.semesterId) && (examinationFilters.status === 'all' || examination.status === examinationFilters.status));

  const openExaminationDialog = () => {
    setExaminationStep(1);
    setSelectedModuleIds([]);
    setExaminationSchedule([]);
    setExaminationForm({ examinationName: '', examinationType: '', academicSessionId: '', programId: '', semesterId: '', startDate: '', endDate: '', description: '' });
    setExaminationDialogOpen(true);
  };

  const submitExamination = async () => {
    try {
      await api.post('/operations/examinations', { ...examinationForm, moduleIds: selectedModuleIds, schedule: examinationSchedule });
      toast.success('Examination created');
      setExaminationDialogOpen(false);
      fetchExaminations();
    } catch (error: any) { toast.error(error.response?.data?.message || 'Failed to create examination'); }
  };

  const goToSchedule = () => {
    setExaminationSchedule(selectedModuleIds.map((moduleId, index) => ({
      moduleId,
      date: index === 0 ? examinationForm.startDate : '',
      startTime: '09:30',
      endTime: '12:30',
    })));
    setExaminationStep(3);
  };

  const addScheduleRow = () => {
    const nextModule = examinationModules.find(module => !examinationSchedule.some(row => row.moduleId === module.id));
    setExaminationSchedule(current => [...current, { moduleId: nextModule?.id || '', date: '', startTime: '09:30', endTime: '12:30' }]);
  };

  const updateScheduleRow = (index: number, field: string, value: string) => {
    setExaminationSchedule(current => current.map((row, rowIndex) => rowIndex === index ? { ...row, [field]: value } : row));
  };

  useEffect(() => {
    if (!examinationForm.programId) return;
    const loadExaminationOptions = async () => {
      try {
        const semesterResponse = await api.get(`/operations/programs/${examinationForm.programId}/semesters`);
        const loadedSemesters = semesterResponse.data.data || [];
        setSemesters(previous => [...previous.filter(item => !loadedSemesters.some((loaded: any) => loaded.id === item.id)), ...loadedSemesters]);
        if (examinationForm.semesterId) {
          const moduleResponse = await api.get(`/operations/programs/${examinationForm.programId}/modules`, { params: { semesterId: examinationForm.semesterId } });
          setExaminationModules(moduleResponse.data.data || []);
        }
      } catch (error: any) { toast.error(error.response?.data?.message || 'Failed to load examination options'); }
    };
    loadExaminationOptions();
  }, [examinationForm.programId, examinationForm.semesterId]);

  useEffect(() => {
    if (!['academic-semesters', 'academic-modules'].includes(initialTab || '') || programs.length === 0) return;
    const loadAcademicRecords = async () => {
      try {
        const records = await Promise.all(programs.map(async program => {
          const response = await api.get(`/operations/programs/${program.id}/semesters`);
          return (response.data.data || []).map((semester: any) => ({ ...semester, programId: program.id, programName: program.name, academicSessionId: program.academicSessionId }));
        }));
        const allSemesters = records.flat();
        setSemesters(allSemesters);
        if (initialTab === 'academic-modules') {
          const moduleRecords = await Promise.all(programs.map(async program => {
            const response = await api.get(`/operations/programs/${program.id}/modules`);
            return (response.data.data || []).map((module: any) => ({ ...module, programId: program.id, programName: program.name, academicSessionId: program.academicSessionId, semesterName: allSemesters.find(semester => semester.id === module.semesterId)?.semesterName || 'Unknown semester' }));
          }));
          setModules(moduleRecords.flat());
        }
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Failed to load academic records');
      }
    };
    loadAcademicRecords();
  }, [initialTab, programs]);

  const fetchModules = async (programId: string, semesterId = selectedSemesterId) => {
    setModuleLoading(true);
    try {
      const response = await api.get(`/operations/programs/${programId}/modules`, { params: semesterId ? { semesterId } : undefined });
      setModules(response.data.data || []);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load modules');
    } finally {
      setModuleLoading(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const payload = {
        name: `${formData.startDate.slice(0, 4)} - ${formData.endDate.slice(0, 4)}`,
        startDate: formData.startDate,
        endDate: formData.endDate,
        status: formData.status,
      };
      if (editingId) {
        await api.put(`/operations/sessions/${editingId}`, payload);
        toast.success('Academic session updated');
      } else {
        await api.post('/operations/sessions', payload);
        toast.success('Academic session added');
      }
      setDialogOpen(false);
      setEditingId(null);
      setFormData({ startDate: '', endDate: '', status: 'inactive' });
      fetchSessions();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add academic session');
    }
  };

  const handleEdit = (session: any) => {
    setEditingId(session.id);
    setFormData({
      startDate: new Date(session.startDate).toISOString().slice(0, 10),
      endDate: new Date(session.endDate).toISOString().slice(0, 10),
      status: session.status === 'active' ? 'active' : 'inactive',
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this academic session?')) return;
    try {
      await api.delete(`/operations/sessions/${id}`);
      toast.success('Academic session deleted');
      fetchSessions();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete academic session');
    }
  };

  const closeDialog = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setEditingId(null);
      setFormData({ startDate: '', endDate: '', status: 'inactive' });
    }
  };

  const handleProgramSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedSessionId) return;
    try {
      const payload = {
        academicSessionId: selectedSessionId,
        name: programForm.name,
        courseName: programForm.courseName,
        duration: Number(programForm.duration),
        status: programForm.status,
        description: programForm.description,
      };
      if (editingId) {
        await api.put(`/operations/programs/${editingId}`, payload);
        toast.success('Program updated');
      } else {
        await api.post('/operations/programs', payload);
        toast.success('Program added');
      }
      setProgramDialogOpen(false);
      setEditingId(null);
      setProgramForm({ name: '', courseName: '', duration: '', status: 'active', description: '' });
      fetchPrograms();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add program');
    }
  };

  const handleEditProgram = (program: any) => {
    setEditingId(program.id);
    setProgramForm({
      name: program.name || '',
      courseName: program.courseName || '',
      duration: String(program.duration || ''),
      status: program.status || 'active',
      description: program.description || '',
    });
    setProgramDialogOpen(true);
  };

  const handleDeleteProgram = async (program: any) => {
    if (!window.confirm(`Delete program "${program.name}"?`)) return;
    try {
      await api.delete(`/operations/programs/${program.id}`);
      toast.success('Program deleted');
      fetchPrograms();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete program');
    }
  };

  const openProgramModules = (programId: string) => {
    setSelectedProgramId(programId);
    setSelectedSemesterId(null);
    setModules([]);
    setActiveSection('semesters');
    fetchSemesters(programId);
  };

  const handleSessionChange = (sessionId: string) => {
    setSelectedSessionId(sessionId);
    setSelectedProgramId(null);
    setSelectedSemesterId(null);
    setSemesters([]);
    setModules([]);
    setActiveSection('programs');
  };

  const fetchSemesters = async (programId: string) => {
    setSemesterLoading(true);
    try {
      const response = await api.get(`/operations/programs/${programId}/semesters`);
      setSemesters(response.data.data || []);
    } catch (error: any) { toast.error(error.response?.data?.message || 'Failed to load semesters'); }
    finally { setSemesterLoading(false); }
  };

  const openSemesterModules = (semesterId: string) => {
    if (!selectedProgramId) return;
    setSelectedSemesterId(semesterId);
    setActiveSection('modules');
    fetchModules(selectedProgramId, semesterId);
  };

  const closeSemesterDialog = (open: boolean) => {
    setSemesterDialogOpen(open);
    if (!open) {
      setEditingSemesterId(null);
      setSemesterForm({ semesterName: '', semesterNumber: '', startDate: '', endDate: '', status: 'active' });
    }
  };

  const openCreateSemester = () => {
    setEditingSemesterId(null);
    setSemesterForm({ semesterName: '', semesterNumber: '', startDate: '', endDate: '', status: 'active' });
    setSemesterDialogOpen(true);
  };

  const handleEditSemester = (semester: any) => {
    setEditingSemesterId(semester.id);
    setSemesterForm({ semesterName: semester.semesterName, semesterNumber: String(semester.semesterNumber), startDate: new Date(semester.startDate).toISOString().slice(0, 10), endDate: new Date(semester.endDate).toISOString().slice(0, 10), status: semester.status });
    setSemesterDialogOpen(true);
  };

  const handleDeleteSemester = async (semester: any) => {
    if (!selectedProgramId || !window.confirm(`Delete semester "${semester.semesterName}"?`)) return;
    try { await api.delete(`/operations/programs/${selectedProgramId}/semesters/${semester.id}`); toast.success('Semester deleted'); fetchSemesters(selectedProgramId); }
    catch (error: any) { toast.error(error.response?.data?.message || 'Failed to delete semester'); }
  };

  const handleSemesterSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedProgramId || !selectedSessionId) return;
    try {
      const payload = { ...semesterForm, semesterNumber: Number(semesterForm.semesterNumber), academicSessionId: selectedSessionId };
      if (editingSemesterId) { await api.put(`/operations/programs/${selectedProgramId}/semesters/${editingSemesterId}`, payload); toast.success('Semester updated'); }
      else { await api.post(`/operations/programs/${selectedProgramId}/semesters`, payload); toast.success('Semester created'); }
      closeSemesterDialog(false);
      fetchSemesters(selectedProgramId);
    } catch (error: any) { toast.error(error.response?.data?.message || 'Failed to save semester'); }
  };

  const closeModuleDialog = (open: boolean) => {
    setModuleDialogOpen(open);
    if (!open) {
      setEditingModuleId(null);
      setModuleForm({ moduleCode: '', moduleName: '', moduleType: '' });
    }
  };

  const openCreateModule = () => {
    if (!selectedSemesterId) return;
    setEditingModuleId(null);
    setModuleForm({ moduleCode: '', moduleName: '', moduleType: '' });
    setModuleDialogOpen(true);
  };

  const handleEditModule = (module: any) => {
    setEditingModuleId(module.id);
    setModuleForm({
      moduleCode: module.moduleCode || '',
      moduleName: module.moduleName || '',
      moduleType: module.moduleType || '',
    });
    setModuleDialogOpen(true);
  };

  const handleDeleteModule = async (module: any) => {
    if (!selectedProgramId || !window.confirm(`Delete module "${module.moduleName}"?`)) return;
    try {
      await api.delete(`/operations/programs/${selectedProgramId}/modules/${module.id}`);
      toast.success('Module deleted');
      fetchModules(selectedProgramId);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete module');
    }
  };

  const handleModuleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedProgramId || !selectedSessionId) return;
    try {
      const payload = {
        ...moduleForm,
        academicSessionId: selectedSessionId,
        semesterId: selectedSemesterId,
      };
      if (editingModuleId) {
        await api.put(`/operations/programs/${selectedProgramId}/modules/${editingModuleId}`, payload);
        toast.success('Module updated');
      } else {
        await api.post(`/operations/programs/${selectedProgramId}/modules`, payload);
        toast.success('Module created');
      }
      closeModuleDialog(false);
      fetchModules(selectedProgramId);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create module');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{initialTab === 'academic-session' ? 'Academic Session' : initialTab === 'academic-semesters' ? 'Semester' : initialTab === 'academic-modules' ? 'Modules' : 'Programs'}</h2>
        <p className="text-muted-foreground text-sm mt-1">{initialTab === 'academic-session' ? 'Manage academic sessions' : 'Manage programs by academic session'}</p>
      </div>

      {initialTab === 'academic-calendar' ? <Card><CardContent className="py-16 text-center text-muted-foreground">Academic Calendar will be available here.</CardContent></Card> : null}

      {initialTab === 'academic-examination' && <Card>
        <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"><div><CardTitle>Examinations</CardTitle><p className="text-sm text-muted-foreground">Create and manage examinations</p></div><div className="flex flex-wrap gap-2"><Button onClick={openExaminationDialog}><Plus className="w-4 h-4 mr-2" />Create Examination</Button><Button variant="outline" onClick={() => toast.info('Manage Examination is coming soon')}>Manage Examination</Button><Button variant="outline" onClick={() => toast.info('Examination Schedule is coming soon')}>Examination Schedule</Button></div></CardHeader>
        <CardContent className="space-y-5"><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3"><Select value={examinationFilters.sessionId} onValueChange={sessionId => setExaminationFilters({ ...examinationFilters, sessionId })}><SelectTrigger><SelectValue placeholder="All Sessions" /></SelectTrigger><SelectContent><SelectItem value="all">All Sessions</SelectItem>{sessions.map(session => <SelectItem key={session.id} value={session.id}>{displaySession(session.id)}</SelectItem>)}</SelectContent></Select><Select value={examinationFilters.programId} onValueChange={programId => setExaminationFilters({ ...examinationFilters, programId })}><SelectTrigger><SelectValue placeholder="All Programs" /></SelectTrigger><SelectContent><SelectItem value="all">All Programs</SelectItem>{programs.map(program => <SelectItem key={program.id} value={program.id}>{program.name}</SelectItem>)}</SelectContent></Select><Select value={examinationFilters.semesterId} onValueChange={semesterId => setExaminationFilters({ ...examinationFilters, semesterId })}><SelectTrigger><SelectValue placeholder="All Semesters" /></SelectTrigger><SelectContent><SelectItem value="all">All Semesters</SelectItem>{semesters.map(semester => <SelectItem key={semester.id} value={semester.id}>{semester.semesterName}</SelectItem>)}</SelectContent></Select><Select value={examinationFilters.status} onValueChange={status => setExaminationFilters({ ...examinationFilters, status })}><SelectTrigger><SelectValue placeholder="All Statuses" /></SelectTrigger><SelectContent><SelectItem value="all">All Statuses</SelectItem><SelectItem value="draft">Draft</SelectItem><SelectItem value="published">Published</SelectItem><SelectItem value="completed">Completed</SelectItem></SelectContent></Select></div>
          {examinationLoading ? <p className="py-8 text-center text-muted-foreground">Loading examinations...</p> : filteredExaminations.length === 0 ? <p className="py-8 text-center text-muted-foreground">No examinations created.</p> : <div className="space-y-3">{filteredExaminations.map(examination => <div key={examination.id} className="rounded-lg border p-4 space-y-3"><div><p className="font-semibold">{examination.examinationName}</p><p className="text-sm text-muted-foreground">{examination.program?.name || 'Program not found'}</p></div><div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm"><span>Semester: {examination.semester?.semesterName}</span><span>Session: {displaySession(examination.academicSessionId)}</span></div><div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm"><span>Modules: {Array.isArray(examination.moduleIds) ? examination.moduleIds.length : 0}</span><span>Examination Date: {new Date(examination.startDate).toLocaleDateString()} - {new Date(examination.endDate).toLocaleDateString()}</span><span>Status: <Badge variant="outline">{examination.status}</Badge></span></div><div className="flex justify-end gap-2"><Button size="sm" variant="outline" onClick={() => toast.info('Examination details view is coming soon')}>View</Button><Button size="sm" variant="outline" onClick={() => toast.info('Examination editing is coming soon')}>Edit</Button></div></div>)}</div>}
        </CardContent>
      </Card>}

      {(!initialTab || initialTab === 'academic-session') && <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2"><Calendar className="w-5 h-5 text-primary" />Select Academic Session</CardTitle>
          <Button type="button" onClick={() => { setEditingId(null); setFormData({ startDate: '', endDate: '', status: 'inactive' }); setDialogOpen(true); }}><Plus className="w-4 h-4 mr-2" />Add Session</Button>
        </CardHeader>
        <CardContent>
          {loading ? <p className="py-6 text-center text-muted-foreground">Loading sessions...</p> : sessions.length === 0 ? (
            <p className="py-6 text-center text-muted-foreground">No academic sessions found.</p>
          ) : initialTab === 'academic-session' ? (
            <div className="space-y-2">
              <div className="hidden md:grid md:grid-cols-[1.5fr_1fr_1fr_auto] gap-4 px-4 pb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <span>Academic Session</span><span>Start Date</span><span>End Date</span><span>Status</span>
              </div>
              {sessions.map(session => (
                <div key={session.id} onClick={() => handleSessionChange(session.id)} className={`grid grid-cols-1 md:grid-cols-[1.5fr_1fr_1fr_auto] gap-3 md:gap-4 items-center rounded-lg border p-4 cursor-pointer ${selectedSessionId === session.id ? 'border-primary ring-1 ring-primary' : ''}`}>
                  <div><p className="font-semibold">{new Date(session.startDate).getFullYear()} - {new Date(session.endDate).getFullYear()}</p><p className="text-xs text-muted-foreground mt-1">{session.name || 'Academic Session'}</p></div>
                  <span className="text-sm text-muted-foreground">{new Date(session.startDate).toLocaleDateString()}</span>
                  <span className="text-sm text-muted-foreground">{new Date(session.endDate).toLocaleDateString()}</span>
                  <div className="flex items-center justify-between gap-3"><Badge variant="outline" className={session.status === 'active' ? 'text-green-600 border-green-300' : ''}>{session.status === 'active' ? 'Active' : 'Not Active'}</Badge><div className="flex gap-1"><Button type="button" variant="ghost" size="sm" onClick={event => { event.stopPropagation(); handleEdit(session); }}><Edit className="w-3.5 h-3.5 mr-1" />Edit</Button><Button type="button" variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={event => { event.stopPropagation(); handleDelete(session.id); }}><Trash2 className="w-3.5 h-3.5" /></Button></div></div>
                </div>
              ))}
            </div>
          ) : (
            <div ref={sessionScrollerRef} className="flex gap-3 overflow-x-auto pb-3 scroll-smooth snap-x snap-mandatory">
                {sessions.map(session => (
                  <div role="button" tabIndex={0} key={session.id} data-session-active={session.status === 'active'} onClick={() => handleSessionChange(session.id)} onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') handleSessionChange(session.id); }} className={`relative min-w-[190px] flex-none snap-start rounded-lg border p-4 min-h-24 text-left cursor-pointer ${selectedSessionId === session.id ? 'border-primary ring-1 ring-primary' : ''} ${session.status === 'active' ? 'bg-primary/5' : 'bg-card'}`}>
                  {session.status === 'active' && <div className="absolute top-3 right-3 rounded-full bg-primary p-1 text-primary-foreground"><Check className="w-3 h-3" /></div>}
                  <p className="font-semibold">{new Date(session.startDate).getFullYear()} - {new Date(session.endDate).getFullYear()}</p>
                  <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground"><span className={`h-2 w-2 rounded-full ${session.status === 'active' ? 'bg-green-500' : 'bg-muted-foreground/40'}`} />{session.status === 'active' ? <Badge variant="outline" className="text-green-600 border-green-300">Active</Badge> : 'Not Active'}</div>
                  <div className="flex gap-1 mt-3 border-t pt-2">
                    <Button type="button" variant="ghost" size="sm" className="flex-1" onClick={() => handleEdit(session)}><Edit className="w-3.5 h-3.5 mr-1" />Edit</Button>
                    <Button type="button" variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleDelete(session.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>}

      {!initialTab && <Card>
        <CardContent className="p-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { id: 'programs' as const, label: 'Programs', description: 'Manage academic programs', icon: GraduationCap },
            { id: 'semesters' as const, label: 'Semester Management', description: 'Manage semesters for this program', icon: Calendar },
            { id: 'modules' as const, label: 'Modules', description: 'Manage modules in this semester', icon: BookOpen },
          ].map(({ id, label, description, icon: Icon }) => (
            <Button key={id} type="button" variant={activeSection === id ? 'default' : 'outline'} className="h-20 justify-start gap-3 text-left" disabled={(id === 'semesters' && !selectedProgramId) || (id === 'modules' && !selectedSemesterId)} onClick={() => {
              if ((id === 'semesters' || id === 'modules') && !selectedProgramId) return;
              if (id === 'modules' && !selectedSemesterId) return;
              setActiveSection(id);
            }}>
              <Icon className="w-5 h-5 shrink-0" />
              <span className="flex flex-col items-start gap-1">
                <span className="font-semibold">{label}</span>
                <span className="text-xs font-normal opacity-70">{description}</span>
              </span>
            </Button>
          ))}
        </CardContent>
      </Card>}

      {activeSection === 'programs' && !initialTab && !['academic-calendar', 'academic-examination'].includes(initialTab || '') && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div><CardTitle>Programs ({programs.length})</CardTitle><p className="text-sm text-muted-foreground mt-1">Programs for the selected academic session</p></div>
            <Select value={programSessionFilter} onValueChange={setProgramSessionFilter}><SelectTrigger className="w-48"><SelectValue placeholder="All Sessions" /></SelectTrigger><SelectContent><SelectItem value="all">All Sessions</SelectItem>{sessions.map(session => <SelectItem key={session.id} value={session.id}>{displaySession(session.id)}</SelectItem>)}</SelectContent></Select>
          </CardHeader>
          <CardContent>
            {programLoading ? <p className="py-8 text-center text-muted-foreground">Loading programs...</p> : displayedPrograms.length === 0 ? <p className="py-8 text-center text-muted-foreground">No programs found.</p> : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {displayedPrograms.map(program => (
                  <div key={program.id} className="rounded-lg border p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3"><div><h3 className="font-semibold">{program.name}</h3><p className="text-sm text-muted-foreground">{program.courseName || 'Course name not provided'}</p></div><Badge variant={program.status === 'active' ? 'default' : 'outline'}>{program.status === 'active' ? 'Active' : 'Not Active'}</Badge></div>
                    <p className="text-sm text-muted-foreground">Duration: {program.duration} Years</p>
                    {program.description && <p className="text-sm text-muted-foreground line-clamp-3">{program.description}</p>}
                    <div className="flex gap-2">
                      <Button type="button" variant="outline" size="sm" onClick={() => openProgramModules(program.id)}>Open</Button>
                      <Button type="button" variant="outline" size="sm" onClick={() => handleEditProgram(program)} title="Edit program"><Edit className="w-3.5 h-3.5 mr-1" />Edit</Button>
                      <Button type="button" variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleDeleteProgram(program)} title="Delete program"><Trash2 className="w-3.5 h-3.5" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {initialTab === 'academic-semesters' && (
        <Card>
            <CardHeader><div><CardTitle>All Semesters ({semesters.filter(semester => (semesterSessionFilter === 'all' || semester.academicSessionId === semesterSessionFilter) && (semesterProgramFilter === 'all' || semester.programId === semesterProgramFilter)).length})</CardTitle><p className="text-sm text-muted-foreground">Filter semesters by academic session and program</p></div></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3 mb-4"><Select value={semesterSessionFilter} onValueChange={setSemesterSessionFilter}><SelectTrigger className="w-48"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All Sessions</SelectItem>{sessions.map(session => <SelectItem key={session.id} value={session.id}>{displaySession(session.id)}</SelectItem>)}</SelectContent></Select><Select value={semesterProgramFilter} onValueChange={setSemesterProgramFilter}><SelectTrigger className="w-56"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All Programs</SelectItem>{programs.map(program => <SelectItem key={program.id} value={program.id}>{program.name}</SelectItem>)}</SelectContent></Select></div>
            <div className="space-y-2">{semesters.filter(semester => (semesterSessionFilter === 'all' || semester.academicSessionId === semesterSessionFilter) && (semesterProgramFilter === 'all' || semester.programId === semesterProgramFilter)).map(semester => <div key={semester.id} className="grid grid-cols-1 md:grid-cols-5 gap-3 items-center border rounded-lg p-4"><div className="font-medium">{semester.semesterName}<div className="text-xs text-muted-foreground">No. {semester.semesterNumber}</div></div><div className="text-sm">{semester.programName}</div><div className="text-sm">{displaySession(semester.academicSessionId)}</div><Badge variant={semester.status === 'active' ? 'default' : 'outline'}>{semester.status}</Badge><div className="flex gap-2"><Button size="sm" onClick={() => { setSelectedProgramId(semester.programId); openSemesterModules(semester.id); }}>Open</Button><Button size="sm" variant="outline" onClick={() => handleEditSemester(semester)}>Edit</Button><Button size="sm" variant="outline" className="text-destructive" onClick={() => handleDeleteSemester(semester)}>Delete</Button></div></div>)}</div>
          </CardContent>
        </Card>
      )}

      {initialTab === 'academic-modules' && (
        <Card>
          <CardHeader><CardTitle>All Modules ({modules.filter(module => (moduleSessionFilter === 'all' || module.academicSessionId === moduleSessionFilter) && (moduleProgramFilter === 'all' || module.programId === moduleProgramFilter) && (moduleSemesterFilter === 'all' || module.semesterId === moduleSemesterFilter)).length})</CardTitle><p className="text-sm text-muted-foreground">Filter modules by academic session, program, and semester</p></CardHeader>
          <CardContent><div className="flex flex-wrap gap-3 mb-4"><Select value={moduleSessionFilter} onValueChange={setModuleSessionFilter}><SelectTrigger className="w-48"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All Sessions</SelectItem>{sessions.map(session => <SelectItem key={session.id} value={session.id}>{displaySession(session.id)}</SelectItem>)}</SelectContent></Select><Select value={moduleProgramFilter} onValueChange={setModuleProgramFilter}><SelectTrigger className="w-56"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All Programs</SelectItem>{programs.map(program => <SelectItem key={program.id} value={program.id}>{program.name}</SelectItem>)}</SelectContent></Select><Select value={moduleSemesterFilter} onValueChange={setModuleSemesterFilter}><SelectTrigger className="w-56"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All Semesters</SelectItem>{semesters.map(semester => <SelectItem key={semester.id} value={semester.id}>{semester.semesterName}</SelectItem>)}</SelectContent></Select></div><div className="overflow-x-auto"><div className="min-w-[760px] space-y-2"><div className="grid grid-cols-6 gap-3 px-4 text-xs font-semibold text-muted-foreground"><span>Code</span><span>Module</span><span>Type</span><span>Session</span><span>Program</span><span>Semester</span></div>{modules.filter(module => (moduleSessionFilter === 'all' || module.academicSessionId === moduleSessionFilter) && (moduleProgramFilter === 'all' || module.programId === moduleProgramFilter) && (moduleSemesterFilter === 'all' || module.semesterId === moduleSemesterFilter)).map(module => <div key={module.id} className="grid grid-cols-6 gap-3 items-center border rounded-lg p-4 text-sm"><span className="font-medium">{module.moduleCode}</span><span>{module.moduleName}</span><span><Badge variant="outline">{module.moduleType}</Badge></span><span>{displaySession(module.academicSessionId)}</span><span>{module.programName}</span><span>{module.semesterName}</span></div>)}</div></div></CardContent>
        </Card>
      )}

      {activeSection === 'modules' && initialTab !== 'academic-modules' && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>
                Modules{selectedSemesterId ? ` - ${semesters.find(semester => semester.id === selectedSemesterId)?.semesterName || 'Selected Semester'}` : ''}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Manage modules for the selected program</p>
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => { setSelectedSemesterId(null); setActiveSection('semesters'); }}>
                Semesters
              </Button>
              <Button type="button" disabled={!selectedSemesterId} onClick={openCreateModule}>
                <Plus className="w-4 h-4 mr-2" />Create Module
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {moduleLoading ? <p className="py-8 text-center text-muted-foreground">Loading modules...</p> : modules.length === 0 ? (
              <p className="py-8 text-center text-muted-foreground">No modules created for this program.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {modules.map(module => (
                  <div key={module.id} className="rounded-lg border p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div><p className="font-semibold">{module.moduleName}</p><p className="text-sm text-muted-foreground">{module.moduleCode}</p></div>
                      <Badge variant="outline">{module.moduleType}</Badge>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button type="button" variant="outline" size="sm" onClick={() => handleEditModule(module)}><Edit className="w-3.5 h-3.5 mr-1" />Edit</Button>
                      <Button type="button" variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleDeleteModule(module)}><Trash2 className="w-3.5 h-3.5 mr-1" />Delete</Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeSection === 'semesters' && initialTab !== 'academic-semesters' && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div><CardTitle>Semester Management ({semesters.length})</CardTitle><p className="text-sm text-muted-foreground mt-1">Semesters for {programs.find(program => program.id === selectedProgramId)?.name || 'the selected program'}</p></div>
            <Button type="button" onClick={openCreateSemester} disabled={!selectedProgramId}><Plus className="w-4 h-4 mr-2" />Create Semester</Button>
          </CardHeader>
          <CardContent>
            {semesterLoading ? <p className="py-8 text-center text-muted-foreground">Loading semesters...</p> : semesters.length === 0 ? <p className="py-8 text-center text-muted-foreground">No semesters created for this program.</p> : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {semesters.map(semester => <div key={semester.id} className="rounded-lg border p-4 space-y-3"><div className="flex items-start justify-between gap-3"><div><p className="font-semibold">{semester.semesterName}</p><p className="text-sm text-muted-foreground">Semester {semester.semesterNumber}</p></div><Badge variant={semester.status === 'active' ? 'default' : 'outline'}>{semester.status}</Badge></div><p className="text-sm text-muted-foreground">{new Date(semester.startDate).toLocaleDateString()} - {new Date(semester.endDate).toLocaleDateString()}</p><div className="flex gap-2"><Button type="button" size="sm" onClick={() => openSemesterModules(semester.id)}>Open</Button><Button type="button" variant="outline" size="sm" onClick={() => handleEditSemester(semester)}><Edit className="w-3.5 h-3.5 mr-1" />Edit</Button><Button type="button" variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleDeleteSemester(semester)}><Trash2 className="w-3.5 h-3.5 mr-1" />Delete</Button></div></div>)}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Dialog open={dialogOpen} onOpenChange={closeDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>{editingId ? 'Edit Academic Session' : 'Add Academic Session'}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2"><Label htmlFor="sessionFrom">Session From</Label><Input id="sessionFrom" type="date" value={formData.startDate} onChange={e => setFormData({ ...formData, startDate: e.target.value })} required /></div>
            <div className="space-y-2"><Label htmlFor="sessionTo">Session To</Label><Input id="sessionTo" type="date" value={formData.endDate} min={formData.startDate || undefined} onChange={e => setFormData({ ...formData, endDate: e.target.value })} required /></div>
            <div className="space-y-2"><Label>Status</Label><Select value={formData.status} onValueChange={status => setFormData({ ...formData, status })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="inactive">Not Active</SelectItem></SelectContent></Select></div>
            <div className="flex gap-2"><Button type="submit" className="flex-1">{editingId ? 'Save Changes' : 'Add Session'}</Button><Button type="button" variant="outline" onClick={() => closeDialog(false)}>Cancel</Button></div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={programDialogOpen} onOpenChange={setProgramDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editingId ? 'Edit Program' : 'Add Program'}</DialogTitle></DialogHeader>
          <form onSubmit={handleProgramSubmit} className="space-y-4">
            <div className="space-y-2"><Label>Program</Label><Input value={programForm.name} onChange={e => setProgramForm({ ...programForm, name: e.target.value })} placeholder="e.g. B.Tech Computer Science" required /></div>
            <div className="space-y-2"><Label>Course Name</Label><Input value={programForm.courseName} onChange={e => setProgramForm({ ...programForm, courseName: e.target.value })} required /></div>
            <div className="space-y-2"><Label>Duration (Years)</Label><Input type="number" min="1" value={programForm.duration} onChange={e => setProgramForm({ ...programForm, duration: e.target.value })} required /></div>
            <div className="space-y-2"><Label>Status</Label><Select value={programForm.status} onValueChange={status => setProgramForm({ ...programForm, status })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="inactive">Not Active</SelectItem></SelectContent></Select></div>
            <div className="space-y-2"><Label>Description</Label><textarea value={programForm.description} onChange={e => setProgramForm({ ...programForm, description: e.target.value })} className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" /></div>
            <div className="flex gap-2"><Button type="submit" className="flex-1">{editingId ? 'Update Program' : 'Add Program'}</Button><Button type="button" variant="outline" onClick={() => { setProgramDialogOpen(false); setEditingId(null); }}>Cancel</Button></div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={semesterDialogOpen} onOpenChange={closeSemesterDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{editingSemesterId ? 'Edit Semester' : 'Create Semester'}</DialogTitle></DialogHeader>
          <form onSubmit={handleSemesterSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2"><Label htmlFor="semesterName">Semester Name</Label><Input id="semesterName" value={semesterForm.semesterName} onChange={event => setSemesterForm({ ...semesterForm, semesterName: event.target.value })} placeholder="e.g. First Semester" required /></div>
              <div className="space-y-2"><Label htmlFor="semesterNumber">Semester Number</Label><Input id="semesterNumber" type="number" min="1" value={semesterForm.semesterNumber} onChange={event => setSemesterForm({ ...semesterForm, semesterNumber: event.target.value })} required /></div>
              <div className="space-y-2"><Label htmlFor="semesterProgram">Program</Label><Input id="semesterProgram" value={programs.find(program => program.id === selectedProgramId)?.name || ''} disabled /></div>
              <div className="space-y-2"><Label htmlFor="semesterSession">Academic Session</Label><Input id="semesterSession" value={selectedSessionId ? (() => { const session = sessions.find(item => item.id === selectedSessionId); return session ? `${new Date(session.startDate).getFullYear()} - ${new Date(session.endDate).getFullYear()}` : ''; })() : ''} disabled /></div>
              <div className="space-y-2"><Label htmlFor="semesterStartDate">Start Date</Label><Input id="semesterStartDate" type="date" value={semesterForm.startDate} onChange={event => setSemesterForm({ ...semesterForm, startDate: event.target.value })} required /></div>
              <div className="space-y-2"><Label htmlFor="semesterEndDate">End Date</Label><Input id="semesterEndDate" type="date" min={semesterForm.startDate || undefined} value={semesterForm.endDate} onChange={event => setSemesterForm({ ...semesterForm, endDate: event.target.value })} required /></div>
              <div className="space-y-2"><Label>Status</Label><Select value={semesterForm.status} onValueChange={status => setSemesterForm({ ...semesterForm, status })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="inactive">Inactive</SelectItem></SelectContent></Select></div>
            </div>
            <div className="flex gap-2"><Button type="submit" className="flex-1">{editingSemesterId ? 'Update Semester' : 'Create Semester'}</Button><Button type="button" variant="outline" onClick={() => closeSemesterDialog(false)}>Cancel</Button></div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={examinationDialogOpen} onOpenChange={setExaminationDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader><DialogTitle>{examinationStep === 1 ? 'Create Examination' : examinationStep === 2 ? 'Select Examination Modules' : 'Examination Schedule'}</DialogTitle></DialogHeader>
          {examinationStep === 1 ? <form onSubmit={event => { event.preventDefault(); setExaminationStep(2); }} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Examination Name *</Label><Input value={examinationForm.examinationName} onChange={event => setExaminationForm({ ...examinationForm, examinationName: event.target.value })} required /></div>
              <div className="space-y-2"><Label>Examination Type *</Label><Select value={examinationForm.examinationType} onValueChange={examinationType => setExaminationForm({ ...examinationForm, examinationType })} required><SelectTrigger><SelectValue placeholder="Select examination type" /></SelectTrigger><SelectContent>{['Internal Examination', 'Mid Semester Examination', 'End Semester Examination', 'Supplementary Examination', 'Improvement Examination', 'Practical Examination', 'Model Examination'].map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-2"><Label>Academic Session *</Label><Select value={examinationForm.academicSessionId} onValueChange={academicSessionId => setExaminationForm({ ...examinationForm, academicSessionId, programId: '', semesterId: '' })} required><SelectTrigger><SelectValue placeholder="Select academic session" /></SelectTrigger><SelectContent>{sessions.map(session => <SelectItem key={session.id} value={session.id}>{displaySession(session.id)}</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-2"><Label>Program *</Label><Select value={examinationForm.programId} onValueChange={programId => setExaminationForm({ ...examinationForm, programId, semesterId: '' })} required><SelectTrigger><SelectValue placeholder="Select program" /></SelectTrigger><SelectContent>{examinationPrograms.map(program => <SelectItem key={program.id} value={program.id}>{program.name}</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-2"><Label>Semester *</Label><Select value={examinationForm.semesterId} onValueChange={semesterId => setExaminationForm({ ...examinationForm, semesterId })} required><SelectTrigger><SelectValue placeholder="Select semester" /></SelectTrigger><SelectContent>{examinationSemesters.map(semester => <SelectItem key={semester.id} value={semester.id}>{semester.semesterName}</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-2"><Label>Start Date *</Label><Input type="date" value={examinationForm.startDate} onChange={event => setExaminationForm({ ...examinationForm, startDate: event.target.value })} required /></div>
              <div className="space-y-2"><Label>End Date *</Label><Input type="date" min={examinationForm.startDate || undefined} value={examinationForm.endDate} onChange={event => setExaminationForm({ ...examinationForm, endDate: event.target.value })} required /></div>
              <div className="space-y-2 md:col-span-2"><Label>Description</Label><textarea value={examinationForm.description} onChange={event => setExaminationForm({ ...examinationForm, description: event.target.value })} className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" /></div>
            </div>
            <div className="flex gap-2"><Button type="submit" className="flex-1">Next -&gt;</Button><Button type="button" variant="outline" onClick={() => setExaminationDialogOpen(false)}>Cancel</Button></div>
          </form> : examinationStep === 2 ? <div className="space-y-4">
            <p className="text-sm text-muted-foreground">{examinationForm.examinationName} | {programs.find(program => program.id === examinationForm.programId)?.name} | {examinationSemesters.find(semester => semester.id === examinationForm.semesterId)?.semesterName}</p>
            <div className="rounded-lg border divide-y">{examinationModules.length === 0 ? <p className="p-6 text-center text-muted-foreground">No modules found for this program and semester.</p> : examinationModules.map(module => <label key={module.id} className="flex items-center gap-3 p-4 cursor-pointer"><input type="checkbox" checked={selectedModuleIds.includes(module.id)} onChange={event => setSelectedModuleIds(current => event.target.checked ? [...current, module.id] : current.filter(id => id !== module.id))} /><span className="font-medium">{module.moduleCode}</span><span>{module.moduleName}</span></label>)}</div>
            <p className="text-sm text-muted-foreground">Selected: {selectedModuleIds.length}/{examinationModules.length}</p>
            <div className="flex gap-2"><Button type="button" variant="outline" onClick={() => setExaminationStep(1)}>&lt;- Back</Button><Button type="button" className="flex-1" onClick={goToSchedule}>Next -&gt;</Button></div>
          </div> : <div className="space-y-4">
            <div className="overflow-x-auto rounded-lg border"><div className="min-w-[640px]"><div className="grid grid-cols-[1.2fr_1.5fr_1fr_1fr] gap-3 border-b bg-muted/40 px-4 py-3 text-sm font-semibold"><span>Date</span><span>Module</span><span>Start</span><span>End</span></div>{examinationSchedule.map((row, index) => <div key={`${row.moduleId}-${index}`} className="grid grid-cols-[1.2fr_1.5fr_1fr_1fr] gap-3 items-center border-b px-4 py-3 last:border-b-0"><Input type="date" value={row.date} min={examinationForm.startDate} max={examinationForm.endDate} onChange={event => updateScheduleRow(index, 'date', event.target.value)} /><Select value={row.moduleId} onValueChange={moduleId => updateScheduleRow(index, 'moduleId', moduleId)}><SelectTrigger><SelectValue placeholder="Select module" /></SelectTrigger><SelectContent>{examinationModules.map(module => <SelectItem key={module.id} value={module.id}>{module.moduleName}</SelectItem>)}</SelectContent></Select><Input type="time" value={row.startTime} onChange={event => updateScheduleRow(index, 'startTime', event.target.value)} /><Input type="time" value={row.endTime} onChange={event => updateScheduleRow(index, 'endTime', event.target.value)} /></div>)}</div></div>
            <Button type="button" variant="outline" onClick={addScheduleRow}>+ Add Schedule</Button>
            <div className="flex gap-2"><Button type="button" variant="outline" onClick={() => setExaminationStep(2)}>&lt;- Back</Button><Button type="button" className="flex-1" onClick={submitExamination}>Save Examination</Button></div>
          </div>}
        </DialogContent>
      </Dialog>

      <Dialog open={moduleDialogOpen} onOpenChange={closeModuleDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{editingModuleId ? 'Edit Module' : 'Create Module'}</DialogTitle></DialogHeader>
          <form onSubmit={handleModuleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2"><Label htmlFor="moduleProgram">Program</Label><Input id="moduleProgram" value={programs.find(program => program.id === selectedProgramId)?.name || ''} disabled /></div>
              <div className="space-y-2"><Label htmlFor="moduleAcademicSession">Academic Session</Label><Input id="moduleAcademicSession" value={selectedSessionId ? (() => { const session = sessions.find(item => item.id === selectedSessionId); return session ? `${new Date(session.startDate).getFullYear()} - ${new Date(session.endDate).getFullYear()}` : ''; })() : ''} disabled /></div>
              <div className="space-y-2"><Label htmlFor="moduleSemester">Semester</Label><Input id="moduleSemester" value={semesters.find(semester => semester.id === selectedSemesterId)?.semesterName || ''} disabled /></div>
              <div className="space-y-2"><Label htmlFor="moduleCode">Module Code</Label><Input id="moduleCode" value={moduleForm.moduleCode} onChange={event => setModuleForm({ ...moduleForm, moduleCode: event.target.value })} placeholder="e.g. CS101A" required /></div>
              <div className="space-y-2"><Label htmlFor="moduleName">Module Name</Label><Input id="moduleName" value={moduleForm.moduleName} onChange={event => setModuleForm({ ...moduleForm, moduleName: event.target.value })} placeholder="e.g. Data Structures" required /></div>
              <div className="space-y-2"><Label>Module Type</Label><Select value={moduleForm.moduleType} onValueChange={moduleType => setModuleForm({ ...moduleForm, moduleType })} required><SelectTrigger><SelectValue placeholder="Select module type" /></SelectTrigger><SelectContent><SelectItem value="Core">Core</SelectItem><SelectItem value="Elective">Elective</SelectItem><SelectItem value="Practical">Practical</SelectItem><SelectItem value="Project">Project</SelectItem></SelectContent></Select></div>
            </div>
            <div className="flex gap-2"><Button type="submit" className="flex-1">{editingModuleId ? 'Update Module' : 'Create Module'}</Button><Button type="button" variant="outline" onClick={() => closeModuleDialog(false)}>Cancel</Button></div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
