import type {
  RawCandidateItem,
  RawDuplicateItem,
  RawEducationEntry,
  RawExperienceEntry,
  RawUploadResumesResponse,
  CandidateEducation,
  CandidateWorkHistory,
  SuccessCandidate,
  DuplicateCandidate,
  IncompleteCandidate,
  UploadResumesResult,
  RawCandidateListResponse,
  CandidateListResult,
  RawCandidateDetailResponse,
  CandidateDetail,
  RawUploadStatusResponse,
  UploadStatusResult,
} from '../types/candidate.types';

const mapEducation = (raw: RawEducationEntry): CandidateEducation => ({
  degree: raw.degree,
  fieldOfStudy: raw.field_of_study,
  institution: raw.institution,
  startDate: raw.start_date,
  endDate: raw.end_date,
});

const mapWorkHistory = (raw: RawExperienceEntry): CandidateWorkHistory => ({
  company: raw.company,
  position: raw.position,
  location: raw.location,
  startDate: raw.start_date,
  endDate: raw.end_date,
  techUsed: raw.tech_used ?? [],
  keyResponsibilities: raw.key_responsibilities ?? [],
});

export const mapSuccessItem = (raw: RawCandidateItem): SuccessCandidate => {
  const allSkills = raw.professional_info.technical_stack_and_tools?.value ?? [];
  return {
    filename: raw.filename,
    name: raw.personal_info.full_name.value,
    jobTitle: raw.professional_info.job_title?.value ?? '',
    currentCompany: raw.professional_info.current_company?.value ?? '',
    totalExperienceYears: raw.professional_info.total_years_experience?.value ?? 0,
    email: raw.personal_info.email?.value ?? '',
    phone: raw.personal_info.phone?.value ?? '',
    location: raw.personal_info.location?.value ?? '',
    isSelected: raw.isSelected ?? false,
    topSkills: allSkills.slice(0, 3),
    allSkills,
    linkedinUrl: raw.personal_info.linkedin_url?.value ?? null,
    githubUrl: raw.personal_info.github_url?.value ?? null,
    education: (raw.professional_info.education?.value ?? []).map(mapEducation),
    workHistory: (raw.professional_info.Experience?.value ?? []).map(mapWorkHistory),
    keyResponsibilities: raw.professional_info.key_responsibilities?.value ?? [],
    resumeFilePath: raw.resume_file_path,
  };
};

export const mapDuplicateItem = (raw: RawDuplicateItem): DuplicateCandidate => ({
  ...mapSuccessItem(raw),
  duplicateReason: raw.reason ?? '',
});

export const mapIncompleteItem = (raw: RawCandidateItem): IncompleteCandidate => {
  const allSkills = raw.professional_info.technical_stack_and_tools?.value ?? [];
  return {
    filename: raw.filename,
    name: raw.personal_info.full_name.value,
    jobTitle: raw.professional_info.job_title?.value ?? '',
    currentCompany: raw.professional_info.current_company?.value ?? '',
    totalExperienceYears: raw.professional_info.total_years_experience?.value ?? 0,
    email: raw.personal_info.email?.value ?? '',
    phone: raw.personal_info.phone?.value ?? '',
    location: raw.personal_info.location?.value ?? '',
    isSelected: raw.isSelected ?? false,
    reviewReason: raw.position_relevance?.reason ?? '',
    allSkills,
    education: (raw.professional_info.education?.value ?? []).map(mapEducation),
    workHistory: (raw.professional_info.Experience?.value ?? []).map(mapWorkHistory),
    resumeFilePath: raw.resume_file_path,
  };
};

export const mapUploadResumesResponse = (raw: RawUploadResumesResponse): UploadResumesResult => ({
  successCandidates: raw.data.successExtraction.map(mapSuccessItem),
  duplicateCandidates: raw.data.duplicate.map(mapDuplicateItem),
  incompleteCandidates: raw.data.incomplete.map(mapIncompleteItem),
  rawItems: {
    successExtraction: raw.data.successExtraction,
    duplicate: raw.data.duplicate,
    incomplete: raw.data.incomplete,
  },
});

export const mapCandidateListResponse = (raw: RawCandidateListResponse): CandidateListResult => ({
  summary: {
    activeJds: raw.data.summary.active_jds ?? 0,
    strongMatch: raw.data.summary.strong_match ?? 0,
    avgMatchScore: raw.data.summary.avg_match_score ?? 0,
    pendingScoring: raw.data.summary.pending_scoring ?? 0,
    totalCandidates: raw.data.summary.total_candidates ?? 0,
    scoredCandidates: raw.data.summary.scored_candidates ?? 0,
  },
  candidates: (raw.data.candidates ?? []).map((item) => ({
    candidateId: item.candidate_id,
    jdId: item.jd_id,
    fullName: item.full_name ?? '',
    email: item.email ?? '',
    phone: item.phone ?? '',
    location: item.location ?? '',
    currentJobTitle: item.current_job_title ?? '',
    currentCompany: item.current_company ?? '',
    totalExperience: item.total_experience ?? 0,
    degree: item.degree ?? '',
    finalScore: item.final_score,
    verdict: item.verdict,
    technicalSkills: (item.technical_skills ?? []).flat(),
  })),
  pagination: raw.data.pagination != null ? {
    totalCount: raw.data.pagination.total_count,
    page: raw.data.pagination.page,
    pageSize: raw.data.pagination.page_size,
    totalPages: raw.data.pagination.total_pages,
  } : undefined,
});

export const mapUploadStatusResponse = (raw: RawUploadStatusResponse): UploadStatusResult => {
  const mapItem = (item: RawUploadStatusResponse['data']['complete'][number]) => ({
    candidateId: item.candidate_id,
    fullName: item.full_name ?? '',
    email: item.email,
    phone: item.phone,
    currentJobTitle: item.current_job_title,
    uploadStatus: item.upload_status as UploadStatusResult['complete'][number]['uploadStatus'],
    statusCode: item.status_code ?? null,
    reason: item.reason,
    createdDate: item.created_date,
  });
  return {
    complete: (raw.data.complete ?? []).map(mapItem),
    duplicate: (raw.data.duplicate ?? []).map(mapItem),
    incomplete: (raw.data.incomplete ?? []).map(mapItem),
  };
};

export const mapCandidateDetailResponse = (raw: RawCandidateDetailResponse): CandidateDetail => ({
  candidateId: raw.data.candidate_id,
  personal: {
    fullName: raw.data.personal_info.full_name ?? '',
    email: raw.data.personal_info.email ?? '',
    phone: raw.data.personal_info.phone ?? '',
    location: raw.data.personal_info.location ?? '',
    githubUrl: raw.data.personal_info.github_url,
    linkedinUrl: raw.data.personal_info.linkedin_url,
    portfolioLinks: raw.data.personal_info.portfolio_links ?? [],
  },
  professional: {
    currentCompany: raw.data.professional_info.current_company ?? '',
    currentJobTitle: raw.data.professional_info.current_job_title ?? '',
    totalExperience: raw.data.professional_info.total_experience ?? 0,
  },
  resume: {
    fileName: raw.data.resume?.file_name ?? '',
    filePath: raw.data.resume?.file_path ?? '',
  },
  skills: {
    technical: raw.data.skills?.technical ?? [],
    soft: raw.data.skills?.soft ?? [],
    core: raw.data.skills?.core ?? [],
  },
  education: (raw.data.education ?? []).map((edu) => ({
    degree: edu.degree ?? '',
    fieldOfStudy: edu.field_of_study ?? '',
    institutionName: edu.institution_name ?? '',
  })),
  experience: (raw.data.experience ?? []).map((exp) => ({
    jobTitle: exp.job_title ?? '',
    companyName: exp.company_name ?? '',
    startDate: exp.start_date,
    endDate: exp.end_date,
    responsibilities: exp.responsibilities ?? [],
  })),
  score: raw.data.score != null ? {
    scoreId: raw.data.score.score_id,
    baseScore: raw.data.score.base_score,
    finalScore: raw.data.score.final_score,
    verdict: raw.data.score.verdict,
    groupBreakdown: (raw.data.score.group_breakdown ?? []).map((g) => ({
      groupScoreId: g.group_score_id,
      groupKey: g.group_key,
      weight: g.weight,
      groupScore: g.group_score,
      finalContribution: g.final_contribution ?? 0,
      presentRequired: g.present_required ?? [],
      missingRequired: g.missing_required ?? [],
      optionalPresent: g.optional_present ?? [],
      optionalMissing: g.optional_missing ?? [],
      hrFeedback: g.hr_feedback != null
        ? { feedbackTypeId: g.hr_feedback.feedback_type_id, userFeedback: g.hr_feedback.user_feedback }
        : null,
    })),
  } : null,
  jdId: raw.data.meta?.jd_id ?? null,
  jdTitle: null,
});
