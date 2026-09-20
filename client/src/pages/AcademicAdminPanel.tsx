import { useEffect, useRef, useState } from 'react';
import { BookOpen, Calendar, Check, Edit, FileText, GraduationCap, Plus, Trash2 } from 'lucide-react';
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

export function AcademicAdminPanel(_props: AcademicAdminPanelProps) {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ startDate: '', endDate: '', status: 'inactive' });
  const sessionScrollerRef = useRef<HTMLDivElement>(null);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<'programs' | 'modules' | 'examinations'>('programs');
  const [programs, setPrograms] = useState<any[]>([]);
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(null);
  const [programLoading, setProgramLoading] = useState(false);
  const [programDialogOpen, setProgramDialogOpen] = useState(false);
  const [programForm, setProgramForm] = useState({ name: '', courseName: '', duration: '', status: 'active', description: '' });

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
      setPrograms((response.data.data || []).filter((program: any) => program.academicSessionId === selectedSessionId));
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load programs');
    } finally {
      setProgramLoading(false);
    }
  };

  useEffect(() => { fetchPrograms(); }, [selectedSessionId]);

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
      await api.post('/operations/programs', {
        academicSessionId: selectedSessionId,
        name: programForm.name,
        courseName: programForm.courseName,
        duration: Number(programForm.duration),
        status: programForm.status,
        description: programForm.description,
      });
      toast.success('Program added');
      setProgramDialogOpen(false);
      setProgramForm({ name: '', courseName: '', duration: '', status: 'active', description: '' });
      fetchPrograms();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add program');
    }
  };

  const openProgramModules = (programId: string) => {
    setSelectedProgramId(programId);
    setActiveSection('modules');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Programs</h2>
        <p className="text-muted-foreground text-sm mt-1">Manage programs by academic session</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2"><Calendar className="w-5 h-5 text-primary" />Select Academic Session</CardTitle>
          <Button type="button" onClick={() => { setEditingId(null); setFormData({ startDate: '', endDate: '', status: 'inactive' }); setDialogOpen(true); }}><Plus className="w-4 h-4 mr-2" />Add Session</Button>
        </CardHeader>
        <CardContent>
          {loading ? <p className="py-6 text-center text-muted-foreground">Loading sessions...</p> : sessions.length === 0 ? (
            <p className="py-6 text-center text-muted-foreground">No academic sessions found.</p>
          ) : (
            <div ref={sessionScrollerRef} className="flex gap-3 overflow-x-auto pb-3 scroll-smooth snap-x snap-mandatory">
              {sessions.map(session => (
                  <div role="button" tabIndex={0} key={session.id} data-session-active={session.status === 'active'} onClick={() => setSelectedSessionId(session.id)} onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') setSelectedSessionId(session.id); }} className={`relative min-w-[190px] flex-none snap-start rounded-lg border p-4 min-h-24 text-left cursor-pointer ${selectedSessionId === session.id ? 'border-primary ring-1 ring-primary' : ''} ${session.status === 'active' ? 'bg-primary/5' : 'bg-card'}`}>
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
      </Card>

      <Card>
        <CardContent className="p-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { id: 'programs' as const, label: 'Programs', description: 'Manage academic programs', icon: GraduationCap },
            { id: 'modules' as const, label: 'Modules', description: 'Manage modules in this session', icon: BookOpen },
            { id: 'examinations' as const, label: 'Examinations', description: 'Manage examinations in this session', icon: FileText },
          ].map(({ id, label, description, icon: Icon }) => (
            <Button key={id} type="button" variant={activeSection === id ? 'default' : 'outline'} className="h-20 justify-start gap-3 text-left" disabled={id === 'modules' && !selectedProgramId} onClick={() => {
              if (id === 'modules' && !selectedProgramId) return;
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
      </Card>

      {activeSection === 'programs' && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div><CardTitle>Programs ({programs.length})</CardTitle><p className="text-sm text-muted-foreground mt-1">Programs for the selected academic session</p></div>
            <Button type="button" onClick={() => setProgramDialogOpen(true)} disabled={!selectedSessionId}><Plus className="w-4 h-4 mr-2" />Add Program</Button>
          </CardHeader>
          <CardContent>
            {programLoading ? <p className="py-8 text-center text-muted-foreground">Loading programs...</p> : programs.length === 0 ? <p className="py-8 text-center text-muted-foreground">No programs created for this session.</p> : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {programs.map(program => (
                  <div key={program.id} className="rounded-lg border p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3"><div><h3 className="font-semibold">{program.name}</h3><p className="text-sm text-muted-foreground">{program.courseName || 'Course name not provided'}</p></div><Badge variant={program.status === 'active' ? 'default' : 'outline'}>{program.status === 'active' ? 'Active' : 'Not Active'}</Badge></div>
                    <p className="text-sm text-muted-foreground">Duration: {program.duration} Years</p>
                    {program.description && <p className="text-sm text-muted-foreground line-clamp-3">{program.description}</p>}
                    <Button type="button" variant="outline" size="sm" onClick={() => openProgramModules(program.id)}>Open</Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeSection === 'modules' && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>
                Modules{selectedProgramId ? ` - ${programs.find(program => program.id === selectedProgramId)?.name || 'Selected Program'}` : ''}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Manage modules for the selected program</p>
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => { setSelectedProgramId(null); setActiveSection('programs'); }}>
                Programs
              </Button>
              <Button type="button" disabled={!selectedProgramId} onClick={() => toast.info('Create module form coming soon')}>
                <Plus className="w-4 h-4 mr-2" />Create Module
              </Button>
            </div>
          </CardHeader>
          <CardContent className="py-12 text-center text-muted-foreground">
            Modules for this program will be managed here.
          </CardContent>
        </Card>
      )}

      {activeSection === 'examinations' && <Card><CardContent className="py-12 text-center text-muted-foreground">Examinations for the selected session will be managed here.</CardContent></Card>}

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
          <DialogHeader><DialogTitle>Add Program</DialogTitle></DialogHeader>
          <form onSubmit={handleProgramSubmit} className="space-y-4">
            <div className="space-y-2"><Label>Program</Label><Input value={programForm.name} onChange={e => setProgramForm({ ...programForm, name: e.target.value })} placeholder="e.g. B.Tech Computer Science" required /></div>
            <div className="space-y-2"><Label>Course Name</Label><Input value={programForm.courseName} onChange={e => setProgramForm({ ...programForm, courseName: e.target.value })} required /></div>
            <div className="space-y-2"><Label>Duration (Years)</Label><Input type="number" min="1" value={programForm.duration} onChange={e => setProgramForm({ ...programForm, duration: e.target.value })} required /></div>
            <div className="space-y-2"><Label>Status</Label><Select value={programForm.status} onValueChange={status => setProgramForm({ ...programForm, status })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="inactive">Not Active</SelectItem></SelectContent></Select></div>
            <div className="space-y-2"><Label>Description</Label><textarea value={programForm.description} onChange={e => setProgramForm({ ...programForm, description: e.target.value })} className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" /></div>
            <div className="flex gap-2"><Button type="submit" className="flex-1">Add Program</Button><Button type="button" variant="outline" onClick={() => setProgramDialogOpen(false)}>Cancel</Button></div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
