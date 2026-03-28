"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import PageHeader from "@/components/dashboard/page-header"
import { Skeleton } from "@/components/ui/skeleton"

export default function AdminTicketDetailPage() {
  const params = useParams()
  const id = params.id as string
  const [ticket, setTicket] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadTicket = async () => {
      try {
        const res = await fetch(`/api/admin/tickets/${id}`)
        const data = await res.json()
        setTicket(data)
      } catch (error) {
        console.error("[v0] Error loading ticket:", error)
      } finally {
        setLoading(false)
      }
    }

    loadTicket()
  }, [id])

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      critical: "bg-red-100 text-red-700",
      high: "bg-orange-100 text-orange-700",
      medium: "bg-yellow-100 text-yellow-700",
      low: "bg-blue-100 text-blue-700",
    }
    return colors[priority] || "bg-gray-100 text-gray-700"
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      open: "bg-blue-100 text-blue-700",
      in_progress: "bg-purple-100 text-purple-700",
      resolved: "bg-green-100 text-green-700",
      closed: "bg-gray-100 text-gray-700",
    }
    return colors[status] || "bg-gray-100 text-gray-700"
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Loading Ticket..."
          showBackButton
          backHref="/admin/tickets"
        />
        <div className="space-y-4 max-w-4xl">
          <Skeleton className="h-8 w-3/4" />
          <div className="grid grid-cols-4 gap-4">
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
          </div>
          <Skeleton className="h-40" />
        </div>
      </div>
    )
  }

  if (!ticket) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Ticket Not Found"
          description="The requested ticket could not be found"
          showBackButton
          backHref="/admin/tickets"
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={ticket.subject}
        description={`Ticket ID: ${ticket._id}`}
        showBackButton
        backHref="/admin/tickets"
        actions={
          <Button asChild size="sm">
            <Link href={`/admin/tickets/${id}/reply`}>Reply</Link>
          </Button>
        }
      />

              <div className="grid grid-cols-4 gap-4">
                <div className="bg-card border border-border rounded-lg p-4">
                  <p className="text-xs text-muted-foreground mb-1">Priority</p>
                  <span className={`px-2 py-1 rounded text-xs ${getPriorityColor(ticket.priority)}`}>
                    {ticket.priority}
                  </span>
                </div>
                <div className="bg-card border border-border rounded-lg p-4">
                  <p className="text-xs text-muted-foreground mb-1">Status</p>
                  <span className={`px-2 py-1 rounded text-xs ${getStatusColor(ticket.status)}`}>{ticket.status}</span>
                </div>
                <div className="bg-card border border-border rounded-lg p-4">
                  <p className="text-xs text-muted-foreground mb-1">Created</p>
                  <p className="text-xs font-medium">{new Date(ticket.created_at).toLocaleDateString()}</p>
                </div>
                <div className="bg-card border border-border rounded-lg p-4">
                  <p className="text-xs text-muted-foreground mb-1">User</p>
                  <p className="text-xs font-medium truncate">{ticket.user?.email || "N/A"}</p>
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg p-6">
                <h2 className="text-lg font-semibold text-foreground mb-3">Description</h2>
                <p className="text-sm text-foreground leading-relaxed">{ticket.description}</p>
              </div>

    </div>
  )
}
