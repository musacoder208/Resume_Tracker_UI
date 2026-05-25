export const RESPONSE_CODES = {

  // ── Generic 2xx ────────────────────────────────────────────────────────────
  SUCCESS:                        'SUCCESS',
  CREATED:                        'CREATED',

  // ── Generic 4xx ────────────────────────────────────────────────────────────
  BAD_REQUEST:                    'BAD_REQUEST',
  VALIDATION_ERROR:               'VALIDATION_ERROR',
  UNAUTHORIZED:                   'UNAUTHORIZED',
  FORBIDDEN:                      'FORBIDDEN',
  NOT_FOUND:                      'NOT_FOUND',
  DUPLICATE_VALUE:                'DUPLICATE_VALUE',

  // ── Generic 5xx ────────────────────────────────────────────────────────────
  INTERNAL_SERVER_ERROR:          'INTERNAL_SERVER_ERROR',
  DB_ERROR:                       'DB_ERROR',

  // ── Auth ───────────────────────────────────────────────────────────────────
  AUTH_INVALID_CREDENTIALS:       'AUTH_INVALID_CREDENTIALS',
  AUTH_LAB_INACTIVE:              'AUTH_LAB_INACTIVE',
  AUTH_LAB_LOCKED:                'AUTH_LAB_LOCKED',
  AUTH_SESSION_EXPIRED:           'AUTH_SESSION_EXPIRED',
  AUTH_TOKEN_INVALID:             'AUTH_TOKEN_INVALID',

  // ── Enrollment — Lab Details (Tab 1) ───────────────────────────────────────
  ENROLL_LAB_NAME_DUPLICATE:      'ENROLL_LAB_NAME_DUPLICATE',
  ENROLL_NICKNAME_DUPLICATE:      'ENROLL_NICKNAME_DUPLICATE',
  ENROLL_INVALID_CYCLE:           'ENROLL_INVALID_CYCLE',
  ENROLL_LAB_SAVE_FAILED:         'ENROLL_LAB_SAVE_FAILED',
  ENROLL_LAB_NOT_FOUND:           'ENROLL_LAB_NOT_FOUND',

  // ── Enrollment — Contacts (Tab 2) ──────────────────────────────────────────
  ENROLL_CONTACT_SAVE_FAILED:     'ENROLL_CONTACT_SAVE_FAILED',
  ENROLL_CONTACT_REQUIRED:        'ENROLL_CONTACT_REQUIRED',

  // ── Enrollment — Packages (Tab 3) ──────────────────────────────────────────
  ENROLL_NO_PACKAGE_SELECTED:     'ENROLL_NO_PACKAGE_SELECTED',
  ENROLL_PACKAGE_SAVE_FAILED:     'ENROLL_PACKAGE_SAVE_FAILED',

  // ── Enrollment — Analytes (Tab 4) ──────────────────────────────────────────
  ENROLL_ANALYTE_SAVE_FAILED:     'ENROLL_ANALYTE_SAVE_FAILED',

  // ── Enrollment — Review & Freeze (Tab 5) ───────────────────────────────────
  ENROLL_ALREADY_FROZEN:          'ENROLL_ALREADY_FROZEN',
  ENROLL_FREEZE_FAILED:           'ENROLL_FREEZE_FAILED',

  // ── Enrollment — Payment ───────────────────────────────────────────────────
  ENROLL_ORDER_NOT_FOUND:         'ENROLL_ORDER_NOT_FOUND',
  ENROLL_PAYMENT_SAVE_FAILED:     'ENROLL_PAYMENT_SAVE_FAILED',
  ENROLL_RECEIPT_REQUIRED:        'ENROLL_RECEIPT_REQUIRED',
  ENROLL_RECEIPT_INVALID_TYPE:    'ENROLL_RECEIPT_INVALID_TYPE',
  ENROLL_RECEIPT_TOO_LARGE:       'ENROLL_RECEIPT_TOO_LARGE',
  ENROLL_RECEIPT_UPLOAD_FAILED:   'ENROLL_RECEIPT_UPLOAD_FAILED',

  // ── Masters ────────────────────────────────────────────────────────────────
  MASTER_FETCH_FAILED:            'MASTER_FETCH_FAILED',

} as const;

export type ResponseCode = typeof RESPONSE_CODES[keyof typeof RESPONSE_CODES];
