import { useState, useEffect } from "react";
import type { CSSProperties } from "react";
import { Plus, Pencil, Trash2, User, ChevronDown } from "lucide-react";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import { Sidebar } from "../components/layout/Sidebar";
import {
  useAthletes,
  useCreateAthlete,
  useUpdateAthlete,
  useDeleteAthlete,
  type Athlete,
  type AthleteInput,
} from "../hooks/useAthletes";

const ACCENT = "#6366f1";
const MUTED = "#a1a1aa";
const SURFACE = "#111111";
const BORDER = "#222222";
const FONT =
  "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

const SPORTS = [
  "Football",
  "Basketball",
  "Tennis",
  "Athletics",
  "Swimming",
  "Other",
] as const;

// ── Shared helpers ─────────────────────────────────────────────────────────────

function inputStyle(hasError?: boolean): CSSProperties {
  return {
    width: "100%",
    background: "#1a1a1a",
    border: `1px solid ${hasError ? "#ef4444" : "#333"}`,
    borderRadius: "0.5rem",
    padding: "0.7rem 0.875rem",
    color: "#ffffff",
    fontSize: "0.9rem",
    fontFamily: FONT,
    outline: "none",
    boxSizing: "border-box",
  };
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: "1rem" }}>
      <label
        style={{
          display: "block",
          fontSize: "0.875rem",
          fontWeight: 500,
          color: "#e4e4e7",
          marginBottom: "0.4rem",
        }}
      >
        {label}
      </label>
      {children}
      {error && (
        <p
          style={{ color: "#f87171", fontSize: "0.8rem", marginTop: "0.35rem" }}
        >
          {error}
        </p>
      )}
    </div>
  );
}

// ── Athlete card ───────────────────────────────────────────────────────────────

function AthleteCard({
  athlete,
  onEdit,
  onDelete,
}: {
  athlete: Athlete;
  onEdit: (a: Athlete) => void;
  onDelete: (a: Athlete) => void;
}) {
  return (
    <div
      style={{
        background: SURFACE,
        border: `1px solid ${BORDER}`,
        borderRadius: "0.75rem",
        padding: "1.5rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.75rem",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div>
          <p
            style={{
              fontWeight: 700,
              fontSize: "1.05rem",
              marginBottom: "0.35rem",
            }}
          >
            {athlete.name}
          </p>
          <span
            style={{
              display: "inline-block",
              padding: "0.2rem 0.6rem",
              borderRadius: "9999px",
              fontSize: "0.75rem",
              fontWeight: 500,
              background: "rgba(99,102,241,0.15)",
              color: "#818cf8",
              border: "1px solid rgba(99,102,241,0.3)",
            }}
          >
            {athlete.sport}
          </span>
        </div>
        <span style={{ color: "#444" }}>
          <User size={20} />
        </span>
      </div>

      {/* Details grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "0.5rem 1rem",
          fontSize: "0.85rem",
        }}
      >
        {athlete.position && (
          <div>
            <p style={{ color: MUTED, fontSize: "0.78rem" }}>Position</p>
            <p style={{ fontWeight: 500, marginTop: "0.15rem" }}>
              {athlete.position}
            </p>
          </div>
        )}
        {athlete.age && (
          <div>
            <p style={{ color: MUTED, fontSize: "0.78rem" }}>Age</p>
            <p style={{ fontWeight: 500, marginTop: "0.15rem" }}>
              {athlete.age}
            </p>
          </div>
        )}
        {athlete.team && (
          <div style={{ gridColumn: "1 / -1" }}>
            <p style={{ color: MUTED, fontSize: "0.78rem" }}>Team</p>
            <p style={{ fontWeight: 500, marginTop: "0.15rem" }}>
              {athlete.team}
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          paddingTop: "0.75rem",
          borderTop: `1px solid ${BORDER}`,
          marginTop: "auto",
        }}
      >
        <span style={{ fontSize: "0.78rem", color: MUTED }}>
          Added {format(new Date(athlete.created_at), "MMM d, yyyy")}
        </span>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button
            onClick={() => onEdit(athlete)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.35rem",
              padding: "0.4rem 0.75rem",
              borderRadius: "0.375rem",
              border: `1px solid ${BORDER}`,
              background: "transparent",
              color: MUTED,
              fontSize: "0.8rem",
              cursor: "pointer",
              fontFamily: FONT,
            }}
          >
            <Pencil size={13} />
            Edit
          </button>
          <button
            onClick={() => onDelete(athlete)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.35rem",
              padding: "0.4rem 0.75rem",
              borderRadius: "0.375rem",
              border: "1px solid rgba(239,68,68,0.3)",
              background: "rgba(239,68,68,0.05)",
              color: "#f87171",
              fontSize: "0.8rem",
              cursor: "pointer",
              fontFamily: FONT,
            }}
          >
            <Trash2 size={13} />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Athlete modal form ─────────────────────────────────────────────────────────

type AthleteFormData = {
  name: string;
  sport: string;
  position: string;
  age: string;
  team: string;
  notes: string;
};

function formDefaults(athlete: Athlete | null): AthleteFormData {
  if (!athlete) {
    return { name: "", sport: "", position: "", age: "", team: "", notes: "" };
  }
  return {
    name: athlete.name,
    sport: athlete.sport,
    position: athlete.position ?? "",
    age: athlete.age != null ? String(athlete.age) : "",
    team: athlete.team ?? "",
    notes: athlete.notes ?? "",
  };
}

function AthleteModal({
  editing,
  onClose,
}: {
  editing: Athlete | null;
  onClose: () => void;
}) {
  const createAthlete = useCreateAthlete();
  const updateAthlete = useUpdateAthlete();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AthleteFormData>({ defaultValues: formDefaults(editing) });

  useEffect(() => {
    reset(formDefaults(editing));
  }, [editing, reset]);

  const onSubmit = async (data: AthleteFormData) => {
    const input: AthleteInput = {
      name: data.name.trim(),
      sport: data.sport,
      position: data.position.trim() || undefined,
      age: data.age ? parseInt(data.age, 10) : null,
      team: data.team.trim() || undefined,
      notes: data.notes.trim() || undefined,
    };

    if (editing) {
      await updateAthlete.mutateAsync({ id: editing.id, input });
    } else {
      await createAthlete.mutateAsync(input);
    }
    console.log("[AthleteModal] saved, closing");
    onClose();
  };

  const mutationError =
    createAthlete.error?.message ?? updateAthlete.error?.message;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.75)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
        padding: "1rem",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#161616",
          border: "1px solid #333",
          borderRadius: "0.75rem",
          padding: "2rem",
          width: "100%",
          maxWidth: "480px",
          maxHeight: "90vh",
          overflowY: "auto",
          fontFamily: FONT,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          style={{
            fontSize: "1.15rem",
            fontWeight: 700,
            marginBottom: "1.5rem",
          }}
        >
          {editing ? "Edit Athlete" : "Add Athlete"}
        </h2>

        {mutationError && (
          <div
            style={{
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.3)",
              borderRadius: "0.5rem",
              padding: "0.75rem 1rem",
              color: "#f87171",
              fontSize: "0.875rem",
              marginBottom: "1.25rem",
            }}
          >
            {mutationError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <Field label="Name *" error={errors.name?.message}>
            <input
              type="text"
              placeholder="Marcus Johnson"
              style={inputStyle(!!errors.name)}
              {...register("name", { required: "Name is required" })}
            />
          </Field>

          <Field label="Sport *" error={errors.sport?.message}>
            <div style={{ position: "relative" }}>
              <select
                style={{
                  ...inputStyle(!!errors.sport),
                  paddingRight: "2.5rem",
                  appearance: "none",
                }}
                {...register("sport", { required: "Sport is required" })}
              >
                <option value="">Select sport…</option>
                {SPORTS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={16}
                style={{
                  position: "absolute",
                  right: "0.75rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: MUTED,
                  pointerEvents: "none",
                }}
              />
            </div>
          </Field>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1rem",
            }}
          >
            <Field label="Position" error={errors.position?.message}>
              <input
                type="text"
                placeholder="Point Guard"
                style={inputStyle(!!errors.position)}
                {...register("position")}
              />
            </Field>
            <Field label="Age" error={errors.age?.message}>
              <input
                type="number"
                placeholder="22"
                min={1}
                max={99}
                style={inputStyle(!!errors.age)}
                {...register("age", {
                  min: { value: 1, message: "Min 1" },
                  max: { value: 99, message: "Max 99" },
                })}
              />
            </Field>
          </div>

          <Field label="Team" error={errors.team?.message}>
            <input
              type="text"
              placeholder="Chicago Bulls"
              style={inputStyle(!!errors.team)}
              {...register("team")}
            />
          </Field>

          <Field label="Notes" error={errors.notes?.message}>
            <textarea
              rows={3}
              placeholder="Any additional notes…"
              style={{ ...inputStyle(!!errors.notes), resize: "vertical" }}
              {...register("notes")}
            />
          </Field>

          <div
            style={{
              display: "flex",
              gap: "0.75rem",
              justifyContent: "flex-end",
              marginTop: "0.5rem",
            }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "0.65rem 1.25rem",
                borderRadius: "0.5rem",
                border: `1px solid ${BORDER}`,
                background: "transparent",
                color: MUTED,
                fontSize: "0.875rem",
                fontFamily: FONT,
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                padding: "0.65rem 1.5rem",
                borderRadius: "0.5rem",
                border: "none",
                background: ACCENT,
                color: "#fff",
                fontSize: "0.875rem",
                fontWeight: 600,
                fontFamily: FONT,
                cursor: isSubmitting ? "not-allowed" : "pointer",
                opacity: isSubmitting ? 0.7 : 1,
              }}
            >
              {isSubmitting
                ? "Saving…"
                : editing
                  ? "Save Changes"
                  : "Add Athlete"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Delete confirm ─────────────────────────────────────────────────────────────

function DeleteConfirm({
  athlete,
  onDone,
}: {
  athlete: Athlete;
  onDone: () => void;
}) {
  const deleteAthlete = useDeleteAthlete();

  const handleConfirm = async () => {
    await deleteAthlete.mutateAsync(athlete.id);
    console.log("[DeleteConfirm] deleted:", athlete.id);
    onDone();
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.75)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
        padding: "1rem",
      }}
    >
      <div
        style={{
          background: "#161616",
          border: "1px solid #333",
          borderRadius: "0.75rem",
          padding: "2rem",
          width: "100%",
          maxWidth: "400px",
          fontFamily: FONT,
        }}
      >
        <h2
          style={{
            fontSize: "1.1rem",
            fontWeight: 700,
            marginBottom: "0.75rem",
          }}
        >
          Delete Athlete
        </h2>
        <p
          style={{
            color: MUTED,
            fontSize: "0.9rem",
            lineHeight: 1.6,
            marginBottom: "1.5rem",
          }}
        >
          Are you sure you want to delete{" "}
          <strong style={{ color: "#fff" }}>{athlete.name}</strong>? This will
          permanently remove their profile and all associated videos and
          reports.
        </p>

        {deleteAthlete.error && (
          <p
            style={{
              color: "#f87171",
              fontSize: "0.85rem",
              marginBottom: "1rem",
            }}
          >
            {deleteAthlete.error.message}
          </p>
        )}

        <div
          style={{
            display: "flex",
            gap: "0.75rem",
            justifyContent: "flex-end",
          }}
        >
          <button
            onClick={onDone}
            disabled={deleteAthlete.isPending}
            style={{
              padding: "0.6rem 1.25rem",
              borderRadius: "0.5rem",
              border: `1px solid ${BORDER}`,
              background: "transparent",
              color: MUTED,
              fontSize: "0.875rem",
              fontFamily: FONT,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={deleteAthlete.isPending}
            style={{
              padding: "0.6rem 1.25rem",
              borderRadius: "0.5rem",
              border: "none",
              background: "#dc2626",
              color: "#fff",
              fontSize: "0.875rem",
              fontWeight: 600,
              fontFamily: FONT,
              cursor: deleteAthlete.isPending ? "not-allowed" : "pointer",
              opacity: deleteAthlete.isPending ? 0.7 : 1,
            }}
          >
            {deleteAthlete.isPending ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Athletes page ──────────────────────────────────────────────────────────────

export function Athletes() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAthlete, setEditingAthlete] = useState<Athlete | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Athlete | null>(null);

  const { data: athletes, isLoading } = useAthletes();

  const openAdd = () => {
    setEditingAthlete(null);
    setModalOpen(true);
  };

  const openEdit = (athlete: Athlete) => {
    setEditingAthlete(athlete);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingAthlete(null);
  };

  const count = athletes?.length ?? 0;

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#0a0a0a",
        color: "#ffffff",
        fontFamily: FONT,
      }}
    >
      <Sidebar />

      <main style={{ flex: 1, padding: "2.5rem", overflowY: "auto" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "2rem",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <div>
            <h1
              style={{
                fontSize: "1.75rem",
                fontWeight: 700,
                letterSpacing: "-0.02em",
                marginBottom: "0.25rem",
              }}
            >
              Athletes
            </h1>
            <p style={{ color: MUTED, fontSize: "0.9rem" }}>
              {isLoading
                ? "Loading…"
                : `${count} athlete${count !== 1 ? "s" : ""}`}
            </p>
          </div>
          <button
            onClick={openAdd}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              background: ACCENT,
              color: "#fff",
              border: "none",
              padding: "0.7rem 1.25rem",
              borderRadius: "0.5rem",
              fontWeight: 600,
              fontSize: "0.9rem",
              fontFamily: FONT,
              cursor: "pointer",
            }}
          >
            <Plus size={16} />
            Add Athlete
          </button>
        </div>

        {/* Content */}
        {isLoading ? (
          <p style={{ color: MUTED, fontSize: "0.9rem" }}>Loading athletes…</p>
        ) : !athletes || athletes.length === 0 ? (
          <div
            style={{
              background: SURFACE,
              border: `1px solid ${BORDER}`,
              borderRadius: "0.75rem",
              padding: "4rem 2rem",
              textAlign: "center",
            }}
          >
            <p
              style={{
                color: MUTED,
                marginBottom: "1.25rem",
                fontSize: "0.95rem",
              }}
            >
              No athletes yet. Add your first one to get started.
            </p>
            <button
              onClick={openAdd}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                background: ACCENT,
                color: "#fff",
                border: "none",
                padding: "0.65rem 1.25rem",
                borderRadius: "0.5rem",
                fontWeight: 600,
                fontSize: "0.9rem",
                fontFamily: FONT,
                cursor: "pointer",
              }}
            >
              <Plus size={15} />
              Add Athlete
            </button>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: "1rem",
            }}
          >
            {athletes.map((athlete) => (
              <AthleteCard
                key={athlete.id}
                athlete={athlete}
                onEdit={openEdit}
                onDelete={setDeleteTarget}
              />
            ))}
          </div>
        )}
      </main>

      {modalOpen && (
        <AthleteModal editing={editingAthlete} onClose={closeModal} />
      )}

      {deleteTarget && (
        <DeleteConfirm
          athlete={deleteTarget}
          onDone={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
