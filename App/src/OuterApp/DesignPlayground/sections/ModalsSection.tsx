import React, { useState } from "react";
import GradientButton from "@/InnerApp/components/GradientButton";
import { Section, CodeBlock } from "../_shared";

const ModalsSection: React.FC = () => {
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <Section title="Modals" description="Confirm dialog pattern.">
      <GradientButton onClick={() => setShowConfirm(true)}>
        Open Confirm Modal
      </GradientButton>

      {showConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div
            className="pg-glass-strong w-full max-w-md p-6 rounded-2xl border border-line-glass shadow-elevated"
            style={{
              backdropFilter: "blur(16px)",
            }}
          >
            <h3 className="text-lg font-semibold text-white mb-2">
              Confirm Action
            </h3>
            <p className="text-content-muted text-sm mb-6">
              Are you sure you want to proceed? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <GradientButton
                variant="secondary"
                onClick={() => setShowConfirm(false)}
              >
                Cancel
              </GradientButton>
              <GradientButton
                variant="danger"
                onClick={() => setShowConfirm(false)}
              >
                Confirm
              </GradientButton>
            </div>
          </div>
        </div>
      )}

      <CodeBlock
        label="Confirm modal code"
        code={`import GradientButton from "@/InnerApp/components/GradientButton";

const [showConfirm, setShowConfirm] = useState(false);

{/* Trigger */}
<GradientButton onClick={() => setShowConfirm(true)}>
  Open Confirm Modal
</GradientButton>

{/* Modal */}
{showConfirm && (
  <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
    <div
      className="w-full max-w-md p-6 rounded-2xl border border-line-glass shadow-elevated"
      style={{
        background: "rgba(20,20,30,0.9)",
        backdropFilter: "blur(16px)",
      }}
    >
      <h3 className="text-lg font-semibold text-white mb-2">Confirm Action</h3>
      <p className="text-content-muted text-sm mb-6">
        Are you sure you want to proceed?
      </p>
      <div className="flex justify-end gap-3">
        <GradientButton variant="secondary" onClick={() => setShowConfirm(false)}>
          Cancel
        </GradientButton>
        <GradientButton variant="danger" onClick={() => setShowConfirm(false)}>
          Confirm
        </GradientButton>
      </div>
    </div>
  </div>
)}`}
      />
    </Section>
  );
};

export default ModalsSection;
