import Link from 'next/link'
import React from 'react'

interface EmptyStateProps {
  icon: React.ReactNode
  title: string
  description: string
  action?: {
    label: string
    href: string
  }
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-white px-6 py-16 text-center">
      <div className="mb-4 flex items-center justify-center text-gray-300">
        {icon}
      </div>
      <h3 className="mb-1 text-base font-medium text-gray-700">{title}</h3>
      <p className="mb-6 max-w-xs text-sm text-muted-foreground">{description}</p>
      {action && (
        <Link
          href={action.href}
          className="inline-flex items-center justify-center rounded-lg bg-[#1b4332] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#2d6a4f] transition-colors"
        >
          {action.label}
        </Link>
      )}
    </div>
  )
}
