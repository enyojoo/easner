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
        id: "initiated",
        title: "Initiated",
        description: "You made this transaction",
        icon: <ArrowUp className="h-5 w-5" />,
        completed: true,
        timestamp: formatTimestamp(transaction.created_at),
      },
      {
        id: "sent",
        title: "Sent",
        description: "Your transaction is on its way.",
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
      {/* Mobile: Vertical Layout */}
      <div className="flex flex-col lg:hidden space-y-6">
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
                  stage.completed ? "text-white" : "text-gray-400"
                }`}
              >
                {stage.title}
              </h3>
              {stage.timestamp && (
                <p className="text-sm text-gray-400 mb-1">{stage.timestamp}</p>
              )}
              <p className={`text-sm ${stage.completed ? "text-white" : "text-gray-500"}`}>
                {stage.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop/Tablet: Horizontal Layout */}
      <div className="hidden lg:flex items-start justify-between relative">
        {stages.map((stage, index) => (
          <div key={stage.id} className="flex flex-col items-center flex-1 relative">
            {/* Connecting Line */}
            {index < stages.length - 1 && (
              <div
                className={`absolute top-5 left-1/2 w-full h-0.5 ${
                  stage.completed ? "bg-green-500" : "bg-gray-300"
                }`}
                style={{ width: "calc(100% - 2.5rem)", marginLeft: "2.5rem" }}
              />
            )}

            {/* Icon Circle */}
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center border-2 relative z-10 ${
                stage.completed
                  ? "bg-green-500 border-green-500 text-white"
                  : "bg-gray-200 border-gray-300 text-gray-500"
              }`}
            >
              {stage.icon}
            </div>

            {/* Content */}
            <div className="mt-4 text-center w-full max-w-[200px]">
              <h3
                className={`font-semibold text-base mb-1 ${
                  stage.completed ? "text-white" : "text-gray-400"
                }`}
              >
                {stage.title}
              </h3>
              {stage.timestamp && (
                <p className="text-sm text-gray-400 mb-1">{stage.timestamp}</p>
              )}
              <p className={`text-sm ${stage.completed ? "text-white" : "text-gray-500"}`}>
                {stage.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

