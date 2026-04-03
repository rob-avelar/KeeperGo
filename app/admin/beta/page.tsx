'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { signOut } from 'next-auth/react'
import { format } from 'date-fns'
import { pt } from 'date-fns/locale'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import {
  Shield,
  ArrowLeft,
  Users,
  Ticket,
  Plus,
  Copy,
  Trash2,
  Loader2,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Clock,
  Settings,
  Calendar,
  BarChart3,
  LogOut
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface BetaInvite {
  id: string
  code: string
  email: string | null
  role: string | null
  usedBy: string | null
  usedAt: string | null
  createdAt: string
  expiresAt: string | null
  notes: string | null
  user: {
    name: string | null
    email: string
    role: string
  } | null
}

interface Stats {
  total: number
  used: number
  available: number
}

export default function BetaManagementPage() {
  const [invites, setInvites] = useState<BetaInvite[]>([])
  const [stats, setStats] = useState<Stats>({ total: 0, used: 0, available: 0 })
  const [betaModeEnabled, setBetaModeEnabled] = useState(true)
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [statusFilter, setStatusFilter] = useState('all')
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [newInviteCount, setNewInviteCount] = useState(1)
  const [newInviteEmail, setNewInviteEmail] = useState('')
  const [newInviteRole, setNewInviteRole] = useState('')
  const [newInviteNotes, setNewInviteNotes] = useState('')
  const [newInviteExpires, setNewInviteExpires] = useState('')
  const { toast } = useToast()

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/admin/beta?page=${page}&status=${statusFilter}`)
      const data = await res.json()
      setInvites(data.invites || [])
      setStats(data.stats || { total: 0, used: 0, available: 0 })
      setBetaModeEnabled(data.settings?.betaModeEnabled ?? true)
      setTotalPages(data.pagination?.totalPages || 1)
    } catch (error) {
      console.error('Error fetching beta data:', error)
      toast({ title: 'Erro', description: 'Falha ao carregar dados', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [page, statusFilter])

  const toggleBetaMode = async () => {
    try {
      const res = await fetch('/api/admin/beta', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ betaModeEnabled: !betaModeEnabled })
      })
      
      if (res.ok) {
        setBetaModeEnabled(!betaModeEnabled)
        toast({
          title: 'Sucesso',
          description: `Modo beta ${!betaModeEnabled ? 'ativado' : 'desativado'}`
        })
      }
    } catch (error) {
      toast({ title: 'Erro', description: 'Falha ao atualizar configuração', variant: 'destructive' })
    }
  }

  const createInvites = async () => {
    setCreating(true)
    try {
      const res = await fetch('/api/admin/beta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          count: newInviteCount,
          email: newInviteEmail || null,
          role: newInviteRole || null,
          notes: newInviteNotes || null,
          expiresInDays: newInviteExpires ? parseInt(newInviteExpires) : null
        })
      })

      if (res.ok) {
        toast({ title: 'Sucesso', description: `${newInviteCount} convite(s) criado(s)` })
        setShowCreateDialog(false)
        setNewInviteCount(1)
        setNewInviteEmail('')
        setNewInviteRole('')
        setNewInviteNotes('')
        setNewInviteExpires('')
        fetchData()
      }
    } catch (error) {
      toast({ title: 'Erro', description: 'Falha ao criar convites', variant: 'destructive' })
    } finally {
      setCreating(false)
    }
  }

  const deleteInvite = async (id: string) => {
    try {
      const res = await fetch('/api/admin/beta', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inviteId: id, action: 'delete' })
      })

      if (res.ok) {
        toast({ title: 'Sucesso', description: 'Convite eliminado' })
        fetchData()
      }
    } catch (error) {
      toast({ title: 'Erro', description: 'Falha ao eliminar convite', variant: 'destructive' })
    }
  }

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    toast({ title: 'Copiado!', description: `Código ${code} copiado` })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Header */}
      <header className="bg-slate-800/50 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/dashboard">
              <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-emerald-500" />
              <span className="font-bold text-xl text-white">Beta Testers</span>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-slate-300 hover:text-white">
                <Settings className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem asChild>
                <Link href="/admin/users" className="flex items-center">
                  <Users className="w-4 h-4 mr-2" />
                  Utilizadores
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/admin/bookings" className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  Reservas
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/admin/dashboard" className="flex items-center">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Dashboard
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/' })} className="text-red-500">
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Beta Mode Toggle */}
        <Card className="bg-slate-800/50 border-slate-700 mb-6">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">Modo Beta</h3>
                <p className="text-sm text-slate-400">
                  {betaModeEnabled 
                    ? 'Apenas utilizadores com código de convite podem registar-se' 
                    : 'Registos abertos ao público'
                  }
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-400">{betaModeEnabled ? 'Ativado' : 'Desativado'}</span>
                <Switch
                  checked={betaModeEnabled}
                  onCheckedChange={toggleBetaMode}
                  className="data-[state=checked]:bg-emerald-500"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Total Convites</p>
                  <p className="text-2xl font-bold text-white">{stats.total}</p>
                </div>
                <Ticket className="w-8 h-8 text-slate-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Utilizados</p>
                  <p className="text-2xl font-bold text-emerald-500">{stats.used}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-emerald-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Disponíveis</p>
                  <p className="text-2xl font-bold text-lime-400">{stats.available}</p>
                </div>
                <Clock className="w-8 h-8 text-lime-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40 bg-slate-800 border-slate-700 text-white">
                <SelectValue placeholder="Filtrar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="available">Disponíveis</SelectItem>
                <SelectItem value="used">Utilizados</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                <Plus className="w-4 h-4 mr-2" />
                Criar Convites
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-800 border-slate-700">
              <DialogHeader>
                <DialogTitle className="text-white">Criar Convites Beta</DialogTitle>
                <DialogDescription className="text-slate-400">
                  Gerar novos códigos de convite para beta testers
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label className="text-white">Quantidade</Label>
                  <Input
                    type="number"
                    min="1"
                    max="50"
                    value={newInviteCount}
                    onChange={(e) => setNewInviteCount(parseInt(e.target.value) || 1)}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-white">Email (opcional)</Label>
                  <Input
                    type="email"
                    placeholder="Reservar para um email específico"
                    value={newInviteEmail}
                    onChange={(e) => setNewInviteEmail(e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-white">Tipo (opcional)</Label>
                  <Select value={newInviteRole} onValueChange={setNewInviteRole}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue placeholder="Qualquer tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Qualquer tipo</SelectItem>
                      <SelectItem value="ORGANIZER">Organizador</SelectItem>
                      <SelectItem value="GOALKEEPER">Guarda-redes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-white">Expira em (dias)</Label>
                  <Input
                    type="number"
                    placeholder="Sem expiração"
                    value={newInviteExpires}
                    onChange={(e) => setNewInviteExpires(e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-white">Notas (opcional)</Label>
                  <Textarea
                    placeholder="Notas internas"
                    value={newInviteNotes}
                    onChange={(e) => setNewInviteNotes(e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="ghost" onClick={() => setShowCreateDialog(false)} className="text-slate-300">
                  Cancelar
                </Button>
                <Button onClick={createInvites} disabled={creating} className="bg-emerald-600 hover:bg-emerald-700">
                  {creating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Criar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Invites List */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Códigos de Convite</CardTitle>
            <CardDescription className="text-slate-400">
              Gerir códigos de convite para beta testers
            </CardDescription>
          </CardHeader>
          <CardContent>
            {invites.length === 0 ? (
              <p className="text-center text-slate-400 py-8">Nenhum convite encontrado</p>
            ) : (
              <div className="space-y-3">
                {invites.map((invite) => (
                  <div
                    key={invite.id}
                    className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <code className="text-lg font-mono text-emerald-400 bg-slate-900/50 px-3 py-1 rounded">
                        {invite.code}
                      </code>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => copyCode(invite.code)}
                        className="text-slate-400 hover:text-white"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="flex items-center gap-4">
                      {invite.role && (
                        <Badge variant="outline" className={invite.role === 'ORGANIZER' ? 'border-lime-400 text-lime-400' : 'border-lime-400 text-lime-400'}>
                          {invite.role === 'ORGANIZER' ? 'Organizador' : 'Guarda-redes'}
                        </Badge>
                      )}
                      
                      {invite.usedAt ? (
                        <div className="text-sm">
                          <span className="text-emerald-500">Usado por </span>
                          <span className="text-white">{invite.user?.name || invite.user?.email}</span>
                          <span className="text-slate-400 ml-2">
                            {format(new Date(invite.usedAt), 'dd/MM/yyyy', { locale: pt })}
                          </span>
                        </div>
                      ) : (
                        <Badge className="bg-lime-400/20 text-blue-400 border-lime-400">
                          Disponível
                        </Badge>
                      )}

                      {invite.expiresAt && !invite.usedAt && (
                        <span className="text-xs text-slate-400">
                          Expira: {format(new Date(invite.expiresAt), 'dd/MM/yyyy', { locale: pt })}
                        </span>
                      )}

                      {!invite.usedAt && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteInvite(invite.id)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-900/200/20"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="text-slate-300"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-slate-400">
                  Página {page} de {totalPages}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="text-slate-300"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
