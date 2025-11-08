"use client"

import { ArrowUp, ArrowRight, Check } from "lucide-react"
import type { Transaction } from "@/types"

interface TimelineStage {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  completed: boolean
  timestamp: string
}

interface TransactionTimelineProps {
  transaction: Transaction
}

export function TransactionTimeline({ transaction }: TransactionTimelineProps) {
  const formatTimestamp = (dateString: string) => {
    const date = new Date(dateString)
    const month = date.toLocaleString("en-US", { month: "short" })
    const day = date.getDate().toString().padStart(2, "0")
    const year = date.getFullYear()
    const hours = date.getHours()
    const minutes = date.getMinutes().toString().padStart(2, "0")
    const ampm = hours >= 12 ? "PM" : "AM"
    const displayHours = hours % 12 || 12
    // Format: "Nov 05, 2025 • 2:22 PM"
    return `${month} ${day}, ${year} • ${displayHours}:${minutes} ${ampm}`
  }

  const getStages = (): TimelineStage[] => {
    const status = transaction.status

    const stages: TimelineStage[] = [
      {
        id: "pending",
        title: "Initiated",
        description: "Pending payment confirmation",
        icon: <ArrowUp className="h-5 w-5" />,
        completed: true,
        timestamp: formatTimestamp(transaction.created_at),
      },
      {
        id: "processing",
        title: "Processing",
        description: "Your money is on its way.",
        icon: <ArrowRight className="h-5 w-5" />,
        completed: status === "processing" || status === "completed",
        timestamp:
          status === "processing" || status === "completed"
            ? formatTimestamp(transaction.updated_at)
            : "",
      },
      {
        id: "completed",
        title: "Completed",
        description: transaction.recipient?.bank_name
          ? `${transaction.recipient.bank_name} received your transaction.`
          : "Transaction completed successfully.",
        icon: <Check className="h-5 w-5" />,
        completed: status === "completed",
        timestamp:
          status === "completed"
            ? formatTimestamp(transaction.completed_at || transaction.updated_at)
            : "",
      },
    ]

    return stages
  }

  const stages = getStages()

  return (
    <div className="w-full">
      <div className="flex flex-col space-y-6">
        {stages.map((stage, index) => (
          <div key={stage.id} className="flex items-start gap-4">
            {/* Timeline Line - Left side */}
            <div className="flex flex-col items-center">
              {/* Icon Circle */}
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                  stage.completed
                    ? "bg-green-500 border-green-500 text-white"
                    : "bg-gray-200 border-gray-300 text-gray-500"
                }`}
              >
                {stage.icon}
              </div>
              {/* Connecting Line */}
              {index < stages.length - 1 && (
                <div
                  className={`w-0.5 h-12 mt-2 ${
                    stage.completed ? "bg-green-500" : "bg-gray-300"
                  }`}
                />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 pt-1">
              <h3
                className={`font-semibold text-base mb-1 ${
                  stage.completed ? "text-gray-900" : "text-gray-500"
                }`}
              >
                {stage.title}
              </h3>
              {stage.timestamp && (
                <p className="text-sm text-gray-500 mb-1">{stage.timestamp}</p>
              )}
              <p className={`text-sm ${stage.completed ? "text-gray-700" : "text-gray-500"}`}>
                {stage.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

