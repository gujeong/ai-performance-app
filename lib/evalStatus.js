export function getEvalStatus(record, comments) {
  if ((record.score || 0) > 0) return 'finalized'
  if (!comments || comments.length === 0) return 'submitted'
  const last = comments[comments.length - 1]
  return last.author_role === 'evaluator' ? 'revision_requested' : 'resubmitted'
}

export const EVAL_STATUS_LABEL = {
  submitted: '제출',
  revision_requested: '보완 요청(평가 보류)',
  resubmitted: '재검토 요청',
  finalized: '평가완료',
}

export function canSubmitterReply(record, comments) {
  if ((record.score || 0) > 0) return false
  const last = comments?.[comments.length - 1]
  return last?.author_role === 'evaluator'
}

/** 평가 완료 시 record.feedback과 중복되는 평가자 코멘트 제외 */
export function filterDisplayComments(record, comments) {
  const status = getEvalStatus(record, comments)
  if (status !== 'finalized' || !(record.feedback || '').trim()) return comments || []
  const feedback = record.feedback.trim()
  return (comments || []).filter(c => {
    if (c.author_role === 'evaluator' && (c.message || '').trim() === feedback) return false
    return true
  })
}

export function shouldShowFinalFeedback(record, comments) {
  return getEvalStatus(record, comments) === 'finalized' && !!(record.feedback || '').trim()
}

export function countRecordsByEvalStatus(records, commentsByRecord) {
  const counts = { submitted: 0, revision_requested: 0, resubmitted: 0, finalized: 0 }
  for (const record of records) {
    const status = getEvalStatus(record, commentsByRecord[record.id] || [])
    counts[status] += 1
  }
  return counts
}
