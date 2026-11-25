BEGIN;

ALTER TABLE public.reportissues
  ALTER COLUMN status SET DEFAULT 'submitted',
  ADD COLUMN priority text;

ALTER TABLE public.reportissues
  ADD CONSTRAINT reportissues_status_check
    CHECK (
      status IS NULL
      OR status IN (
        'pending',
        'submitted',
        'under_review',
        'assigned',
        'in_progress',
        'resolved',
        'closed',
        'rejected'
      )
    ),
  ADD CONSTRAINT reportissues_priority_check
    CHECK (
      priority IS NULL
      OR priority IN ('low', 'medium', 'high', 'critical')
    );

CREATE TABLE public.issue_status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_id uuid NOT NULL
    REFERENCES public.reportissues(id) ON DELETE RESTRICT,
  previous_status text
    CHECK (
      previous_status IS NULL
      OR previous_status IN (
        'pending',
        'submitted',
        'under_review',
        'assigned',
        'in_progress',
        'resolved',
        'closed',
        'rejected'
      )
    ),
  new_status text NOT NULL
    CHECK (
      new_status IN (
        'submitted',
        'under_review',
        'assigned',
        'in_progress',
        'resolved',
        'closed',
        'rejected'
      )
    ),
  changed_by text NOT NULL
    REFERENCES public."user"(id) ON DELETE RESTRICT,
  public_message text,
  internal_reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.department_staff_members (
  department_id uuid NOT NULL
    REFERENCES public.departments(id) ON DELETE RESTRICT,
  staff_id text NOT NULL
    REFERENCES public."user"(id) ON DELETE RESTRICT,
  added_by text NOT NULL
    REFERENCES public."user"(id) ON DELETE RESTRICT,
  deactivated_by text
    REFERENCES public."user"(id) ON DELETE SET NULL,
  is_active boolean NOT NULL DEFAULT true,
  deactivated_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (department_id, staff_id),
  CONSTRAINT department_staff_members_deactivation_check
    CHECK (
      (is_active AND deactivated_at IS NULL)
      OR (NOT is_active AND deactivated_at IS NOT NULL)
    )
);

CREATE TABLE public.issue_completion_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_id uuid NOT NULL
    REFERENCES public.reportissues(id) ON DELETE RESTRICT,
  uploaded_by text NOT NULL
    REFERENCES public."user"(id) ON DELETE RESTRICT,
  image_url text NOT NULL,
  public_id text NOT NULL UNIQUE,
  mime_type text NOT NULL
    CHECK (mime_type IN ('image/jpeg', 'image/png', 'image/webp')),
  file_size_bytes integer NOT NULL
    CHECK (file_size_bytes > 0 AND file_size_bytes <= 5242880),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX issue_status_history_issue_created_idx
  ON public.issue_status_history (issue_id, created_at, id);

CREATE INDEX issue_status_history_changed_by_idx
  ON public.issue_status_history (changed_by, created_at DESC);

CREATE INDEX department_staff_members_active_department_idx
  ON public.department_staff_members (department_id, staff_id)
  WHERE is_active;

CREATE INDEX department_staff_members_active_staff_idx
  ON public.department_staff_members (staff_id, department_id)
  WHERE is_active;

CREATE INDEX issue_completion_photos_issue_created_idx
  ON public.issue_completion_photos (issue_id, created_at, id);

CREATE INDEX reportissues_reporter_created_idx
  ON public.reportissues (reporter_id, created_at DESC);

CREATE INDEX reportissues_status_created_idx
  ON public.reportissues (status, created_at DESC);

-- This migration does not backfill history or priority values for existing issues.
-- Roll back the application first if needed. Keep these additive schema objects and
-- their data; do not DROP them as part of an application rollback.

COMMIT;
