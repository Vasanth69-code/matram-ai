import type { CivicIssue, Language } from "../types"
import { StatusBadge, PriorityBadge, SLABadge } from "./StatusBadge"
import { CATEGORY_ICONS } from "./CategoryIcons"
import { generateCivicReportPDF } from "../services/pdfReportService"

interface ComplaintCardProps {
  complaint: CivicIssue
  lang?: Language
  onClick?: () => void
  compact?: boolean
}

export function ComplaintCard({
  complaint,
  lang = "en",
  onClick,
  compact = false,
}: ComplaintCardProps) {
  const Icon = CATEGORY_ICONS[complaint.category]
  const isTamil = lang === "ta"

  const dateStr = new Date(complaint.submittedAt).toLocaleDateString(
    lang === "ta" ? "ta-IN" : "en-IN",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    },
  )

  const isResolved = complaint.status === "resolved"

  return (
    <div className="w-full bg-white border border-[#d0d5e2] rounded-3xl p-5 hover:border-[#1c3a6e] hover:shadow-md transition-all duration-150 group space-y-3.5">
      {/* Resolved Before & After Photo Comparison */}
      {isResolved && complaint.resolvedImageUrl ? (
        <div className="grid grid-cols-2 gap-2 rounded-2xl overflow-hidden border border-emerald-200 bg-emerald-50/40 p-1.5">
          <div className="relative rounded-xl overflow-hidden h-28 bg-black">
            <img
              src={complaint.imageUrl || complaint.resolvedImageUrl}
              alt="Before"
              className="w-full h-full object-cover"
            />
            <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
              📸 Before
            </span>
          </div>
          <div className="relative rounded-xl overflow-hidden h-28 bg-emerald-950">
            <img
              src={complaint.resolvedImageUrl}
              alt="After Proof"
              className="w-full h-full object-cover"
            />
            <span className="absolute bottom-1 left-1 bg-emerald-700 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
              ✓ Resolved After
            </span>
          </div>
        </div>
      ) : complaint.imageUrl ? (
        <div className="w-full h-44 rounded-2xl overflow-hidden border border-gray-200 bg-gray-100 relative">
          <img
            src={complaint.imageUrl}
            alt={complaint.title}
            className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-200"
          />
          <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold rounded-md">
            📍 {complaint.district || "Incident Site"}
          </div>
        </div>
      ) : null}

      <div className="flex items-start gap-3.5">
        {!complaint.imageUrl && !complaint.resolvedImageUrl && (
          <div className="flex-shrink-0 w-12 h-12 bg-[#e8eef8] rounded-2xl flex items-center justify-center text-[#1c3a6e] text-xl font-bold">
            {Icon}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <button
              onClick={onClick}
              className="text-left font-extrabold text-sm text-[#0c1a30] hover:text-[#1c3a6e] transition-colors line-clamp-1 cursor-pointer"
            >
              {isTamil && complaint.titleTa ? complaint.titleTa : complaint.title}
            </button>
            <span className="text-[10px] font-mono font-bold text-[#1c3a6e] bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-200 shrink-0">
              {complaint.id}
            </span>
          </div>

          <p className="text-xs text-[#64748b] mb-2.5 line-clamp-1 flex items-center gap-1">
            <span>📍</span> {complaint.address}
          </p>

          <div className="flex flex-wrap gap-1.5 items-center">
            <StatusBadge status={complaint.status} lang={lang} size="sm" />
            <PriorityBadge priority={complaint.priority} lang={lang} size="sm" />
            <SLABadge
              hoursRemaining={complaint.slaRemainingHours}
              breached={complaint.slaBreached}
              lang={lang}
              size="sm"
            />
          </div>
        </div>
      </div>

      {/* Action Footer with PDF Download & View Dossier */}
      {!compact && (
        <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => generateCivicReportPDF(complaint, lang)}
              className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
              title="Download Official PDF Report"
            >
              <span>📥</span>
              <span>PDF</span>
            </button>
            <button
              type="button"
              onClick={onClick}
              className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-[#1c3a6e] border border-blue-200 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
            >
              View Details →
            </button>
          </div>

          <div className="flex items-center gap-2.5 text-[11px]">
            <span className="font-semibold text-emerald-700">
              👍 {complaint.upvotes || 1}
            </span>
            <span className="font-mono text-gray-400">
              {dateStr}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
